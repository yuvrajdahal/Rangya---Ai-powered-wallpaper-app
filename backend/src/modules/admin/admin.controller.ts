import type { Request, Response } from "express";
import { AdminService } from "./admin.service";

export class AdminController {
  private service = new AdminService();

  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.service.getStats();
      res.status(200).json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  };

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.service.getAllUsers();
      res.status(200).json({ users });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id || typeof id !== "string") {
        res.status(400).json({ message: "Valid User ID is required" });
        return;
      }
      await this.service.deleteUser(id);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;
      if (!id || typeof id !== "string") {
        res.status(400).json({ message: "Valid User ID is required" });
        return;
      }
      const updatedUser = await this.service.updateUser(id, { name, email, role });
      res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  };

  getAllImages = async (req: Request, res: Response): Promise<void> => {
    try {
      const images = await this.service.getAllImages();
      res.status(200).json({ images });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  };

  deleteImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id || typeof id !== "string") {
        res.status(400).json({ message: "Valid Image ID is required" });
        return;
      }
      await this.service.deleteImage(id);
      res.status(200).json({ message: "Image deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  };

  togglePremium = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id || typeof id !== "string") {
        res.status(400).json({ message: "Valid Image ID is required" });
        return;
      }
      const updated = await this.service.togglePremium(id);
      res.status(200).json({ message: "Premium status toggled", image: updated });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  };
}
