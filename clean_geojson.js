import fs from 'fs';
const content = fs.readFileSync('C:\\Users\\E5300\\.gemini\\antigravity\\brain\\1fc5b99b-0bf2-4e8a-a68b-752057681877\\.system_generated\\steps\\359\\content.md', 'utf8');
const jsonPart = content.split('---')[1].trim();
fs.writeFileSync('public/indonesia-province.json', jsonPart);
console.log('GeoJSON updated successfully');
