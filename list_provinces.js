import fs from 'fs';
const data = JSON.parse(fs.readFileSync('C:\\Users\\E5300\\Music\\Nutri\\indonesia-province.json', 'utf8'));
const provinces = data.features.map(f => f.properties.NAME_1 || f.properties.Propinsi || f.properties.name || JSON.stringify(f.properties));
console.log(provinces.sort());
