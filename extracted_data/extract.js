const fs = require('fs');

const code = fs.readFileSync('assets/index-ChgpL9kq.js', 'utf8');

// 1. Check for email, phone, links
const emails = code.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
const phones = code.match(/(?:\+?977[- ]?)?[98][0-9]{8,9}/g) || [];
const links = code.match(/https?:\/\/[^\s"'`<>]+/g) || [];

console.log('--- CONTACT & LINKS ---');
console.log('Emails:', Array.from(new Set(emails)));
console.log('Phones:', Array.from(new Set(phones)));
console.log('Links:', Array.from(new Set(links)));

// 2. Extract texts around specific sections
const findContext = (needle, radius = 200) => {
  let idx = 0;
  const results = [];
  while ((idx = code.indexOf(needle, idx)) !== -1 && results.length < 5) {
    results.push(code.substring(Math.max(0, idx - radius), Math.min(code.length, idx + needle.length + radius)));
    idx += needle.length;
  }
  return results;
};

console.log('--- HERO SECTION ---');
console.log(findContext('Astro Tiwari', 150)[0]);

console.log('--- SERVICES ---');
console.log(findContext('जन्मकुण्डली', 250)[0]);

console.log('--- PRICING / PACKAGES ---');
console.log(findContext('रु.', 150));
console.log(findContext('Rs', 150));
console.log(findContext('NPR', 150));

console.log('--- FAQ / ACCORDION ---');
console.log(findContext('FAQ', 100));

// Let's dump all strings of length > 20
const stringMatches = code.match(/"([^"\\]|\\.)*"/g) || [];
const interestingStrings = stringMatches
  .map(s => {
    try { return JSON.parse(s); } catch(e) { return s; }
  })
  .filter(s => typeof s === 'string' && s.length > 25 && /[\u0900-\u097F]/.test(s));

fs.writeFileSync('extracted_nepali_strings.json', JSON.stringify(Array.from(new Set(interestingStrings)), null, 2), 'utf8');
console.log('Extracted Nepali strings count:', interestingStrings.length);
