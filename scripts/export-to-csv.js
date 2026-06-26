/**
 * Export nutritionData.json ke format CSV siap paste ke Google Sheets
 * Run: node scripts/export-to-csv.js
 * Output: scripts/nutrition-data.csv
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/nutritionData.json'), 'utf-8'));

// Header kolom Google Sheets
const headers = [
  'id', 'name', 'region',
  'stunting', 'wasting', 'underweight', 'hunger',
  'population', 'target_2029',
  'mbg_progress', 'mbg_dapur', 'mbg_penerima', 'mbg_biaya',
  'trend',
  'data_source_stunting', 'data_source_mbg'
];

const rows = data.map(p => [
  p.id,
  p.name,
  p.region,
  p.stunting,
  p.wasting,
  p.underweight,
  p.hunger,
  p.population,
  p.target_2029,
  p.mbg_progress,
  p.mbg_dapur,
  p.mbg_penerima,
  p.mbg_biaya,
  // trend: pisahkan dengan titik koma agar tidak kena koma CSV
  (p.trend || []).join(';'),
  p.data_source?.stunting || 'SSGI 2024',
  p.data_source?.mbg || 'Estimasi BGN',
]);

const csv = [headers, ...rows]
  .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  .join('\n');

const outPath = path.join(__dirname, 'nutrition-data.csv');
fs.writeFileSync(outPath, csv, 'utf-8');

console.log(`✅ CSV berhasil dibuat: ${outPath}`);
console.log(`📊 Total baris: ${rows.length} provinsi`);
console.log(`\n📋 Langkah selanjutnya:`);
console.log(`   1. Buka Google Sheets → buat spreadsheet baru`);
console.log(`   2. File → Import → upload file: scripts/nutrition-data.csv`);
console.log(`   3. File → Share → Publish to web → Sheet1 → CSV → Publish`);
console.log(`   4. Copy URL yang muncul`);
console.log(`   5. Buat file .env.local di root project:`);
console.log(`      VITE_SHEETS_CSV_URL=<paste URL di sini>`);
console.log(`   6. Restart npm run dev → status berubah jadi 🟢 Live!`);
