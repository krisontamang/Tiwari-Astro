const fs = require('fs');

const js = fs.readFileSync('assets/index-ChgpL9kq.js', 'utf8');

// Search for data-loc strings to find all original source files!
const locs = js.match(/client\/src\/[a-zA-Z0-9_\-\.\/]+/g) || [];
const uniqueFiles = Array.from(new Set(locs));
console.log('Original Source Files found in bundle:');
uniqueFiles.forEach(f => console.log(' - ' + f));

// Extract the Home.tsx component code segment
const homeIdx = js.indexOf('client/src/pages/Home.tsx');
console.log('\nFirst occurrence of client/src/pages/Home.tsx at index:', homeIdx);

// Find all occurrences of client/src/pages/
const allMatches = [];
let idx = 0;
while ((idx = js.indexOf('client/src/', idx)) !== -1) {
  const snippet = js.substring(idx, idx + 60).split('"')[0].split("'")[0];
  allMatches.push(snippet);
  idx += 15;
}
console.log('Total file references:', allMatches.length);
console.log('Unique files/locations count:', new Set(allMatches).size);

fs.writeFileSync('source_locations.json', JSON.stringify(Array.from(new Set(allMatches)), null, 2));
