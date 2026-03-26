import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { isAuthenticated } from "../../middlewares/auth";

const router = Router();
const controller = new PaymentController();

// POST /api/payments/initiate
router.post("/initiate", isAuthenticated, controller.initiate);

// GET /api/payments/callback
router.get("/callback", controller.callback);

// POST /api/payments/downloads/free
router.post("/downloads/free", isAuthenticated, controller.freeDownload);

// GET /api/payments/downloads
router.get("/downloads", isAuthenticated, controller.getDownloads);

export default router;
