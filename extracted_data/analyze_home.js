const fs = require('fs');

const code = fs.readFileSync('home_extracted.js', 'utf8');

// Let's inspect headings, buttons, forms, and features
const nepaliText = [];
const regex = /"([^"\\]*[\u0900-\u097F][^"\\]*)"/g;
let m;
while ((m = regex.exec(code)) !== null) {
  nepaliText.push(m[1]);
}

const uniqueTexts = Array.from(new Set(nepaliText));
console.log('Unique Nepali texts count:', uniqueTexts.length);
console.log('Sample texts:\n', uniqueTexts.slice(0, 30).join('\n'));

// Let's check icons and Lucide icons used
const lucideIcons = code.match(/lucide-react|Icon[A-Z][a-zA-Z]+/g) || [];
console.log('Icons found:', Array.from(new Set(lucideIcons)));

// Check state variables
const stateVars = code.match(/useState\([^)]*\)/g) || [];
console.log('useState count:', stateVars.length);
console.log('useState calls:', stateVars);

fs.writeFileSync('all_nepali_strings.json', JSON.stringify(uniqueTexts, null, 2), 'utf8');
