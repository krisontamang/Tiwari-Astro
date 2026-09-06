const fs = require('fs');

const css = fs.readFileSync('assets/index-DpdlmGVI.css', 'utf8');
const js = fs.readFileSync('assets/index-ChgpL9kq.js', 'utf8');

// Check images referenced in css or js
const imgRegex = /([a-zA-Z0-9_\-\.\/]+\.(?:png|jpg|jpeg|webp|svg|gif))/gi;
const cssImgs = css.match(imgRegex) || [];
const jsImgs = js.match(imgRegex) || [];

console.log('CSS Images:', Array.from(new Set(cssImgs)));
console.log('JS Images:', Array.from(new Set(jsImgs)).filter(x => !x.includes('node_modules')));

// QR code or payment images?
const qrMatches = js.match(/[a-zA-Z0-9_\-\.\/]+(?:qr|esewa|khalti|fonepay|payment)[a-zA-Z0-9_\-\.\/]*/gi) || [];
console.log('Payment / QR references:', Array.from(new Set(qrMatches)));

// Fonts and styles
const fonts = css.match(/@font-face[^{]*\{[^}]*\}/g) || [];
console.log('Font faces:', fonts.length);

const rootVars = css.match(/:root[^{]*\{([^}]*)\}/);
if (rootVars) {
  console.log('Root CSS Variables:\n', rootVars[1].split(';').slice(0, 30).join(';\n'));
}
