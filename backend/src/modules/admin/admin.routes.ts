import { Router } from "express";
import { AdminController } from "./admin.controller";
import { isAdmin } from "../../middlewares/admin";
import { isAuthenticated } from "../../middlewares/auth";

const router = Router();
const controller = new AdminController();


router.use(isAuthenticated);
router.use(isAdmin);


router.get("/stats", controller.getStats);


router.get("/users", controller.getAllUsers);


router.delete("/users/:id", controller.deleteUser);


router.patch("/users/:id", controller.updateUser);


router.get("/images", controller.getAllImages);


router.delete("/images/:id", controller.deleteImage);


router.patch("/images/:id/premium", controller.togglePremium);

export default router;
