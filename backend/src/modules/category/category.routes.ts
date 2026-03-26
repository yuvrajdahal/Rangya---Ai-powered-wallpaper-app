import { Router } from "express";
import { CategoryController } from "./category.controller";

const router = Router();
const controller = new CategoryController();

router.get("/", controller.getAllCategories);
router.get("/:id", controller.getCategoryById);

export default router;
