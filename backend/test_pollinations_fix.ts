async function main() {
  const prompt = encodeURIComponent("A futuristic city at sunset");
  const model = "flux";
  const key = "sk_wHw6id7kcP4yPeh5y7jL7qG4gL9QBKqX";
  
  const url = `https://gen.pollinations.ai/image/${prompt}?model=${model}&nologo=true&width=720&height=1280`;

  console.log(`Testing Pollinations with URL: ${url}`);
  try {
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${key}`
      }
    });
    
    console.log(`Status: ${resp.status}`);
    
    if (resp.ok) {
        const buffer = await resp.arrayBuffer();
        console.log(`Success! Image size: ${buffer.byteLength} bytes`);
    } else {
        const text = await resp.text();
        console.log(`Failed: ${text}`);
    }
  } catch(e) {
    console.error(e);
  }
}

main();
