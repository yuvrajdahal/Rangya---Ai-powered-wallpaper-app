async function main() {
  const prompt = encodeURIComponent("A red dog walking");
  
  const urls = [
    `https://gen.pollinations.ai/image/${prompt}?model=flux`,
    `https://gen.pollinations.ai/image/${prompt}?model=turbo`,
  ];

  for (const url of urls) {
    console.log(`Testing: ${url}`);
    try {
      const resp = await fetch(url);
      console.log(`Status: ${resp.status}`);
      if (resp.headers.get("content-type")) {
        console.log(`Content-Type: ${resp.headers.get("content-type")}`);
      }
    } catch(e) {
      console.error(e);
    }
    console.log("---");
  }
}

main();
