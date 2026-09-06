const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  // Handle tRPC mock API
  if (pathname.startsWith('/api/trpc')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let parsedBody = null;
      try {
        parsedBody = body ? JSON.parse(body) : null;
      } catch (e) {}

      console.log(`[tRPC] ${req.method} ${pathname}`, parsedBody ? JSON.stringify(parsedBody).slice(0, 100) : '');

      if (pathname.includes('access.verifyBossCode')) {
        // Unlocks boss mode for any code or *3*6*9
        let code = '';
        if (parsedBody && parsedBody[0] && parsedBody[0].json && parsedBody[0].json.code) {
          code = String(parsedBody[0].json.code).trim();
        } else if (parsedBody && parsedBody.code) {
          code = String(parsedBody.code).trim();
        }
        const success = !code || code.includes('369') || code.includes('boss') || code === '*3*6*9' || code.length >= 3;
        return sendJSON(res, 200, [
          {
            result: {
              data: {
                json: {
                  success: success,
                  message: success ? "Boss mode unlocked" : "Invalid code"
                }
              }
            }
          }
        ]);
      }

      if (pathname.includes('kundali.extract')) {
        return sendJSON(res, 200, [
          {
            result: {
              data: {
                json: {
                  name: "अनिल शर्मा",
                  gender: "पुरुष",
                  dobBs: "2054-08-22",
                  dobAd: "1997-12-07",
                  birthPlace: "काठमाडौं",
                  birthTime: "06:30 AM"
                }
              }
            }
          }
        ]);
      }

      if (pathname.includes('auth.me')) {
        return sendJSON(res, 200, [
          {
            result: {
              data: {
                json: null
              }
            }
          }
        ]);
      }

      // Default tRPC response
      return sendJSON(res, 200, [
        {
          result: {
            data: {
              json: null
            }
          }
        }
      ]);
    });
    return;
  }

  // Resolve static file path
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(PUBLIC_DIR, safePath);

  // If request is root or directory, point to index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    // If asking for a file with an extension that does not exist, return 404
    if (path.extname(safePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    // Otherwise SPA client-side routing: serve index.html
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  // Read and serve file
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });
    res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🌟 Astro Tiwari is running locally!`);
  console.log(`📡 Local URL: http://localhost:${PORT}`);
  console.log(`📱 Network URL: http://127.0.0.1:${PORT}`);
  console.log(`======================================================\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = Number(PORT) + 1;
    console.log(`Port ${PORT} in use, trying ${nextPort}...`);
    server.listen(nextPort, '0.0.0.0');
  } else {
    console.error('Server error:', err);
  }
});
