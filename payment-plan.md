# Khalti Payment Integration

Complete guide for integrating Khalti Payment Gateway into a wallpaper/image marketplace — backend with **Bun + Hono** and mobile client with **Bun + Expo**.

---

## Table of Contents

1. [Overview](#overview)
2. [Schema Changes](#schema-changes)
3. [Environment Setup](#environment-setup)
4. [Backend (Bun + Hono)](#backend-bun--hono)
   - [Install Dependencies](#install-dependencies)
   - [Khalti Service](#khalti-service)
   - [Payment Routes](#payment-routes)
   - [Callback & Lookup Route](#callback--lookup-route)
   - [Download Route](#download-route)
5. [Mobile Client (Bun + Expo)](#mobile-client-bun--expo)
   - [Install Dependencies](#install-dependencies-1)
   - [Initiate Payment](#initiate-payment)
   - [WebView Checkout](#webview-checkout)
   - [My Downloads Screen](#my-downloads-screen)
6. [Payment Flow Diagram](#payment-flow-diagram)
7. [Sandbox Testing](#sandbox-testing)
8. [Error Handling Reference](#error-handling-reference)
9. [Going Live](#going-live)

---

## Overview

| Feature             | Detail                                                    |
| ------------------- | --------------------------------------------------------- |
| Gateway             | Khalti ePayment (KPG v2)                                  |
| Currency            | NPR — amounts always in **Paisa** (1 NPR = 100 Paisa)     |
| Flow                | Initiate → Redirect to pay.khalti.com → Callback → Lookup |
| Sandbox base URL    | `https://dev.khalti.com/api/v2/`                          |
| Production base URL | `https://khalti.com/api/v2/`                              |

---

## Schema Changes

Three new models and additions to existing models:

| Model                             | Purpose                                                  |
| --------------------------------- | -------------------------------------------------------- |
| `Payment`                         | Stores every Khalti session (`pidx`, status, amount)     |
| `Download`                        | Grants a user access to download an image (free or paid) |
| `Image.isPremium` / `Image.price` | Marks an image as premium and sets price in Paisa        |

Run migrations after applying the updated `schema.prisma`:

```bash
bunx prisma migrate dev --name add_khalti_payments
bunx prisma generate
```

---

## Environment Setup

Add the following to your `.env`:

```env
# Khalti
KHALTI_SECRET_KEY=live_secret_key_xxxxxxxxxxxxxxxxxxxx   # from test-admin.khalti.com (sandbox)
KHALTI_BASE_URL=https://dev.khalti.com/api/v2            # change to https://khalti.com/api/v2 in prod

# App URLs — used for Khalti callbacks
BACKEND_URL=https://your-api.example.com
WEBSITE_URL=https://your-app.example.com
```

---

## Backend (Bun + Hono)

### Install Dependencies

```bash
bun add hono @hono/node-server @prisma/client
bun add -d prisma @types/bun
```

### Khalti Service

Create `src/services/khalti.service.ts`:

```typescript
const KHALTI_BASE = process.env.KHALTI_BASE_URL!;
const KHALTI_KEY = process.env.KHALTI_SECRET_KEY!;

const headers = {
  Authorization: `Key ${KHALTI_KEY}`,
  "Content-Type": "application/json",
};

export interface InitiatePayload {
  return_url: string;
  website_url: string;
  amount: number; // in Paisa
  purchase_order_id: string;
  purchase_order_name: string;
  customer_info?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface KhaltiInitResponse {
  pidx: string;
  payment_url: string;
  expires_at: string;
  expires_in: number;
}

export interface KhaltiLookupResponse {
  pidx: string;
  total_amount: number;
  status: string; // "Completed" | "Pending" | "Initiated" | "Refunded" | "Expired" | "User canceled"
  transaction_id: string | null;
  fee: number;
  refunded: boolean;
}

/** Step 1 — Initiate a payment request (server-side only) */
export async function initiatePayment(
  payload: InitiatePayload,
): Promise<KhaltiInitResponse> {
  const res = await fetch(`${KHALTI_BASE}/epayment/initiate/`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Khalti initiate failed: ${JSON.stringify(err)}`);
  }

  return res.json();
}

/** Step 2 — Lookup / verify a payment after callback (server-side only) */
export async function lookupPayment(
  pidx: string,
): Promise<KhaltiLookupResponse> {
  const res = await fetch(`${KHALTI_BASE}/epayment/lookup/`, {
    method: "POST",
    headers,
    body: JSON.stringify({ pidx }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Khalti lookup failed: ${JSON.stringify(err)}`);
  }

  return res.json();
}
```

### Payment Routes

Create `src/routes/payment.ts`:

```typescript
import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { initiatePayment } from "../services/khalti.service";

const app = new Hono();
const prisma = new PrismaClient();

/**
 * POST /api/payments/initiate
 * Body: { imageId: string }
 * Returns: { paymentUrl: string, pidx: string }
 */
app.post("/initiate", async (c) => {
  // Replace with your auth middleware result
  const userId = c.get("userId") as string;

  const { imageId } = await c.req.json<{ imageId: string }>();

  // 1. Fetch image
  const image = await prisma.image.findUnique({ where: { id: imageId } });
  if (!image) return c.json({ error: "Image not found" }, 404);
  if (!image.isPremium)
    return c.json(
      { error: "Image is free — use the free download endpoint" },
      400,
    );
  if (!image.price) return c.json({ error: "Image price not set" }, 400);

  // 2. Check if user already purchased
  const existing = await prisma.download.findUnique({
    where: { userId_imageId: { userId, imageId } },
  });
  if (existing) return c.json({ error: "Already purchased" }, 409);

  // 3. Fetch user info for customer_info
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return c.json({ error: "User not found" }, 404);

  // 4. Create a Payment record (INITIATED)
  const purchaseOrderId = `IMG-${randomUUID()}`;
  const payment = await prisma.payment.create({
    data: {
      userId,
      imageId,
      pidx: "PENDING", // updated after Khalti responds
      purchaseOrderId,
      amount: image.price,
      status: "INITIATED",
    },
  });

  // 5. Call Khalti
  const khaltiRes = await initiatePayment({
    return_url: `${process.env.BACKEND_URL}/api/payments/callback`,
    website_url: process.env.WEBSITE_URL!,
    amount: image.price,
    purchase_order_id: purchaseOrderId,
    purchase_order_name: image.title ?? `Image #${image.id}`,
    customer_info: {
      name: user.name,
      email: user.email,
    },
  });

  // 6. Save pidx
  await prisma.payment.update({
    where: { id: payment.id },
    data: { pidx: khaltiRes.pidx },
  });

  return c.json({
    paymentUrl: khaltiRes.payment_url,
    pidx: khaltiRes.pidx,
  });
});

export default app;
```

### Callback & Lookup Route

Add to `src/routes/payment.ts`:

```typescript
/**
 * GET /api/payments/callback
 * Khalti redirects here after payment.
 * Query params: pidx, txnId, amount, status, purchase_order_id, ...
 *
 * IMPORTANT: Always verify via the lookup API — never trust the callback params alone.
 */
app.get("/callback", async (c) => {
  const { pidx, status, purchase_order_id } = c.req.query();

  if (!pidx) return c.json({ error: "Missing pidx" }, 400);

  // 1. Find the payment record
  const payment = await prisma.payment.findUnique({ where: { pidx } });
  if (!payment) return c.json({ error: "Payment record not found" }, 404);

  // 2. Lookup to get authoritative status from Khalti
  const lookup = await lookupPayment(pidx);

  // 3. Map Khalti status → our enum
  const statusMap: Record<string, string> = {
    Completed: "COMPLETED",
    Pending: "PENDING",
    Initiated: "INITIATED",
    Refunded: "REFUNDED",
    Expired: "EXPIRED",
    "User canceled": "USER_CANCELED",
  };
  const newStatus = statusMap[lookup.status] ?? "FAILED";

  // 4. Update payment
  await prisma.payment.update({
    where: { pidx },
    data: {
      status: newStatus as any,
      transactionId: lookup.transaction_id ?? undefined,
    },
  });

  // 5. Grant download access if completed
  if (newStatus === "COMPLETED") {
    await prisma.download.upsert({
      where: {
        userId_imageId: {
          userId: payment.userId,
          imageId: payment.imageId,
        },
      },
      create: {
        userId: payment.userId,
        imageId: payment.imageId,
        paymentId: payment.id,
      },
      update: {}, // already exists — do nothing
    });
  }

  // 6. Redirect back to app (deep link or web URL)
  const redirectBase = process.env.WEBSITE_URL!;
  if (newStatus === "COMPLETED") {
    return c.redirect(
      `${redirectBase}/payment/success?imageId=${payment.imageId}`,
    );
  }
  return c.redirect(`${redirectBase}/payment/failed?reason=${lookup.status}`);
});
```

### Download Route

Add to `src/routes/payment.ts` (or a dedicated downloads router):

```typescript
/**
 * POST /api/downloads/free
 * Body: { imageId: string }
 * Grants download access for a free image.
 */
app.post("/downloads/free", async (c) => {
  const userId = c.get("userId") as string;
  const { imageId } = await c.req.json<{ imageId: string }>();

  const image = await prisma.image.findUnique({ where: { id: imageId } });
  if (!image) return c.json({ error: "Image not found" }, 404);
  if (image.isPremium)
    return c.json({ error: "Image is premium — purchase first" }, 403);

  await prisma.download.upsert({
    where: { userId_imageId: { userId, imageId } },
    create: { userId, imageId },
    update: {},
  });

  return c.json({ success: true, imageUrl: image.url });
});

/**
 * GET /api/downloads
 * Returns all images the authenticated user has downloaded.
 */
app.get("/downloads", async (c) => {
  const userId = c.get("userId") as string;

  const downloads = await prisma.download.findMany({
    where: { userId },
    include: { image: true },
    orderBy: { createdAt: "desc" },
  });

  return c.json(downloads);
});
```

Register the router in your main `src/index.ts`:

```typescript
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import paymentRouter from "./routes/payment";

const app = new Hono();

app.route("/api/payments", paymentRouter);

serve({ fetch: app.fetch, port: 3000 });
```

---

## Mobile Client (Bun + Expo)

### Install Dependencies

```bash
bun add axios expo-web-browser react-native-webview
```

For deep link handling, ensure your app scheme is set in `app.json`:

```json
{
  "expo": {
    "scheme": "mywallpaperapp"
  }
}
```

### Initiate Payment

```typescript
// hooks/useKhaltiPayment.ts
import axios from "axios";
import * as Linking from "expo-linking";

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export function useKhaltiPayment() {
  async function buyImage(imageId: string) {
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/payments/initiate`,
        { imageId },
        { headers: { Authorization: `Bearer ${yourAuthToken}` } },
      );

      // Navigate to WebView with the Khalti payment URL
      return { paymentUrl: data.paymentUrl, pidx: data.pidx };
    } catch (err: any) {
      throw new Error(err.response?.data?.error ?? "Payment initiation failed");
    }
  }

  return { buyImage };
}
```

### WebView Checkout

```tsx
// screens/KhaltiWebViewScreen.tsx
import React, { useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function KhaltiWebViewScreen() {
  const { paymentUrl, imageId } = useLocalSearchParams<{
    paymentUrl: string;
    imageId: string;
  }>();
  const router = useRouter();

  function handleNavigationChange(nav: WebViewNavigation) {
    const url = nav.url;

    // Detect redirect back to our return_url
    if (url.includes("/payment/success")) {
      router.replace(`/downloads?highlight=${imageId}`);
    } else if (url.includes("/payment/failed")) {
      router.back();
    }
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handleNavigationChange}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator style={StyleSheet.absoluteFill} size="large" />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
```

Navigate to this screen from your image detail page:

```tsx
// In your ImageDetail screen
import { useKhaltiPayment } from "@/hooks/useKhaltiPayment";
import { useRouter } from "expo-router";

const { buyImage } = useKhaltiPayment();
const router = useRouter();

async function handleBuy() {
  const { paymentUrl, pidx } = await buyImage(image.id);
  router.push({
    pathname: "/khalti-webview",
    params: { paymentUrl, imageId: image.id },
  });
}
```

### My Downloads Screen

```tsx
// screens/DownloadsScreen.tsx
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import axios from "axios";

interface DownloadedImage {
  id: string;
  createdAt: string;
  image: {
    id: string;
    url: string;
    title?: string;
  };
}

export default function DownloadsScreen() {
  const [downloads, setDownloads] = useState<DownloadedImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${process.env.EXPO_PUBLIC_API_URL}/api/downloads`, {
        headers: { Authorization: `Bearer ${yourAuthToken}` },
      })
      .then((r) => setDownloads(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Text style={styles.center}>Loading...</Text>;

  return (
    <FlatList
      data={downloads}
      keyExtractor={(d) => d.id}
      numColumns={2}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image source={{ uri: item.image.url }} style={styles.thumb} />
          <Text style={styles.label}>{item.image.title ?? "Wallpaper"}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.center}>No downloads yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, margin: 6 },
  thumb: {
    width: "100%",
    aspectRatio: 0.75,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  label: { marginTop: 4, fontSize: 12, textAlign: "center" },
  center: { marginTop: 40, textAlign: "center", color: "#888" },
});
```

---

## Payment Flow Diagram

```
User taps "Buy"
       │
       ▼
POST /api/payments/initiate           ← server-side only (secret key never on client)
       │
       ├── Creates Payment record (status: INITIATED)
       ├── Calls Khalti /epayment/initiate/
       └── Returns { paymentUrl, pidx }
                  │
                  ▼
        WebView opens pay.khalti.com
                  │
         User completes payment
                  │
                  ▼
GET /api/payments/callback?pidx=...   ← Khalti redirects here
       │
       ├── Calls Khalti /epayment/lookup/   ← authoritative status check
       ├── Updates Payment status
       ├── If COMPLETED → creates Download record
       └── Redirects to success/failure URL
                  │
                  ▼
         WebView detects redirect
         App navigates to Downloads
```

---

## Sandbox Testing

1. Sign up at [test-admin.khalti.com](https://test-admin.khalti.com/#/join/merchant)
2. Use OTP `987654` for all sandbox logins
3. Set `KHALTI_SECRET_KEY` to your sandbox `live_secret_key`
4. Set `KHALTI_BASE_URL=https://dev.khalti.com/api/v2`

**Test credentials for the payment page:**

| Field     | Value                       |
| --------- | --------------------------- |
| Khalti ID | `9800000000` – `9800000005` |
| MPIN      | `1111`                      |
| OTP       | `987654`                    |

> **Note:** In sandbox mode, transactions are capped at NPR 200 per transaction.

---

## Error Handling Reference

| Khalti Status        | Our `PaymentStatus` | Action                      |
| -------------------- | ------------------- | --------------------------- |
| `Completed`          | `COMPLETED`         | Grant download              |
| `Pending`            | `PENDING`           | Re-check later via lookup   |
| `User canceled`      | `USER_CANCELED`     | Show cancellation message   |
| `Expired`            | `EXPIRED`           | Ask user to retry           |
| `Refunded`           | `REFUNDED`          | Revoke download if needed   |
| HTTP 4xx on initiate | —                   | Show error, do not redirect |

Always call the **lookup API** after every callback — never rely solely on callback query params.

---

## Going Live

1. Complete merchant KYC at [admin.khalti.com](https://admin.khalti.com)
2. Submit required documents: Company Registration, PAN/VAT Certificate, Tax Clearance, Logo
3. Replace `KHALTI_SECRET_KEY` with your **production** live secret key
4. Change `KHALTI_BASE_URL` to `https://khalti.com/api/v2`
5. Update `BACKEND_URL` and `WEBSITE_URL` to your production domains
6. Ensure your callback endpoint is accessible over HTTPS

> Payment links expire in **60 minutes** in production. Do not store `payment_url` for later use.
