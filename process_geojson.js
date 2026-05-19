import fs from 'fs';
import path from 'path';
import rewind from '@turf/rewind';

const dir = 'public/kabupaten';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Mapping: GeoJSON NAME_1 → nutritionData.json name (slug)
// This ensures the drill-down URL matches what App.jsx generates
const NAME_TO_SLUG = {
  "Aceh":                  "aceh",
  "Sumatera Utara":        "sumatera-utara",
  "Sumatera Barat":        "sumatera-barat",
  "Riau":                  "riau",
  "Jambi":                 "jambi",
  "Sumatera Selatan":      "sumatera-selatan",
  "Bengkulu":              "bengkulu",
  "Lampung":               "lampung",
  "Bangka Belitung":       "bangka-belitung",
  "Kepulauan Riau":        "kepulauan-riau",
  "Jakarta Raya":          "dki-jakarta",           // NAME_1 ≠ our name
  "Jawa Barat":            "jawa-barat",
  "Jawa Tengah":           "jawa-tengah",
  "Yogyakarta":            "di-yogyakarta",         // NAME_1 ≠ our name
  "Jawa Timur":            "jawa-timur",
  "Banten":                "banten",
  "Bali":                  "bali",
  "Nusa Tenggara Barat":   "nusa-tenggara-barat",
  "Nusa Tenggara Timur":   "nusa-tenggara-timur",
  "Kalimantan Barat":      "kalimantan-barat",
  "Kalimantan Tengah":     "kalimantan-tengah",
  "Kalimantan Selatan":    "kalimantan-selatan",
  "Kalimantan Timur":      "kalimantan-timur",
  "Kalimantan Utara":      "kalimantan-utara",
  "Sulawesi Utara":        "sulawesi-utara",
  "Sulawesi Tengah":       "sulawesi-tengah",
  "Sulawesi Selatan":      "sulawesi-selatan",
  "Sulawesi Tenggara":     "sulawesi-tenggara",
  "Gorontalo":             "gorontalo",
  "Sulawesi Barat":        "sulawesi-barat",
  "Maluku":                "maluku",
  "Maluku Utara":          "maluku-utara",
  "Papua":                 "papua",
  "Papua Barat":           "papua-barat",
};

console.log('Reading 96MB GeoJSON...');
const rawData = fs.readFileSync('public/indonesia-kabupaten.json', 'utf-8');
const geojson = JSON.parse(rawData);

console.log(`Total features: ${geojson.features.length}`);

const provinces = {};

geojson.features.forEach((feature, idx) => {
  const provName = feature.properties.NAME_1 || 'Unknown';
  const slug = NAME_TO_SLUG[provName];
  if (!slug) {
    console.warn(`  ⚠ Unknown province: "${provName}" — skipping`);
    return;
  }

  if (!provinces[slug]) {
    provinces[slug] = {
      type: "FeatureCollection",
      features: []
    };
  }

  // Fix winding order using @turf/rewind (RFC 7946: outer ring = counter-clockwise)
  try {
    const rewound = rewind(feature, { reverse: true });
    // Add a sequential ID since ID_2 is undefined
    rewound.properties._districtId = `${slug}-${idx}`;
    provinces[slug].features.push(rewound);
  } catch (e) {
    // If rewind fails, push original with fixed id
    feature.properties._districtId = `${slug}-${idx}`;
    provinces[slug].features.push(feature);
  }
});

console.log('Writing rewound GeoJSON files per province...');
let totalSize = 0;
Object.keys(provinces).sort().forEach(slug => {
  const filePath = path.join(dir, `${slug}.json`);
  const content = JSON.stringify(provinces[slug]);
  fs.writeFileSync(filePath, content);
  const sizeMB = (content.length / 1024 / 1024).toFixed(2);
  totalSize += content.length;
  console.log(`  ✓ ${slug}.json — ${provinces[slug].features.length} districts — ${sizeMB}MB`);
});

console.log(`\nDone! ${Object.keys(provinces).length} provinces, total ${(totalSize/1024/1024).toFixed(1)}MB`);
