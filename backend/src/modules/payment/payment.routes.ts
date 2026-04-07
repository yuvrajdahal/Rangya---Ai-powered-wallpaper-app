import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { isAuthenticated } from "../../middlewares/auth";

const router = Router();
const controller = new PaymentController();


router.post("/initiate", isAuthenticated, controller.initiate);


router.get("/callback", controller.callback);


router.post("/downloads/free", isAuthenticated, controller.freeDownload);


router.get("/downloads", isAuthenticated, controller.getDownloads);

export default router;
