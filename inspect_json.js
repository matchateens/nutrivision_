import fs from 'fs';

// Read a small kabupaten file to check property structure
const raw = fs.readFileSync('public/kabupaten/bali.json');
const geo = JSON.parse(raw);

console.log('=== Total features:', geo.features.length);
console.log('=== First feature properties:');
console.log(JSON.stringify(geo.features[0].properties, null, 2));
console.log('\n=== All district names:');
geo.features.forEach(f => {
  console.log(`  - ${f.properties.NAME_2} (ID_2: ${f.properties.ID_2}, NAME_1: ${f.properties.NAME_1})`);
});

// Also check the name mapping
console.log('\n=== Province file names from GeoJSON source:');
const srcGeo = JSON.parse(fs.readFileSync('public/indonesia-kabupaten.json'));
const provNames = [...new Set(srcGeo.features.map(f => f.properties.NAME_1))].sort();
console.log(provNames.join('\n'));
