const KHALTI_BASE = process.env.KHALTI_BASE_URL || "https://dev.khalti.com/api/v2";
const KHALTI_KEY = process.env.KHALTI_SECRET_KEY || "test_secret_key_xxxxxxxxxxxxxxxx";

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
