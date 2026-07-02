const fs = require('fs');
const https = require('https');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

async function main() {
  const base = 'https://raw.githubusercontent.com/khaledslens-sudo/mystore/main/';
  const files = [
    ['public/index.html', 'public/index.html'],
    ['public/app.js', 'public/app.js'],
    ['public/admin.html', 'public/admin.html'],
    ['public/admin.js', 'public/admin.js'],
    ['public/wilayas.js', 'public/wilayas.j

