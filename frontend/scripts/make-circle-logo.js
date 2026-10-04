const sharp = require('sharp');
const path = require('path');

async function makeCircularLogo() {
  const inputPath = path.join(__dirname, '../public/logo.png');
  const outputPath = path.join(__dirname, '../public/logo-circle.png');
  
  const meta = await sharp(inputPath).metadata();
  const w = meta.width;
  const h = meta.height;
  const cx = w / 2;
  const cy = h / 2;
  // Outer circle of the emblem has a slight offset, radius ~492px
  const r = 492;
  
  const maskSvg = `<svg width="${w}" height="${h}">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" />
  </svg>`;
  
  await sharp(inputPath)
    .composite([{ input: Buffer.from(maskSvg), blend: 'dest-in' }])
    .png()
    .toFile(outputPath);
    
  console.log('Successfully created circular logo at', outputPath);
}

makeCircularLogo().catch(console.error);
