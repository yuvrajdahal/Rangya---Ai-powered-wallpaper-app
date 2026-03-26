import { db } from "../../db";

export class CategoryRepository {
  async findAll() {
    return db.category.findMany({
      orderBy: { name: "asc" },
      where: {
        images: {
          some: {}, // Only return categories that have at least one image
        },
      },
      include: {
        images: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async findByName(name: string) {
    return db.category.findUnique({
      where: { name },
    });
  }

  async findById(id: string) {
    return db.category.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async create(name: string) {
    return db.category.create({
      data: { name },
    });
  }
}
