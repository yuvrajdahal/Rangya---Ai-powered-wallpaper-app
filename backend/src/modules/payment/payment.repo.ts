import { db } from "../../db";

export class PaymentRepository {
  async findImageById(imageId: string) {
    return db.image.findUnique({ where: { id: imageId } });
  }

  async checkExistingDownload(userId: string, imageId: string) {
    return db.download.findUnique({
      where: { userId_imageId: { userId, imageId } },
    });
  }

  async findUserById(userId: string) {
    return db.user.findUnique({ where: { id: userId } });
  }

  async createPayment(data: any) {
    return db.payment.create({ data });
  }

  async updatePaymentById(id: string, data: any) {
    return db.payment.update({ where: { id }, data });
  }

  async findPaymentByPidx(pidx: string) {
    return db.payment.findUnique({ where: { pidx } });
  }

  async createDownload(data: any) {
    return db.download.create({ data });
  }

  async findDownloadsByUser(userId: string) {
    return db.download.findMany({
      where: { userId },
      include: { image: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
