const fs = require('fs');

const js = fs.readFileSync('assets/index-ChgpL9kq.js', 'utf8');

// Find trpc procedures
const trpcMatches = js.match(/trpc\.[a-zA-Z0-9_\.]+/g) || [];
console.log('trpc calls:', Array.from(new Set(trpcMatches)));

// Find all fetch/api endpoints
const apiMatches = js.match(/\/api\/[a-zA-Z0-9_\-\/]+/g) || [];
console.log('api paths:', Array.from(new Set(apiMatches)));

// Look for boss code in home_readable.js
const readable = fs.readFileSync('home_readable.js', 'utf8');
const lines = readable.split('\n');
lines.forEach((line, i) => {
  if (line.includes('Boss') || line.includes('boss')) {
    console.log(`Line ${i}:`, line);
    console.log(lines.slice(Math.max(0, i-5), Math.min(lines.length, i+10)).join('\n'));
  }
});
