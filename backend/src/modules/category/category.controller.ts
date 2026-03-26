import type { Request, Response } from "express";
import { CategoryService } from "./category.service";

export class CategoryController {
  private service = new CategoryService();

  getAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.service.getAllCategories();
      res.status(200).json({ categories });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  };

  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.service.getCategoryById(id as string);
      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      res.status(200).json({ category });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error.message || "Internal server error" });
    }
  };
}
