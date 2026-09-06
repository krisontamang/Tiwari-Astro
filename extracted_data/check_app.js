const fs = require('fs');

const js = fs.readFileSync('assets/index-ChgpL9kq.js', 'utf8');

// Find App component
const appIdx = js.indexOf('client/src/App.tsx');
if (appIdx !== -1) {
  console.log('App.tsx context:\n', js.substring(appIdx - 200, appIdx + 600));
}
