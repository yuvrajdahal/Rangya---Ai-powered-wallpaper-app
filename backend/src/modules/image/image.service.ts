import { ImageRepository } from "./image.repo";
import sharp from "sharp";
import { encode } from "blurhash";
import { GeminiService } from "../gemini/gemini.service";
import { ColorTone } from "@prisma/client";
import { db } from "../../db";

const getImageMetadata = async (
  filePath: string,
): Promise<{ blurhash: string; width: number; height: number }> => {
  const image = sharp(filePath);
  const metadata = await image.metadata();

  const { data, info } = await image
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: "inside" })
    .toBuffer({ resolveWithObject: true });

  const blurhash = encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    4,
    3,
  );

  return {
    blurhash,
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
};

export class ImageService {
  private repo = new ImageRepository();
  private geminiService = new GeminiService();

  async uploadImage(
    file: Express.Multer.File,
    userId: string,
    categoryId?: string,
    isPremium: boolean = false,
    price: number | null = null,
    title?: string,
    description?: string
  ) {
    if (!file) {
      throw new Error("No file provided");
    }

    // Construct the URL path to serve the image statically
    const url = `/uploads/${file.filename}`;

    let blurhash: string | undefined = undefined;
    let width: number | undefined = undefined;
    let height: number | undefined = undefined;
    let palette: string[] | undefined = undefined;
    let colorTone: ColorTone | undefined = undefined;

    try {
      const metadata = await getImageMetadata(file.path);
      blurhash = metadata.blurhash;
      width = metadata.width;
      height = metadata.height;
    } catch (e) {
      console.error("Failed to generate blurhash and metadata", e);
    }

    try {
      const analysis = await this.geminiService.analyzeImage(
        file.path,
        file.mimetype,
      );
      if (analysis) {
        palette = analysis.palette;
        colorTone = analysis.colorTone as ColorTone;
      }
    } catch (e) {
      console.error("Failed to analyze image with Gemini", e);
    }

    return this.repo.create(
      url,
      userId,
      categoryId,
      blurhash,
      palette,
      colorTone,
      width,
      height,
      isPremium,
      price,
      title,
      description
    );
  }

  async getAllImages() {
    return this.repo.findAll();
  }

  async getImagesByArtist(artistId: string) {
    const artist = await db.user.findUnique({
      where: { id: artistId },
      select: { id: true, name: true, image: true },
    });

    if (!artist) {
      throw new Error("Artist not found");
    }

    const images = await this.repo.findByUserId(artistId);
    return { artist, images };
  }

  async searchImages(query?: string, colorTone?: string, palette?: string) {
    const where: any = {};

    if (colorTone && colorTone !== "ALL") {
      where.colorTone = colorTone as ColorTone;
    }

    if (palette) {
      where.palette = { has: palette };
    }

    if (query?.trim()) {
      where.category = {
        name: { contains: query.trim(), mode: "insensitive" },
      };
    }

    return db.image.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getTopArtists() {
    const artistGroups = await db.image.groupBy({
      by: ["userId"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    const userIds = artistGroups.map((g) => g.userId);

    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, image: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return artistGroups.map((group) => {
      const user = userMap.get(group.userId) || {
        id: group.userId,
        name: "Unknown",
        image: null,
      };

      return {
        id: user.id,
        name: user.name,
        image: user.image,
        count: group._count.id,
      };
    });
  }

  async toggleSaveImage(userId: string, imageId: string, type: string) {
    const existing = await db.savedImage.findUnique({
      where: {
        userId_imageId_type: {
          userId,
          imageId,
          type,
        },
      },
    });

    if (existing) {
      await db.savedImage.delete({
        where: { id: existing.id },
      });
      return { saved: false };
    } else {
      await db.savedImage.create({
        data: {
          userId,
          imageId,
          type,
        },
      });
      return { saved: true };
    }
  }

  async getSavedImages(userId: string) {
    const saved = await db.savedImage.findMany({
      where: { userId },
      include: {
        image: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // De-duplicate images if they are both favorited and applied
    const seen = new Set();
    const images = [];
    for (const s of saved) {
      if (!seen.has(s.imageId)) {
        seen.add(s.imageId);
        images.push(s.image);
      }
    }
    return images;
  }
}
