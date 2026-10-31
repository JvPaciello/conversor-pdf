// Renders the favicon, app icons and the PNG logo from public/logo.svg.
// Run with `npm run icons` after editing the SVG.
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const source = await readFile(new URL('../public/logo.svg', import.meta.url), 'utf8');

/** Small sizes drop the text lines and simplify the stamp so it stays legible. */
function variant(size, { square = false } = {}) {
  let svg = source;
  if (size <= 32) {
    svg = svg
      .replace(/<g id="detail"[\s\S]*?<\/g>\s*/, '')
      .replace(/<rect id="stamp-text"[^>]*\/>\s*/, '')
      .replace(/(<rect id="stamp"[^>]*?)stroke-width="[\d.]+"/, '$1stroke-width="3.75"');
  }
  if (size <= 16) svg = svg.replace(/(<rect id="stamp"[^>]*?)fill="none"/, '$1fill="#3A2BC4"');
  // iOS rounds app icons itself, so the Apple icon is a full square.
  if (square) svg = svg.replace('rx="14"', 'rx="0"');
  return sharp(Buffer.from(svg), { density: Math.max(72, (size / 64) * 72) }).resize(size, size).png().toBuffer();
}

/** Packs PNG images into a .ico container (PNG-compressed entries). */
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt16LE(1, entry + 4); // colour planes
    header.writeUInt16LE(32, entry + 6); // bits per pixel
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.data)]);
}

const favicon = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await variant(size) })));

await Promise.all([
  writeFile(new URL('../src/app/favicon.ico', import.meta.url), ico(favicon)),
  writeFile(new URL('../src/app/icon.png', import.meta.url), await variant(192)),
  writeFile(new URL('../src/app/apple-icon.png', import.meta.url), await variant(180, { square: true })),
  writeFile(new URL('../public/logo.png', import.meta.url), await variant(512)),
]);
console.log('Ícones gerados a partir de public/logo.svg');
