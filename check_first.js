import fs from 'fs';
const data = JSON.parse(fs.readFileSync('indonesia-province.json', 'utf8'));
console.log('First feature properties:', data.features[0].properties);
console.log('First feature id:', data.features[0].id);
