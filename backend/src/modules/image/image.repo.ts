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
    description?: string
  ) {
    return db.image.create({
      data: {
        url,
        userId,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        blurhash,
        palette: palette || [],
        colorTone: colorTone || "NEUTRAL",
        width,
        height,
        isPremium,
        price,
        title,
        description
      },
    });
  }

  async findAll() {
    return db.image.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByUserId(userId: string) {
    return db.image.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
