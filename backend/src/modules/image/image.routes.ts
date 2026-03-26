import { Router } from "express";
import { ImageController } from "./image.controller";
import { upload } from "../../middlewares/upload";
import { isAuthenticated } from "../../middlewares/auth";

const router = Router();
const controller = new ImageController();

// GET all images for explore page
router.get("/", controller.getAllImages);

// GET search endpoint (?q=&tone=&palette=)
router.get("/search", controller.searchImages);

// GET top artists based on upload count
router.get("/artists", controller.getTopArtists);

// GET images by a specific artist
router.get("/artist/:id", controller.getArtistImages);

// POST generate AI image
router.post("/generate", controller.generateImage);

// POST new image upload
router.post(
  "/upload",
  isAuthenticated,
  upload.single("image"),
  controller.uploadImage,
);

// GET saved images
router.get("/saved", isAuthenticated, controller.getSavedImages);

// POST toggle save image
router.post("/saved/:id", isAuthenticated, controller.toggleSaveImage);

export default router;
