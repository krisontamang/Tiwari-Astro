const fs = require('fs');

const code = fs.readFileSync('home_extracted.js', 'utf8');

// Basic formatter to break statements and JSX elements into readable lines
let formatted = code
  .replace(/;/g, ';\n')
  .replace(/\{/g, '{\n')
  .replace(/\}/g, '\n}\n')
  .replace(/h\.jsx\(/g, '\nh.jsx(')
  .replace(/h\.jsxs\(/g, '\nh.jsxs(');

fs.writeFileSync('home_readable.js', formatted, 'utf8');
console.log('home_readable.js written, lines:', formatted.split('\n').length);
