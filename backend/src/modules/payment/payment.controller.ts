import type { Request, Response } from "express";
import { PaymentService } from "./payment.service";

export class PaymentController {
  private service = new PaymentService();

  initiate = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const { imageId } = req.body;
      const backendUrl = process.env.BACKEND_URL || "http://192.168.100.13:3000";
      const websiteUrl = process.env.WEBSITE_URL || "http://192.168.100.13:8081";

      const data = await this.service.initiate(userId, imageId, websiteUrl, backendUrl);
      res.json(data);
    } catch (error: any) {
      console.error("Initiate Payment Error:", error);
      const status = error.message.includes("not found") ? 404 : 400;
      res.status(status).json({ error: error.message || "Internal Server Error" });
    }
  };

  callback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { pidx } = req.query;
      if (!pidx || typeof pidx !== "string") {
        res.status(400).json({ error: "Missing pidx" });
        return;
      }

      const { payment, status, lookup } = await this.service.handleCallback(pidx);
      
      const redirectBase = process.env.WEBSITE_URL || "exp://192.168.100.13:8081";
      if (status === "COMPLETED") {
        res.redirect(`${redirectBase}/payment/success?imageId=${payment.imageId}`);
      } else {
        res.redirect(`${redirectBase}/payment/failed?reason=${lookup.status}`);
      }
    } catch (error: any) {
      console.error("Callback Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  };

  freeDownload = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const { imageId } = req.body;

      const image = await this.service.freeDownload(userId, imageId);
      res.json({ success: true, imageUrl: image.url });
    } catch (error: any) {
      console.error("Free Download Error:", error);
      const status = error.message.includes("not found") ? 404 : 400;
      res.status(status).json({ error: error.message || "Internal Server Error" });
    }
  };

  getDownloads = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const downloads = await this.service.getDownloads(userId);
      res.json(downloads);
    } catch (error: any) {
      console.error("Get Downloads Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  };
}
