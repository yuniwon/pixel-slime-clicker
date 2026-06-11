// PWA 아이콘 생성기: 게임의 슬라임 픽셀맵을 PNG로 렌더링한다.
// 사용: node tools/gen-icons.js  →  icons/icon-192.png, icons/icon-512.png
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SLIME_MAP = [
  '....oooooooo....',
  '..oobbbbbbbboo..',
  '.obbllbbbbbbbbo.',
  '.oblbbbbbbbbbbo.',
  'obblbbbbbbbbbbbo',
  'obbwkbbbbbbwkbbo',
  'obbwkbbbbbbwkbbo',
  'obpbbbbbbbbbbpbo',
  'obbbbobbbbobbbbo',
  'obbbbboooobbbbdo',
  '.obbbbbbbbbbbdo.',
  '.oobbbbbbbbddoo.',
  '...oooooooooo...',
];

const COLORS = {
  o: [0x1b, 0x4a, 0x26],
  b: [0x5a, 0xd9, 0x5a],
  l: [0xae, 0xf2, 0xa4],
  d: [0x37, 0xa8, 0x37],
  w: [0xff, 0xff, 0xff],
  k: [0x26, 0x20, 0x3a],
  p: [0xff, 0x9f, 0xb2],
};
const BG = [0x2d, 0x1b, 0x4e]; // 게임 배경 보라

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function makePng(size) {
  const gridW = SLIME_MAP[0].length;   // 16
  const gridH = SLIME_MAP.length;      // 13
  const px = Math.floor(size * 0.82 / gridW);
  const offX = Math.floor((size - gridW * px) / 2);
  const offY = Math.floor((size - gridH * px) / 2);

  // RGB raster
  const raster = Buffer.alloc(size * size * 3);
  for (let i = 0; i < size * size; i++) {
    raster[i * 3] = BG[0]; raster[i * 3 + 1] = BG[1]; raster[i * 3 + 2] = BG[2];
  }
  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const c = COLORS[SLIME_MAP[gy][gx]];
      if (!c) continue;
      for (let dy = 0; dy < px; dy++) {
        for (let dx = 0; dx < px; dx++) {
          const x = offX + gx * px + dx;
          const y = offY + gy * px + dy;
          const i = (y * size + x) * 3;
          raster[i] = c[0]; raster[i + 1] = c[1]; raster[i + 2] = c[2];
        }
      }
    }
  }

  // scanlines with filter byte 0
  const scan = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    scan[y * (size * 3 + 1)] = 0;
    raster.copy(scan, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 2;   // color type RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(scan, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, '..', 'icons');
fs.mkdirSync(outDir, { recursive: true });
for (const size of [192, 512]) {
  const file = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(file, makePng(size));
  console.log('wrote', file);
}
