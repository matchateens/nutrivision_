import fs from 'fs';
const content = fs.readFileSync('C:\\Users\\E5300\\.gemini\\antigravity\\brain\\1fc5b99b-0bf2-4e8a-a68b-752057681877\\.system_generated\\steps\\359\\content.md', 'utf8');
const lines = content.split('\n');
const start = lines.findIndex(l => l.trim() === '{');
const json = lines.slice(start).join('\n');
fs.writeFileSync('public/indonesia-province.json', json);
console.log('Done');
