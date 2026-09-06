const fs = require('fs');

const js = fs.readFileSync('assets/index-ChgpL9kq.js', 'utf8');

// Find where Es is defined
const esDef = js.match(/const\s+Es\s*=\s*[^;]+/);
console.log('Es definition:', esDef ? esDef[0] : 'not found');

// Find all usages of Es.
const esUsages = js.match(/Es\.[a-zA-Z0-9_\.]+/g) || [];
console.log('Es usages:', Array.from(new Set(esUsages)));
