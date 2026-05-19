import fs from 'fs';

console.log('Generating District Nutrition Data (aligned with GeoJSON NAME_1)...');
const rawGeo = fs.readFileSync('public/indonesia-kabupaten.json');
const geojson = JSON.parse(rawGeo);

// Province baseline stunting by NAME_1 (GeoJSON)
const baselines = {
  "Aceh": 31.2, "Sumatera Utara": 21.1, "Sumatera Barat": 25.2,
  "Riau": 17.0, "Jambi": 18.0, "Sumatera Selatan": 18.6,
  "Bengkulu": 19.8, "Lampung": 14.6, "Bangka Belitung": 18.5,
  "Kepulauan Riau": 15.4, "Jakarta Raya": 14.8,
  "Jawa Barat": 20.2, "Jawa Tengah": 20.8, "Yogyakarta": 16.4,
  "Jawa Timur": 19.2, "Banten": 20.0, "Bali": 8.0,
  "Nusa Tenggara Barat": 32.7, "Nusa Tenggara Timur": 35.3,
  "Kalimantan Barat": 27.8, "Kalimantan Tengah": 26.9,
  "Kalimantan Selatan": 24.6, "Kalimantan Timur": 23.9,
  "Kalimantan Utara": 22.1, "Sulawesi Utara": 20.5,
  "Sulawesi Tengah": 28.2, "Sulawesi Selatan": 23.9,
  "Sulawesi Tenggara": 27.7, "Gorontalo": 23.8,
  "Sulawesi Barat": 35.0, "Maluku": 26.1, "Maluku Utara": 26.1,
  "Papua": 34.6, "Papua Barat": 30.0,
};

const seenNames = new Set();
const districtData = [];

geojson.features.forEach((f, idx) => {
  const prov = f.properties.NAME_1;
  const kab  = f.properties.NAME_2;
  if (!kab) return;

  // Deduplicate
  const key = `${prov}__${kab}`;
  if (seenNames.has(key)) return;
  seenNames.add(key);

  const base = baselines[prov] || 22.0;
  
  // Add realistic random variation around province baseline
  const seed = (kab.charCodeAt(0) * 7 + kab.charCodeAt(1) * 13 + idx) % 100;
  const variation = (seed / 100) * 10 - 5; // -5 to +5
  
  const stunting = Math.max(5, Math.min(50, base + variation));
  const wasting  = Math.max(2, Math.min(25, 7 + variation * 0.5));
  const underweight = Math.max(3, Math.min(35, 12 + variation * 0.7));
  
  districtData.push({
    id: `${prov.toLowerCase().replace(/\s+/g, '-')}-${idx}`,
    name: kab,
    province: prov,  // This is NAME_1 from GeoJSON
    stunting: parseFloat(stunting.toFixed(1)),
    wasting: parseFloat(wasting.toFixed(1)),
    underweight: parseFloat(underweight.toFixed(1)),
    population: Math.floor(100000 + seed * 10000),
    trend: [
      parseFloat((stunting + 4).toFixed(1)),
      parseFloat((stunting + 2.5).toFixed(1)),
      parseFloat((stunting + 1.2).toFixed(1)),
      parseFloat((stunting + 0.5).toFixed(1)),
      parseFloat(stunting.toFixed(1))
    ],
    target_2029: parseFloat((stunting * 0.7).toFixed(1)),
    mbg_progress: Math.floor(30 + seed * 0.65),
    mbg_dapur: Math.floor(5 + seed * 0.5),
    mbg_penerima: Math.floor(5000 + seed * 500),
    mbg_biaya: 15000
  });
});

fs.writeFileSync('src/data/districtData.json', JSON.stringify(districtData, null, 2));
console.log(`Success! Generated data for ${districtData.length} districts across ${Object.keys(baselines).length} provinces.`);
