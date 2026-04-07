import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../../auth";
import { isAuthenticated } from "../../middlewares/auth";
import { upload } from "../../middlewares/upload";
import { db } from "../../db";

const router = Router();


router.post(
  "/upload-avatar",
  isAuthenticated,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image provided" });
      }

      const user = (req as any).user;
      const imageUrl = `/uploads/${req.file.filename}`;

      
      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: { image: imageUrl },
      });

      res.status(200).json({
        message: "Avatar updated successfully",
        user: { id: updatedUser.id, image: updatedUser.image },
      });
    } catch (error) {
      console.error("Avatar upload error:", error);
      res.status(500).json({ message: "Error uploading avatar" });
    }
  }
);


router.use("/", toNodeHandler(auth));

export default router;
