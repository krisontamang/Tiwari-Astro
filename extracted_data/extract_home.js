const fs = require('fs');

const js = fs.readFileSync('assets/index-ChgpL9kq.js', 'utf8');

// The Home.tsx code starts around 440000
const homeStart = js.lastIndexOf('function', js.indexOf('client/src/pages/Home.tsx'));
const homeSlice = js.substring(homeStart > 0 ? homeStart : 440000);

fs.writeFileSync('home_extracted.js', homeSlice, 'utf8');
console.log('Saved home_extracted.js, length:', homeSlice.length);
