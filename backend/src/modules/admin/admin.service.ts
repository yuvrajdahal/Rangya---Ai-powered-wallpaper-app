import { db } from "../../db";

export class AdminService {
  async getStats() {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const totalUsers = await db.user.count();
    const totalImages = await db.image.count();
    
    
    const payments = await db.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    });

    const categories = await db.category.count();
    const premiumImages = await db.image.count({ where: { isPremium: true } });

    
    const activeSessions = await db.session.count({
      where: { expiresAt: { gt: now } },
    });

    const recentUploads = await db.image.count({
      where: { createdAt: { gt: twentyFourHoursAgo } },
    });

    const totalDownloads = await db.download.count();

    
    const pendingReview = await db.image.count({
      where: { categoryId: null },
    });

    return {
      totalUsers,
      totalImages,
      totalRevenue: payments._sum.amount || 0,
      categories,
      premiumImages,
      activeSessions,
      recentUploads,
      totalDownloads,
      pendingReview,
    };
  }

  async getAllUsers() {
    return db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            savedImages: true,
            payments: true,
            downloads: true,
          },
        },
      },
    });
  }

  async deleteUser(userId: string) {
    
    return db.user.delete({
      where: { id: userId },
    });
  }

  async updateUser(userId: string, data: { name?: string; email?: string; role?: string }) {
    return db.user.update({
      where: { id: userId },
      data,
    });
  }

  async getAllImages() {
    return db.image.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
        category: true,
      },
    });
  }

  async deleteImage(imageId: string) {
    return db.image.delete({
      where: { id: imageId },
    });
  }

  async togglePremium(imageId: string) {
    const image = await db.image.findUnique({
      where: { id: imageId },
      select: { isPremium: true },
    });

    if (!image) throw new Error("Image not found");

    return db.image.update({
      where: { id: imageId },
      data: { isPremium: !image.isPremium },
    });
  }
}
