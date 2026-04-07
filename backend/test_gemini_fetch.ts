async function main() {
  const model = "gemini-2.5-flash"; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_KEY}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Generate an image of a red shiny sports car." }] }],
      })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e: any) {
    console.error(e.message);
  }
}

main();
