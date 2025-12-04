/**
 * Generate PWA icons with blue background and white "IMS" text
 * Uses sharp library for PNG generation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BLUE_COLOR = '#2563eb';

const sizes = [
  { name: 'icon-192.png', size: 192, fontSize: 80 },
  { name: 'icon-512.png', size: 512, fontSize: 200 },
  { name: 'apple-touch-icon.png', size: 180, fontSize: 70 }
];

function generateSVG(size, fontSize) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BLUE_COLOR}"/>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white">
    IMS
  </text>
</svg>`;
}

async function main() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log('Generating PWA icons...\n');

  for (const { name, size, fontSize } of sizes) {
    const svg = generateSVG(size, fontSize);
    const outputPath = path.join(iconsDir, name);

    await sharp(Buffer.from(svg)).png().toFile(outputPath);

    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log(`✓ Generated: ${name} (${size}x${size}px, ${sizeKB}KB)`);
  }

  console.log('\nAll icons generated successfully!');
}

main().catch(console.error);
