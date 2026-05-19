import fs from 'fs';
const data = JSON.parse(fs.readFileSync('C:\\Users\\E5300\\Music\\Nutri\\indonesia-province.json', 'utf8'));
const features = data.features.map(f => ({
  name: f.properties.NAME_1 || f.properties.Propinsi || f.properties.name || f.properties.nm_propinsi,
  id: f.properties.prop0 || f.id || f.properties.id || f.properties.KODE,
  all_props: f.properties
}));
console.log(JSON.stringify(features, null, 2));
