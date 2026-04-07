import { db } from "../../db";
import { ColorTone } from "@prisma/client";

export class ImageRepository {
  async create(
    url: string,
    userId: string,
    categoryId?: string,
    blurhash?: string,
    palette?: string[],
    colorTone?: ColorTone,
    width?: number,
    height?: number,
    isPremium: boolean = false,
    price: number | null = null,
    title?: string,
    description?: string,
    isAi: boolean = false,
    embedding: number[] = []
  ) {
    return db.image.create({
      data: {
        url,
        userId,
        categoryId: categoryId || undefined,
        blurhash,
        palette: palette || [],
        colorTone: colorTone || "NEUTRAL",
        width,
        height,
        isPremium,
        price,
        title,
        description,
        isAi,
        embedding
      },
    });
  }

  async findAll() {
    return db.image.findMany({
      include: {
        category: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByUserId(userId: string) {
    return db.image.findMany({
      where: { userId },
      include: {
        category: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
  
  async getProfileStats(userId: string) {
    const [uploads, downloads, favorites, saved, applied] = await Promise.all([
      db.image.count({ where: { userId } }),
      db.download.count({ where: { userId } }),
      db.savedImage.count({ where: { userId, type: "FAVORITE" } }),
      db.savedImage.count({ where: { userId, type: "SAVED" } }),
      db.savedImage.count({ where: { userId, type: "APPLIED" } }),
    ]);

    return { uploads, downloads, favorites, saved, applied };
  }
}
