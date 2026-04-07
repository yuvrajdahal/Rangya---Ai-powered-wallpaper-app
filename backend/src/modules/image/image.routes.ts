import { Router } from "express";
import { ImageController } from "./image.controller";
import { upload } from "../../middlewares/upload";
import { isAuthenticated } from "../../middlewares/auth";
import { asyncHandler } from "../../utils/async-handler";

const router = Router();
const controller = new ImageController();

router.get("/", asyncHandler(controller.getAllImages));

router.get("/diverse", asyncHandler(controller.getDiverseFeed));

router.get("/search", asyncHandler(controller.searchImages));

router.get("/stats", isAuthenticated, asyncHandler(controller.getStats));

router.get("/artists", asyncHandler(controller.getTopArtists));

router.get("/artist/:id", asyncHandler(controller.getArtistImages));

router.post("/generate", asyncHandler(controller.generateImage));

router.post(
  "/upload",
  isAuthenticated,
  upload.single("image"),
  asyncHandler(controller.uploadImage),
);

router.get("/saved", isAuthenticated, asyncHandler(controller.getSavedImages));

router.post(
  "/saved/:id",
  isAuthenticated,
  asyncHandler(controller.toggleSaveImage),
);

export default router;
