import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgBuffer = Buffer.from(`<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="85" fill="#6366F1"/>
  <path d="M128 192C128 168.804 146.804 150 170 150H342C365.196 150 384 168.804 384 192V320C384 343.196 365.196 362 342 362H170C146.804 362 128 343.196 128 320V192Z" stroke="white" stroke-width="20"/>
  <path d="M128 235H384" stroke="white" stroke-width="20"/>
  <path d="M256 150V362" stroke="white" stroke-width="20"/>
  <circle cx="192" cy="299" r="28" fill="white"/>
  <circle cx="320" cy="192" r="20" fill="white"/>
</svg>`);

const sizes = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon.ico', size: 32 }
];

async function generateIcons() {
  for (const { name, size } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(__dirname, 'public', name));
    console.log(`Generated ${name}`);
  }
}

generateIcons().catch(console.error);
