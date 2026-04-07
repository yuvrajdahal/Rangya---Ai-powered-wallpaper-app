import "dotenv/config";

async function checkModels() {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_KEY}`,
  );
  const data = (await res.json()) as any;
  if (data.models) {
    const fs = require("fs");
    fs.writeFileSync(
      "models.json",
      JSON.stringify(
        data.models.map((m: any) => m.name),
        null,
        2,
      ),
    );
    console.log("Wrote to models.json");
  } else {
    console.log("Error:", data);
  }
}
checkModels();
