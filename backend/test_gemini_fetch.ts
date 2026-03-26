import axios from "axios";

async function main() {
  const model = "gemini-2.5-flash"; // testing 2.5 flash
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_KEY}`;
  try {
    const res = await axios.post(url, {
      contents: [{ parts: [{ text: "Generate an image of a red shiny sports car." }] }],
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e: any) {
    console.error(e.response?.data || e.message);
  }
}

main();
