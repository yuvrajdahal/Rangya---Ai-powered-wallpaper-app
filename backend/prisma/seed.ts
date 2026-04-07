import { db } from "../src/db";

const categories = [
  "Abstract",
  "Minimal",
  "Nature",
  "Amoled",
  "Anime",
  "Illustration",
  "3D Render",
  "Architecture",
  "Landscape",
  "Cyberpunk",
  "Street Art",
  "Games",
  "Games (Retro)",
  "Cars",
  "Animals",
  "Macro",
  "Space",
  "Vintage",
  "Dark",
  "Light",
  "Textured",
  "Typography",
];

async function main() {
  console.log("Start seeding categories...");
  
  for (const name of categories) {
    const category = await db.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`Created category: ${category.name}`);
  }
  
  console.log("Seeding finished.");
  process.exit(0);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
