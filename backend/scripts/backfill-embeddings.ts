import "dotenv/config";
import { ImageService } from "../src/modules/image/image.service";
import { db } from "../src/db";

async function backfillEmbeddings() {
  const service = new ImageService();
  
  console.log("Fetching images without embeddings...");
  const images = await db.image.findMany({
    where: {
      OR: [
        { embedding: { equals: [] } }
      ]
    },
    include: { category: true }
  });

  console.log(`Found ${images.length} images to process.`);

  for (const image of images) {
    try {
      console.log(`Processing image ${image.id}: ${image.title || "Untitled"}`);
      const textToEmbed = image.title || image.description || image.category?.name || "wallpaper";
      
      const embedding = await (service as any).geminiService.generateEmbedding(textToEmbed);
      
      if (embedding && embedding.length > 0) {
        await db.image.update({
          where: { id: image.id },
          data: { embedding }
        });
        console.log(`Successfully updated embedding for ${image.id}`);
      } else {
        console.warn(`Empty embedding returned for ${image.id}`);
      }
    } catch (error) {
      console.error(`Error processing image ${image.id}:`, error);
    }
    
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log("Backfill complete!");
  process.exit(0);
}

backfillEmbeddings();
