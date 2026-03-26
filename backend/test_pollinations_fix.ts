async function main() {
  const prompt = encodeURIComponent("A futuristic city at sunset");
  const model = "flux";
  const key = "sk_wHw6id7kcP4yPeh5y7jL7qG4gL9QBKqX";
  
  const url = `https://gen.pollinations.ai/image/${prompt}?model=${model}&nologo=true`;

  console.log(`Trying ${url}...`);
  try {
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${key}`
      }
    });
    console.log(`Status: ${resp.status} ${resp.statusText}`);
    console.log(`Type: ${resp.headers.get("content-type")}`);
    
    if (resp.ok) {
        const buffer = await resp.arrayBuffer();
        console.log(`Success! Buffer length: ${buffer.byteLength}`);
    } else {
        const text = await resp.text();
        console.log(`Error body: ${text}`);
    }
  } catch(e) {
    console.error(e);
  }
}

main();
