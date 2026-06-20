const sharp = require('sharp');
const fs = require('fs');
const png2icons = require('png2icons');

async function convert() {
  console.log("Reading SVG...");
  const svgBuffer = fs.readFileSync('public/intavue.svg');
  
  console.log("Converting to transparent PNG (intavue.png)...");
  const transparentPngBuffer = await sharp(svgBuffer)
    .resize(1024, 1024, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
    
  fs.writeFileSync('public/intavue.png', transparentPngBuffer);
  console.log("Created public/intavue.png");

  console.log("Creating solid background PNG for app icons...");
  // We scale the logo down a bit (e.g. 700x700 inside a 1024x1024 canvas) to give it breathing room
  // We use the brand purple #6b4af0 as the background.
  const logoScaledBuffer = await sharp(svgBuffer)
    .resize(700, 700, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Create a 1024x1024 solid background and composite the logo on top
  const solidPngBuffer = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: '#6b4af0'
    }
  })
  .composite([{
    input: logoScaledBuffer,
    gravity: 'center'
  }])
  .png()
  .toBuffer();

  // We can save the solid png just in case it's needed for other app stores
  fs.writeFileSync('public/intavue-app-icon.png', solidPngBuffer);
  console.log("Created public/intavue-app-icon.png");

  console.log("Converting to ICO...");
  const icoBuffer = png2icons.createICO(solidPngBuffer, png2icons.BILINEAR, 0, true, true);
  if (icoBuffer) {
    fs.writeFileSync('public/favicon.ico', icoBuffer);
    fs.writeFileSync('public/intavue.ico', icoBuffer);
    console.log("Created public/intavue.ico and public/favicon.ico");
  } else {
    console.log("Failed to create ICO");
  }
  
  console.log("Converting to ICNS...");
  const icnsBuffer = png2icons.createICNS(solidPngBuffer, png2icons.BILINEAR, 0);
  if (icnsBuffer) {
    fs.writeFileSync('public/intavue.icns', icnsBuffer);
    console.log("Created public/intavue.icns");
  } else {
    console.log("Failed to create ICNS");
  }
}

convert().then(() => console.log("Done!")).catch(console.error);
