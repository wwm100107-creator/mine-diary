const fs = require('fs');
const zlib = require('zlib');

function createPNG(width, height, getPixel) {
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }

  function crc32(buf) {
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeAndData = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crc]);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// Generate cute pink icon with rounded border and heart for notifications
const png192 = createPNG(192, 192, (x, y, w, h) => {
  const cx = w / 2, cy = h / 2;
  const r = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  if (r > w / 2 - 2) return [0, 0, 0, 0];
  // Cute pink gradient
  const t = y / h;
  const red = Math.round(255 * (1 - t * 0.1));
  const green = Math.round(143 + (183 - 143) * t);
  const blue = Math.round(171 + (197 - 171) * t);
  // Heart in center
  const nx = (x - cx) / (w * 0.28);
  const ny = -(y - cy) / (h * 0.28) + 0.3;
  if ((nx*nx + ny*ny - 1)**3 - nx*nx*ny*ny*ny <= 0) {
    return [255, 255, 255, 255]; // White heart
  }
  return [red, green, blue, 255];
});

fs.writeFileSync('public/icon-192.png', png192);
fs.writeFileSync('public/icon-512.png', png192);
fs.writeFileSync('public/favicon.png', png192);
fs.writeFileSync('public/badge-72.png', png192);
console.log('PNG notification icons successfully generated!');
