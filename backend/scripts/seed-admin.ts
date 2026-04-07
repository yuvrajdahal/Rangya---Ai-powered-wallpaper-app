import "dotenv/config";
import { db } from "../src/db";

async function seedAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.error("Please provide an email address: bun run scripts/seed-admin.ts user@example.com");
    process.exit(1);
  }

  console.log();

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error();
      process.exit(1);
    }

    await db.user.update({
      where: { id: user.id },
      data: { role: "admin" },
    });

    console.log();
  } catch (error) {
    console.error("Failed to seed admin:", error);
  } finally {
    process.exit(0);
  }
}

seedAdmin();
