async function main() {
  const prompt = encodeURIComponent("A red dog walking");
  
  const urls = [
    `https://image.pollinations.ai/prompt/${prompt}?nologo=true`, // simple no model
    `https://pollinations.ai/p/${prompt}?width=1024&height=1024&seed=42&nologo=true`
  ];

  for (const url of urls) {
    console.log(`Trying ${url}...`);
    try {
      const resp = await fetch(url);
      console.log(`Status: ${resp.status} ${resp.statusText}`);
      if (resp.headers.get("content-type")) {
        console.log(`Type: ${resp.headers.get("content-type")}`);
      }
    } catch(e) {
      console.error(e);
    }
    console.log("---");
  }
}

main();
