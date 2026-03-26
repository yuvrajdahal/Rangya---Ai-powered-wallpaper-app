import { PaymentRepository } from "./payment.repo";
import { randomUUID } from "crypto";
import { initiatePayment, lookupPayment } from "../../services/khalti.service";

export class PaymentService {
  private repo = new PaymentRepository();

  async initiate(userId: string, imageId: string, websiteUrl: string, backendUrl: string) {
    const image = await this.repo.findImageById(imageId);
    if (!image) throw new Error("Image not found");
    if (!(image as any).isPremium) throw new Error("Image is free — use the free download endpoint");
    if (!(image as any).price) throw new Error("Image price not set");

    const existing = await this.repo.checkExistingDownload(userId, imageId);
    if (existing) throw new Error("Already purchased");

    const user = await this.repo.findUserById(userId);
    if (!user) throw new Error("User not found");

    const purchaseOrderId = `IMG-${randomUUID()}`;
    const payment = await this.repo.createPayment({
      userId,
      imageId,
      pidx: `PENDING_${purchaseOrderId}`,   // unique placeholder until Khalti responds
      purchaseOrderId,
      amount: (image as any).price,
      status: "INITIATED",
    });

    const khaltiRes = await initiatePayment({
      return_url: `${backendUrl}/api/payments/callback`,
      website_url: websiteUrl,
      amount: (image as any).price,
      purchase_order_id: purchaseOrderId,
      purchase_order_name: (image as any).title ?? `Image #${image.id}`,
      customer_info: {
        name: user.name,
        email: user.email,
      },
    });

    await this.repo.updatePaymentById(payment.id, { pidx: khaltiRes.pidx });

    return { paymentUrl: khaltiRes.payment_url, pidx: khaltiRes.pidx };
  }

  async handleCallback(pidx: string) {
    const payment = await this.repo.findPaymentByPidx(pidx);
    if (!payment) throw new Error("Payment record not found");

    const lookup = await lookupPayment(pidx);

    const statusMap: Record<string, string> = {
      Completed: "COMPLETED",
      Pending: "PENDING",
      Initiated: "INITIATED",
      Refunded: "REFUNDED",
      Expired: "EXPIRED",
      "User canceled": "USER_CANCELED",
    };
    const newStatus = statusMap[lookup.status] || "FAILED";

    await this.repo.updatePaymentById(payment.id, {
      status: newStatus,
      transactionId: lookup.transaction_id ?? null,
    });

    if (newStatus === "COMPLETED") {
      const existingDownload = await this.repo.checkExistingDownload(payment.userId, payment.imageId);
      if (!existingDownload) {
        await this.repo.createDownload({
          userId: payment.userId,
          imageId: payment.imageId,
          paymentId: payment.id,
        });
      }
    }

    return { payment, status: newStatus, lookup };
  }

  async freeDownload(userId: string, imageId: string) {
    const image = await this.repo.findImageById(imageId);
    if (!image) throw new Error("Image not found");
    if ((image as any).isPremium) throw new Error("Image is premium — purchase first");

    const existing = await this.repo.checkExistingDownload(userId, imageId);
    if (!existing) {
      await this.repo.createDownload({ userId, imageId });
    }
    return image;
  }

  async getDownloads(userId: string) {
    return this.repo.findDownloadsByUser(userId);
  }
}
