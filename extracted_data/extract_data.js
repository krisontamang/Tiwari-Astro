const fs = require('fs');

const js = fs.readFileSync('assets/index-ChgpL9kq.js', 'utf8');

// 1. Services
const servicesMatch = js.match(/\[\{icon:[^\]]+eyebrow:[^\]]+\}\]/);
if (servicesMatch) console.log('Services:', servicesMatch[0]);

// 2. FAQs
const faqMatches = [];
let fIdx = 0;
while ((fIdx = js.indexOf('question:', fIdx)) !== -1) {
  faqMatches.push(js.substring(fIdx - 10, fIdx + 300));
  fIdx += 20;
}
console.log('FAQ matches:', faqMatches.length);
if (faqMatches.length > 0) {
  console.log('FAQ Sample:', faqMatches.slice(0, 3));
}

// 3. Testimonials
const testMatches = [];
let tIdx = 0;
while ((tIdx = js.indexOf('quote:', tIdx)) !== -1) {
  testMatches.push(js.substring(tIdx - 10, tIdx + 200));
  tIdx += 20;
}
console.log('Testimonials count:', testMatches.length);

// 4. Boss code
const bossMatch = js.match(/(?:boss|code)[^;]{0,50}===[^;]{0,50}/gi);
console.log('Boss code logic:', bossMatch);

// 5. Look for payment details (eSewa ID, Bank, Name, QR, etc.)
const esewaMatches = js.match(/[^;\"']*(?:9809192604|eSewa|Khalti|QR)[^;\"']*/gi) || [];
console.log('Payment & eSewa details:', Array.from(new Set(esewaMatches)).slice(0, 15));
