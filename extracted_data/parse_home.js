const fs = require('fs');

const code = fs.readFileSync('home_extracted.js', 'utf8');

// Let's inspect where Home function starts and ends
console.log('File length:', code.length);

// Look for package definitions, services, FAQs, etc.
const packagesMatch = code.match(/packages\s*=\s*\[.*?\]/s) || code.match(/\[\{.*?price.*?\}\]/s);
if (packagesMatch) {
  console.log('Packages found:\n', packagesMatch[0].slice(0, 500));
}

// Look for Nepali calendar or date converter
const bsConverter = code.includes('bikram') || code.includes('Bikram') || code.includes('nepali-date') || code.includes('bs');
console.log('Mentions BS/Nepali date:', bsConverter);

// Look for OCR or image processing
const ocr = code.includes('tesseract') || code.includes('ocr') || code.includes('canvas') || code.includes('FileReader');
console.log('Mentions OCR/FileReader:', ocr);

// Find all functions declared in home_extracted
const funcRegex = /function\s+([a-zA-Z0-9_$]+)\s*\(/g;
const funcs = [];
let f;
while ((f = funcRegex.exec(code)) !== null) {
  funcs.push(f[1]);
}
console.log('Functions found:', funcs.slice(0, 30));

// Find components and export default
const exportDefault = code.match(/export\s*\{\s*([a-zA-Z0-9_$]+)\s+as\s+default\s*\}/);
console.log('Default export:', exportDefault ? exportDefault[1] : 'none');
