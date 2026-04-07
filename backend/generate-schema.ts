import { auth } from "./src/auth";
import fs from "fs";





// Manually generate prisma schema if needed
const schema: string = ""; // Use 'bun x prisma generate' instead!

if (schema && schema.length > 0) {
  fs.writeFileSync("./prisma/schema.prisma", (schema as string).trim());
  console.log("Schema generated manually.");
} else {
  console.log("No schema to generate manually. Use prisma CLI.");
}
