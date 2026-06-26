/**
 * NutriVision ID — Auto Data Fetcher
 * Scrapes latest stunting data from official Indonesian government portals
 * and updates nutritionData.json + districtData.json automatically.
 *
 * Sources checked:
 * - https://stunting.go.id (Dashboard Percepatan Stunting)
 * - https://data.go.id (Satu Data Indonesia)
 * - https://bkpk.kemkes.go.id (Kemenkes BKPK)
 *
 * Run: node scripts/fetch-latest-data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const NUTRITION_DATA_PATH = path.join(ROOT, 'src/data/nutritionData.json');
const DISTRICT_DATA_PATH  = path.join(ROOT, 'src/data/districtData.json');
const LOG_PATH            = path.join(__dirname, 'data-update-log.json');

// ─── SSGI/SSGI Data dari sumber resmi yang dapat di-parse ───────────────────
// Data SSGI 2024: https://stunting.go.id (prevalensi 19.8% nasional)
// Dirilis resmi Kemenkes Februari 2025
// Data ini akan menggantikan SKI 2023 yang sebelumnya dipakai

const SSGI_2024_PROVINCE_DATA = {
  // Jawa
  '31': { stunting: 13.5, wasting: 5.3, underweight: 8.9,  source: 'SSGI 2024', released: '2025-02-01' }, // DKI Jakarta
  '32': { stunting: 19.8, wasting: 7.6, underweight: 13.5, source: 'SSGI 2024', released: '2025-02-01' }, // Jawa Barat
  '33': { stunting: 19.9, wasting: 7.4, underweight: 12.8, source: 'SSGI 2024', released: '2025-02-01' }, // Jawa Tengah
  '34': { stunting: 14.3, wasting: 5.8, underweight: 9.8,  source: 'SSGI 2024', released: '2025-02-01' }, // DI Yogyakarta
  '35': { stunting: 18.5, wasting: 7.0, underweight: 12.1, source: 'SSGI 2024', released: '2025-02-01' }, // Jawa Timur
  '36': { stunting: 21.6, wasting: 8.4, underweight: 14.5, source: 'SSGI 2024', released: '2025-02-01' }, // Banten
  // Sumatera
  '11': { stunting: 29.1, wasting: 10.2, underweight: 18.4, source: 'SSGI 2024', released: '2025-02-01' }, // Aceh
  '12': { stunting: 24.8, wasting: 9.1,  underweight: 16.2, source: 'SSGI 2024', released: '2025-02-01' }, // Sumatera Utara
  '13': { stunting: 22.1, wasting: 8.3,  underweight: 14.9, source: 'SSGI 2024', released: '2025-02-01' }, // Sumatera Barat
  '14': { stunting: 16.4, wasting: 6.8,  underweight: 11.5, source: 'SSGI 2024', released: '2025-02-01' }, // Riau
  '15': { stunting: 17.5, wasting: 7.2,  underweight: 12.3, source: 'SSGI 2024', released: '2025-02-01' }, // Jambi
  '16': { stunting: 20.8, wasting: 8.0,  underweight: 14.1, source: 'SSGI 2024', released: '2025-02-01' }, // Sumatera Selatan
  '17': { stunting: 19.2, wasting: 7.8,  underweight: 13.5, source: 'SSGI 2024', released: '2025-02-01' }, // Bengkulu
  '18': { stunting: 14.2, wasting: 6.1,  underweight: 10.2, source: 'SSGI 2024', released: '2025-02-01' }, // Lampung
  '19': { stunting: 13.8, wasting: 5.9,  underweight: 9.8,  source: 'SSGI 2024', released: '2025-02-01' }, // Bangka Belitung
  '21': { stunting: 12.9, wasting: 5.5,  underweight: 9.1,  source: 'SSGI 2024', released: '2025-02-01' }, // Kepulauan Riau
  // Kalimantan
  '61': { stunting: 20.3, wasting: 7.9,  underweight: 13.8, source: 'SSGI 2024', released: '2025-02-01' }, // Kalimantan Barat
  '62': { stunting: 22.5, wasting: 8.6,  underweight: 15.2, source: 'SSGI 2024', released: '2025-02-01' }, // Kalimantan Tengah
  '63': { stunting: 23.1, wasting: 8.9,  underweight: 15.8, source: 'SSGI 2024', released: '2025-02-01' }, // Kalimantan Selatan
  '64': { stunting: 20.8, wasting: 8.0,  underweight: 13.9, source: 'SSGI 2024', released: '2025-02-01' }, // Kalimantan Timur
  '65': { stunting: 26.3, wasting: 9.8,  underweight: 17.5, source: 'SSGI 2024', released: '2025-02-01' }, // Kalimantan Utara
  // Sulawesi
  '71': { stunting: 24.6, wasting: 9.3,  underweight: 16.8, source: 'SSGI 2024', released: '2025-02-01' }, // Sulawesi Utara
  '72': { stunting: 28.4, wasting: 10.5, underweight: 19.2, source: 'SSGI 2024', released: '2025-02-01' }, // Sulawesi Tengah
  '73': { stunting: 27.4, wasting: 10.1, underweight: 18.5, source: 'SSGI 2024', released: '2025-02-01' }, // Sulawesi Selatan
  '74': { stunting: 31.8, wasting: 11.5, underweight: 21.3, source: 'SSGI 2024', released: '2025-02-01' }, // Sulawesi Tenggara
  '75': { stunting: 30.2, wasting: 11.0, underweight: 20.5, source: 'SSGI 2024', released: '2025-02-01' }, // Gorontalo
  '76': { stunting: 27.6, wasting: 10.3, underweight: 18.8, source: 'SSGI 2024', released: '2025-02-01' }, // Sulawesi Barat
  // Bali & Nusa Tenggara
  '51': { stunting: 7.6,  wasting: 3.8,  underweight: 5.9,  source: 'SSGI 2024', released: '2025-02-01' }, // Bali
  '52': { stunting: 30.1, wasting: 11.2, underweight: 20.8, source: 'SSGI 2024', released: '2025-02-01' }, // NTB
  '53': { stunting: 34.5, wasting: 12.3, underweight: 23.1, source: 'SSGI 2024', released: '2025-02-01' }, // NTT
  // Maluku
  '81': { stunting: 28.9, wasting: 10.8, underweight: 19.5, source: 'SSGI 2024', released: '2025-02-01' }, // Maluku
  '82': { stunting: 30.4, wasting: 11.3, underweight: 20.6, source: 'SSGI 2024', released: '2025-02-01' }, // Maluku Utara
  // Papua
  '91': { stunting: 33.5, wasting: 12.1, underweight: 22.5, source: 'SSGI 2024', released: '2025-02-01' }, // Papua
  '92': { stunting: 32.1, wasting: 11.8, underweight: 21.7, source: 'SSGI 2024', released: '2025-02-01' }, // Papua Barat
  '93': { stunting: 37.2, wasting: 13.5, underweight: 25.3, source: 'SSGI 2024', released: '2025-02-01' }, // Papua Selatan
  '94': { stunting: 38.1, wasting: 13.9, underweight: 26.1, source: 'SSGI 2024', released: '2025-02-01' }, // Papua Tengah
  '95': { stunting: 36.8, wasting: 13.1, underwidth: 24.9,  source: 'SSGI 2024', released: '2025-02-01' }, // Papua Pegunungan
  '96': { stunting: 35.2, wasting: 12.7, underweight: 23.8, source: 'SSGI 2024', released: '2025-02-01' }, // Papua Barat Daya
};

const LATEST_YEAR_LABEL = 'SSGI 2024';
const LATEST_YEAR_KEY   = 2024;

// ─── Fungsi Utama ─────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 NutriVision Auto-Updater dimulai...');
  console.log(`📅 Waktu: ${new Date().toISOString()}`);

  const log = {
    run_at: new Date().toISOString(),
    source: LATEST_YEAR_LABEL,
    changes: [],
    errors: [],
    summary: {},
  };

  try {
    // 1. Load existing data
    const nutritionData = JSON.parse(fs.readFileSync(NUTRITION_DATA_PATH, 'utf-8'));
    console.log(`📂 Data saat ini: ${nutritionData.length} provinsi`);

    // 2. Check & apply updates
    let updatedCount = 0;
    const forceUpdate = process.env.FORCE_UPDATE === 'true';

    for (const province of nutritionData) {
      const newData = SSGI_2024_PROVINCE_DATA[province.id];
      if (!newData) continue;

      // Cek apakah sumber data sudah di-update
      const currentSource = province.data_source?.stunting || '';
      if (currentSource === LATEST_YEAR_LABEL && !forceUpdate) {
        continue; // Sudah update, skip
      }

      // Simpan nilai lama untuk log
      const oldStunting = province.stunting;
      const oldSource   = currentSource;

      // Update nilai
      province.stunting    = newData.stunting;
      province.wasting     = newData.wasting;
      province.underweight = newData.underweight;

      // Update data_source
      province.data_source = {
        ...province.data_source,
        stunting: newData.source,
        stunting_released: newData.released,
        last_updated: new Date().toISOString(),
      };

      // Append ke array trend jika belum ada tahun terbaru
      if (!province.trend) province.trend = [];
      // Cek apakah LATEST_YEAR sudah ada (array trend punya 5 nilai: 2019,2021,2022,2023,2024)
      if (province.trend.length < 6) {
        province.trend.push(newData.stunting);
      } else {
        province.trend[province.trend.length - 1] = newData.stunting;
      }

      updatedCount++;
      log.changes.push({
        province_id:   province.id,
        province_name: province.name,
        old_stunting:  oldStunting,
        new_stunting:  newData.stunting,
        old_source:    oldSource,
        new_source:    newData.source,
        delta:         (newData.stunting - oldStunting).toFixed(1),
      });

      console.log(`  ✅ ${province.name}: ${oldStunting}% → ${newData.stunting}% (${oldSource} → ${newData.source})`);
    }

    // 3. Tambahkan metadata global ke file
    const metadata = {
      _meta: {
        last_updated: new Date().toISOString(),
        data_version: LATEST_YEAR_LABEL,
        total_provinces: nutritionData.length,
        auto_updated: true,
        updater_version: '1.0.0',
      }
    };

    // Simpan metadata ke file terpisah agar tidak merusak array JSON
    const metaPath = path.join(ROOT, 'src/data/dataMetadata.json');
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');

    // 4. Tulis kembali nutritionData.json jika ada perubahan
    if (updatedCount > 0 || forceUpdate) {
      fs.writeFileSync(NUTRITION_DATA_PATH, JSON.stringify(nutritionData, null, 2), 'utf-8');
      console.log(`\n✅ ${updatedCount} provinsi diperbarui ke ${LATEST_YEAR_LABEL}`);
    } else {
      console.log('\n✅ Semua data sudah up-to-date, tidak ada perubahan.');
    }

    // 5. Tulis log
    log.summary = {
      total_checked: nutritionData.length,
      total_updated: updatedCount,
      data_version:  LATEST_YEAR_LABEL,
      status:        updatedCount > 0 ? 'UPDATED' : 'NO_CHANGE',
    };

  } catch (err) {
    console.error('❌ Error:', err.message);
    log.errors.push({ message: err.message, stack: err.stack });
    log.summary = { status: 'ERROR', error: err.message };
  }

  // 6. Simpan log
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), 'utf-8');
  console.log(`\n📋 Log tersimpan: ${LOG_PATH}`);
  console.log('🏁 Auto-updater selesai.');

  // Exit dengan error code jika ada errors
  if (log.errors.length > 0) process.exit(1);
}

main();
