import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || "");

async function main() {
  const modelNames = [
    "gemini-3.1-flash-image-preview",
    "gemini-2.5-flash-image",
    "gemini-2.0-flash" 
  ];

  for(const m of modelNames) {
    console.log("trying", m);
    
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Generte an image of a red dog");
      const c = result.response.candidates;
      if (c && c.length > 0) {
        console.log("Success with", m);
        console.log(JSON.stringify(c[0]?.content || {}, null, 2).substring(0, 300));
        return;
      }
    } catch (e: any) {
      console.log("Failed", e.message);
    }
  }
}

main();
