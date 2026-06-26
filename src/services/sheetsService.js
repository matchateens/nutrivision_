/**
 * NutriVision ID — Google Sheets Live CMS Service
 *
 * Cara kerja:
 * 1. App fetch dari Google Sheets yang di-"Publish to Web" sebagai CSV
 * 2. CSV di-parse dan di-map ke format nutritionData yang sudah ada
 * 3. Hasil di-cache di localStorage selama 24 jam (TTL)
 * 4. Jika Sheets tidak bisa diakses → fallback ke JSON lokal
 *
 * Setup Google Sheets (sekali saja):
 * 1. Buka Google Sheets dengan data gizi Anda
 * 2. File → Share → Publish to web → Sheet1 → CSV → Publish
 * 3. Copy URL yang muncul → paste ke SHEETS_CSV_URL di bawah
 */

// ─── KONFIGURASI ──────────────────────────────────────────────────────────────
// Ganti URL ini dengan URL Google Sheets Anda yang sudah di-publish as CSV
const SHEETS_CSV_URL = import.meta.env.VITE_SHEETS_CSV_URL || null;

// Cache TTL: 24 jam dalam milliseconds
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_KEY    = 'nutrivision_sheets_data';
const CACHE_META_KEY = 'nutrivision_sheets_meta';

// ─── Parser CSV ke Array ──────────────────────────────────────────────────────
function parseCSV(csvText) {
  const lines  = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    // Handle comma dalam quotes
    const values = [];
    let inQuote  = false;
    let current  = '';
    
    for (const char of line) {
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || '';
    });
    return obj;
  }).filter(row => row.id && row.name); // Hanya baris yang punya id & name
}

// ─── Map CSV Row ke Format nutritionData ──────────────────────────────────────
function mapRowToProvince(row) {
  return {
    id:          String(row.id || '').trim(),
    name:        String(row.name || '').trim(),
    region:      String(row.region || '').trim(),
    stunting:    parseFloat(row.stunting)    || 0,
    wasting:     parseFloat(row.wasting)     || 0,
    underweight: parseFloat(row.underweight) || 0,
    hunger:      parseFloat(row.hunger)      || 0,
    population:  parseInt(row.population)    || 0,
    target_2029: parseFloat(row.target_2029) || 14.0,
    mbg_progress: parseInt(row.mbg_progress) || 0,
    mbg_dapur:   parseInt(row.mbg_dapur)     || 0,
    mbg_penerima: parseInt(row.mbg_penerima) || 0,
    mbg_biaya:   parseInt(row.mbg_biaya)     || 15000,
    trend: row.trend
      ? String(row.trend).split(';').map(Number)
      : [],
    data_source: {
      stunting: String(row.data_source_stunting || 'Sheets Live'),
      mbg:      String(row.data_source_mbg      || 'Estimasi BGN'),
      last_updated: new Date().toISOString(),
      from_sheets: true,
    },
  };
}

// ─── Cache Helpers ────────────────────────────────────────────────────────────
function getCachedData() {
  try {
    const meta = localStorage.getItem(CACHE_META_KEY);
    if (!meta) return null;

    const { cachedAt, url } = JSON.parse(meta);
    const age = Date.now() - new Date(cachedAt).getTime();

    // Cache expired atau URL berubah → invalidate
    if (age > CACHE_TTL_MS || url !== SHEETS_CSV_URL) return null;

    const data = localStorage.getItem(CACHE_KEY);
    if (!data) return null;

    return {
      data: JSON.parse(data),
      cachedAt,
      ageMinutes: Math.round(age / 60000),
    };
  } catch {
    return null;
  }
}

function setCachedData(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_META_KEY, JSON.stringify({
      cachedAt: new Date().toISOString(),
      url: SHEETS_CSV_URL,
      count: data.length,
    }));
  } catch (e) {
    console.warn('[SheetsService] Gagal menyimpan cache:', e.message);
  }
}

function clearCache() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_META_KEY);
}

// ─── Fungsi Utama: Fetch Data ─────────────────────────────────────────────────
/**
 * Ambil data dari Google Sheets atau cache.
 * Returns: { data: Array, source: 'sheets'|'cache'|'local', cachedAt?: string }
 */
export async function fetchLiveData() {
  // Jika tidak ada URL Sheets → langsung return null (gunakan data lokal)
  if (!SHEETS_CSV_URL) {
    return { data: null, source: 'local', reason: 'Sheets URL belum dikonfigurasi' };
  }

  // Cek cache dulu
  const cached = getCachedData();
  if (cached) {
    console.log(`[SheetsService] ✅ Menggunakan cache (${cached.ageMinutes} menit lalu)`);
    return { data: cached.data, source: 'cache', cachedAt: cached.cachedAt };
  }

  // Fetch dari Sheets
  try {
    console.log('[SheetsService] 🔄 Fetching data dari Google Sheets...');
    const response = await fetch(SHEETS_CSV_URL, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000), // Timeout 8 detik
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const csvText = await response.text();
    const rows    = parseCSV(csvText);
    const data    = rows.map(mapRowToProvince);

    if (data.length === 0) {
      throw new Error('Data dari Sheets kosong');
    }

    // Simpan ke cache
    setCachedData(data);

    console.log(`[SheetsService] ✅ Berhasil fetch ${data.length} provinsi dari Sheets`);
    return { data, source: 'sheets', cachedAt: new Date().toISOString() };

  } catch (err) {
    console.warn(`[SheetsService] ⚠️ Gagal fetch dari Sheets: ${err.message}`);
    return { data: null, source: 'local', reason: err.message };
  }
}

/**
 * Paksa refresh data (clear cache lalu fetch ulang)
 */
export async function forceRefresh() {
  clearCache();
  return fetchLiveData();
}

/**
 * Cek status koneksi ke Sheets tanpa fetch penuh
 */
export function getCacheStatus() {
  const meta = localStorage.getItem(CACHE_META_KEY);
  if (!meta) return { cached: false };
  
  const { cachedAt, count } = JSON.parse(meta);
  const age = Date.now() - new Date(cachedAt).getTime();
  
  return {
    cached:      true,
    cachedAt,
    ageMinutes:  Math.round(age / 60000),
    count,
    expired:     age > CACHE_TTL_MS,
  };
}

export default { fetchLiveData, forceRefresh, getCacheStatus };
