import fs from 'fs';
import zlib from 'zlib';

function createPngBuffer(width, height, drawFn) {
  // 1. Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // 2. IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // 3. Raw image scanlines
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    rawData[rowOffset] = 0; // filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 implementation
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ -1) >>> 0;
}

const CRC_TABLE = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
  }
  CRC_TABLE[n] = c;
}

// Draw icon: Brand sky blue gradient with white wallet badge
function drawBrandIcon(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;

  // Background sky gradient from #0284c7 to #0369a1
  const r = Math.round(2 + nx * 5 - ny * 1);
  const g = Math.round(132 - ny * 25);
  const b = Math.round(199 - ny * 35);

  // Inner white card area (centered 60% of size)
  const marginX = w * 0.22;
  const marginY = h * 0.26;
  const cardW = w * 0.56;
  const cardH = h * 0.48;

  if (x >= marginX && x <= marginX + cardW && y >= marginY && y <= marginY + cardH) {
    // Top bar of wallet
    if (y < marginY + cardH * 0.28) {
      return [255, 255, 255, 255];
    }
    // Wallet flap with gold accent
    if (x >= marginX + cardW * 0.55 && y >= marginY + cardH * 0.35 && y <= marginY + cardH * 0.75) {
      // Gold clasp
      const claspCenterX = marginX + cardW * 0.68;
      const claspCenterY = marginY + cardH * 0.55;
      const dist = Math.hypot(x - claspCenterX, y - claspCenterY);
      if (dist <= w * 0.04) {
        return [250, 204, 21, 255]; // Gold
      }
      return [2, 132, 199, 255]; // Sky blue
    }
    return [248, 250, 252, 255]; // Off-white
  }

  return [r, g, b, 255];
}

// Ensure public dir
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

fs.writeFileSync('public/pwa-192x192.png', createPngBuffer(192, 192, drawBrandIcon));
fs.writeFileSync('public/pwa-512x512.png', createPngBuffer(512, 512, drawBrandIcon));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPngBuffer(512, 512, drawBrandIcon));
fs.writeFileSync('public/apple-touch-icon.png', createPngBuffer(180, 180, drawBrandIcon));

console.log('Successfully generated PWA icons!');
