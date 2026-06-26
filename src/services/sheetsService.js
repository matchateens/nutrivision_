/**
 * NutriVision ID — Live Data Service
 *
 * Urutan prioritas fetch:
 * 1. GitHub Raw  → fetch langsung dari repo GitHub (otomatis update setiap GitHub Actions commit)
 * 2. Google Sheets → jika VITE_SHEETS_CSV_URL dikonfigurasi di .env.local
 * 3. Cache localStorage → hasil fetch sebelumnya (TTL 6 jam)
 * 4. Data lokal JSON → fallback jika semua gagal
 *
 * Tidak perlu setup apapun untuk GitHub Raw — sudah berjalan otomatis!
 */

// ─── KONFIGURASI ──────────────────────────────────────────────────────────────

// GitHub Raw URL — fetch langsung dari repo, selalu up-to-date dengan commit terbaru
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/matchateens/nutrivision_/main';
const GITHUB_NUTRITION_URL = `${GITHUB_RAW_BASE}/src/data/nutritionData.json`;
const GITHUB_METADATA_URL  = `${GITHUB_RAW_BASE}/src/data/dataMetadata.json`;

// Google Sheets (opsional) — isi di .env.local jika ingin pakai Sheets
const SHEETS_CSV_URL = import.meta.env.VITE_SHEETS_CSV_URL || null;

// Cache TTL: 6 jam
const CACHE_TTL_MS   = 6 * 60 * 60 * 1000;
const CACHE_KEY      = 'nutrivision_live_data';
const CACHE_META_KEY = 'nutrivision_live_meta';

// ─── Cache Helpers ────────────────────────────────────────────────────────────
function getCache() {
  try {
    const meta = localStorage.getItem(CACHE_META_KEY);
    if (!meta) return null;
    const { cachedAt, source } = JSON.parse(meta);
    if (Date.now() - new Date(cachedAt).getTime() > CACHE_TTL_MS) return null;
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return { data: JSON.parse(raw), cachedAt, source };
  } catch { return null; }
}

function setCache(data, source) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_META_KEY, JSON.stringify({
      cachedAt: new Date().toISOString(),
      source,
      count: data.length,
    }));
  } catch (e) {
    console.warn('[LiveData] Cache gagal:', e.message);
  }
}

function clearCache() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_META_KEY);
}

// ─── Fetch dari GitHub Raw ────────────────────────────────────────────────────
async function fetchFromGitHub() {
  const res = await fetch(GITHUB_NUTRITION_URL, {
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`GitHub HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error('Data GitHub kosong');

  // Ambil metadata sekaligus
  let meta = null;
  try {
    const metaRes = await fetch(GITHUB_METADATA_URL, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (metaRes.ok) meta = await metaRes.json();
  } catch { /* metadata opsional */ }

  return { data, meta };
}

// ─── Parser CSV (untuk Google Sheets) ────────────────────────────────────────
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  return lines.slice(1).map(line => {
    const values = [];
    let inQuote = false, current = '';
    for (const char of line) {
      if (char === '"') { inQuote = !inQuote; }
      else if (char === ',' && !inQuote) { values.push(current.trim()); current = ''; }
      else { current += char; }
    }
    values.push(current.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  }).filter(r => r.id && r.name);
}

function mapCSVRow(row) {
  return {
    id:          String(row.id).trim(),
    name:        String(row.name).trim(),
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
    trend: row.trend ? String(row.trend).split(';').map(Number) : [],
    data_source: {
      stunting: row.data_source_stunting || 'Live Sheets',
      mbg:      row.data_source_mbg      || 'Estimasi BGN',
      from_sheets: true,
    },
  };
}

// ─── Fetch dari Google Sheets ─────────────────────────────────────────────────
async function fetchFromSheets() {
  if (!SHEETS_CSV_URL) throw new Error('Sheets URL tidak dikonfigurasi');
  const res = await fetch(SHEETS_CSV_URL, {
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Sheets HTTP ${res.status}`);
  const csv  = await res.text();
  const data = parseCSV(csv).map(mapCSVRow);
  if (data.length === 0) throw new Error('Data Sheets kosong');
  return { data, meta: null };
}

// ─── Fungsi Utama ─────────────────────────────────────────────────────────────
/**
 * Ambil data live dengan fallback otomatis.
 * Return: { data, source, cachedAt, dataVersion, meta }
 */
export async function fetchLiveData() {
  // 1. Cek cache dulu
  const cached = getCache();
  if (cached) {
    console.log(`[LiveData] ✅ Cache hit (sumber: ${cached.source})`);
    return { data: cached.data, source: 'cache', cachedAt: cached.cachedAt };
  }

  // 2. Coba Google Sheets dulu (jika dikonfigurasi) — data paling fresh dari user
  if (SHEETS_CSV_URL) {
    try {
      console.log('[LiveData] 🔄 Mencoba Google Sheets...');
      const { data } = await fetchFromSheets();
      setCache(data, 'sheets');
      console.log(`[LiveData] ✅ Sheets OK — ${data.length} provinsi`);
      return { data, source: 'sheets', cachedAt: new Date().toISOString() };
    } catch (e) {
      console.warn('[LiveData] ⚠️ Sheets gagal, coba GitHub:', e.message);
    }
  }

  // 3. Coba GitHub Raw — selalu sinkron dengan commit terbaru
  try {
    console.log('[LiveData] 🔄 Mencoba GitHub Raw...');
    const { data, meta } = await fetchFromGitHub();
    setCache(data, 'github');
    console.log(`[LiveData] ✅ GitHub OK — ${data.length} provinsi`);
    return {
      data,
      source: 'github',
      cachedAt: new Date().toISOString(),
      meta,
    };
  } catch (e) {
    console.warn('[LiveData] ⚠️ GitHub gagal, pakai data lokal:', e.message);
  }

  // 4. Fallback ke data lokal
  return { data: null, source: 'local', reason: 'Semua sumber gagal' };
}

/**
 * Paksa refresh — abaikan cache
 */
export async function forceRefresh() {
  clearCache();
  return fetchLiveData();
}

export function getCacheStatus() {
  const meta = localStorage.getItem(CACHE_META_KEY);
  if (!meta) return { cached: false };
  const { cachedAt, count, source } = JSON.parse(meta);
  const age = Date.now() - new Date(cachedAt).getTime();
  return { cached: true, cachedAt, ageMinutes: Math.round(age / 60000), count, source, expired: age > CACHE_TTL_MS };
}

export default { fetchLiveData, forceRefresh, getCacheStatus };
