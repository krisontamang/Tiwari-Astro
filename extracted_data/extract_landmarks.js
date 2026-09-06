const fs = require('fs');

const readable = fs.readFileSync('home_readable.js', 'utf8');
const lines = readable.split('\n');

const headings = [];
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.includes('"h1"') || l.includes('"h2"') || l.includes('"h3"') || l.includes('"header"') || l.includes('"footer"') || l.includes('"section"')) {
    const chunk = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 6)).join(' ');
    headings.push(chunk.replace(/\s+/g, ' '));
  }
}

console.log('Total section/heading landmarks:', headings.length);
headings.forEach((h, idx) => console.log(`${idx + 1}: ${h.slice(0, 160)}`));
