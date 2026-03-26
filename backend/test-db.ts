import "dotenv/config";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const images = await prisma.image.findMany();
  console.log(JSON.stringify(images, null, 2));
}
main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
