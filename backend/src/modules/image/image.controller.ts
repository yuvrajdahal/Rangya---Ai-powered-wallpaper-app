import type { Request, Response } from "express";
import { ImageService } from "./image.service";
import { CategoryService } from "../category/category.service";
import { GeminiService } from "../gemini/gemini.service";

export class ImageController {
  private service = new ImageService();
  private categoryService = new CategoryService();
  private geminiService = new GeminiService();

  private textRateLimits = new Map<string, number>();

  private checkRateLimit(userId: string): boolean {
    const today = new Date().toISOString().split("T")[0];
    const key = `${userId}_${today}`;
    const current = this.textRateLimits.get(key) || 0;

    if (current >= 10) {
      return false;
    }

    this.textRateLimits.set(key, current + 1);
    return true;
  }

  uploadImage = async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user;

    if (!user?.id) {
      res.status(401).json({ message: "Unauthorized to upload." });
      return;
    }

    const userId = user.id;

    if (!req.file) {
      res.status(400).json({ message: "Image file is required" });
      return;
    }

    let {
      categoryId,
      categoryName,
      isPremium,
      price,
      title,
      description,
      isAi,
    } = req.body;

    
    if (categoryName && !categoryId) {
      const category =
        await this.categoryService.findOrCreateCategory(categoryName);
      categoryId = category.id;
    }

    const parsedIsPremium = isPremium === "true" || isPremium === true;
    const parsedIsAi = isAi === "true" || isAi === true;
    
    const parsedPrice = price ? Math.round(parseFloat(price) * 100) : null;

    const image = await this.service.uploadImage(
      req.file,
      userId,
      categoryId,
      parsedIsPremium,
      parsedPrice,
      title,
      description,
      parsedIsAi,
    );
    res.status(201).json({ message: "Image uploaded successfully", image });
  };

  getAllImages = async (req: Request, res: Response): Promise<void> => {
    const images = await this.service.getAllImages();
    res.status(200).json({ images });
  };

  getDiverseFeed = async (req: Request, res: Response): Promise<void> => {
    const { threshold } = req.query;
    const parsedThreshold = threshold ? parseFloat(threshold as string) : 0.9;

    const images = await this.service.getDiverseImages(parsedThreshold);
    res.status(200).json({ images });
  };

  searchImages = async (req: Request, res: Response): Promise<void> => {
    const { q, tone, palette } = req.query as {
      q?: string;
      tone?: string;
      palette?: string;
    };
    const images = await this.service.searchImages(q, tone, palette);
    res.status(200).json({ images });
  };

  getTopArtists = async (req: Request, res: Response): Promise<void> => {
    const artists = await this.service.getTopArtists();
    res.status(200).json({ artists });
  };

  getArtistImages = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const data = await this.service.getImagesByArtist(id as string);
    res.status(200).json(data);
  };

  generateImage = async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user;
    const userId = user?.id || req.ip || "anonymous";

    if (!this.checkRateLimit(userId)) {
      res.status(429).json({
        message:
          "Daily limit of 10 images reached. Please try again tomorrow.",
      });
      return;
    }

    const { prompt, model } = req.body;
    if (!prompt) {
      res.status(400).json({ message: "Prompt is required" });
      return;
    }

    const safePrompt = encodeURIComponent(prompt);
    const safeModel = encodeURIComponent(model || "flux");

    const url = `https://gen.pollinations.ai/image/${safePrompt}?model=${safeModel}&nologo=true&width=720&height=1280`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.POLLEN_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch from Pollinations API: ${response.statusText}`,
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    
    res
      .status(200)
      .set("Content-Type", contentType)
      .set("Content-Length", buffer.length.toString())
      .send(buffer);
  };

  toggleSaveImage = async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user;
    if (!user?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params as { id: string };
    const { type = "FAVORITE" } = req.body as { type: string };

    const result = await this.service.toggleSaveImage(user.id, id, type);
    res.status(200).json(result);
  };

  getSavedImages = async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user;
    if (!user?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const images = await this.service.getSavedImages(user.id);
    res.status(200).json({ images });
  };

  getStats = async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user;
    if (!user?.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const stats = await this.service.getProfileStats(user.id);
    res.status(200).json(stats);
  };
}
