#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');

const ICONS_DIR = path.join(__dirname, '..', 'assets', 'icons');
const SVG_PATH = path.join(ICONS_DIR, 'icon.svg');
const SIZES = [16, 48, 128];

async function run() {
  if (!fs.existsSync(SVG_PATH)) {
    console.error('SVG bulunamadı:', SVG_PATH);
    process.exit(1);
  }

  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('sharp kurulu değil.');
    console.error('Kur: npm install --save-dev sharp');
    console.error('Sonra tekrar çalıştır: node utils/generate-icons.js');
    process.exit(1);
  }

  const svg = fs.readFileSync(SVG_PATH);

  for (const size of SIZES) {
    const out = path.join(ICONS_DIR, `icon-${size}.png`);
    await sharp(svg).resize(size, size).png().toFile(out);
    console.log(`icon-${size}.png olusturuldu`);
  }

  console.log('Tum ikonlar assets/icons/ altinda hazir.');
}

run().catch(err => {
  console.error('Hata:', err.message);
  process.exit(1);
});
