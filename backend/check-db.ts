import { db } from "./src/db";

async function check() {
  const users = await db.user.findMany();
  console.log("Users in DB:", JSON.stringify(users, null, 2));
}

check().catch(console.error);
