import fs from 'fs';
import https from 'https';

const url = 'https://raw.githubusercontent.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces/main/GeoJSON/indonesia-38-provinces.geojson';
const file = fs.createWriteStream('public/indonesia-province.json');

https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download completed');
  });
}).on('error', (err) => {
  fs.unlink('public/indonesia-province.json');
  console.error('Error downloading:', err.message);
});
