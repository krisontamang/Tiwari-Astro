const fs = require('fs');

const js = fs.readFileSync('assets/index-ChgpL9kq.js', 'utf8');

// Find verifyBossCode in the bundle
const bossIdx = js.indexOf('verifyBossCode');
if (bossIdx !== -1) {
  console.log('verifyBossCode context:\n', js.substring(bossIdx - 100, bossIdx + 400));
}

// Find kundali.extract
const extractIdx = js.indexOf('kundali.extract');
if (extractIdx !== -1) {
  console.log('kundali.extract context:\n', js.substring(extractIdx - 100, extractIdx + 400));
}
