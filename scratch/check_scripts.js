const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Find all script tags in index.html in order
const scriptMatches = [...html.matchAll(/<script\s+src="([^"]+)"/g)];
console.log('Scripts loaded:', scriptMatches.map(m => m[1]));

// Check if any script file is missing
for (const m of scriptMatches) {
  const src = m[1].split('?')[0];
  if (src.startsWith('http')) continue;
  if (!fs.existsSync(src)) {
    console.error('MISSING SCRIPT FILE:', src);
  }
}