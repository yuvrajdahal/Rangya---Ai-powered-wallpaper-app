async function test() {
  const r = await fetch("http://localhost:3000/api/images");
  const d = (await r.json()) as any;
  const imagesWithPalette = d.images.filter(
    (i: any) => i.palette && i.palette.length > 0,
  );
  console.log("Images with palette:", imagesWithPalette.length);
  if (imagesWithPalette.length > 0) {
    console.log(JSON.stringify(imagesWithPalette[0], null, 2));
  } else {
    console.log("No images have a palette.");
  }
}
test();
