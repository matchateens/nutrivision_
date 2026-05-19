import fs from 'fs';
const data = JSON.parse(fs.readFileSync('indonesia-province.json', 'utf8'));
const list = data.features.map(f => ({ name: f.properties.Propinsi, kode: f.properties.kode, id_prop: f.properties.ID }));
console.log(list);
