import { db } from "../../db";

export class CategoryRepository {
  async findAll() {
    return db.category.findMany({
      orderBy: { name: "asc" },
      where: {
        images: {
          some: {}, 
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
