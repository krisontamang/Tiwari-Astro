const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const DATA_FILE = path.join(__dirname, 'data', 'submissions.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure directories exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

const ADMIN_EMAIL = 'bensartiwari@gmail.com';
const ADMIN_PASSWORD = 'Astro@369';
const ADMIN_TOKEN = 'astro-tiwari-secure-token-369-bensar';

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

function readSubmissions() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    console.error('Error reading submissions:', e);
    return [];
  }
}

function writeSubmissions(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error writing submissions:', e);
    return false;
  }
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

function parseJSONBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Protect against gigantic payloads > 25MB
      if (body.length > 25 * 1024 * 1024) {
        req.destroy();
        resolve(null);
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve(null);
      }
    });
  });
}

function checkAdminAuth(req) {
  const auth = req.headers['authorization'] || '';
  if (auth === `Bearer ${ADMIN_TOKEN}` || auth === ADMIN_TOKEN) {
    return true;
  }
  // Check cookie
  const cookie = req.headers['cookie'] || '';
  if (cookie.includes(`admin_token=${ADMIN_TOKEN}`)) {
    return true;
  }
  return false;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  // --- API: Admin Login ---
  if (pathname === '/api/admin/login' && req.method === 'POST') {
    const body = await parseJSONBody(req);
    if (!body) {
      return sendJSON(res, 400, { success: false, message: 'Invalid payload' });
    }

    const { email, password } = body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      res.setHeader('Set-Cookie', `admin_token=${ADMIN_TOKEN}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
      return sendJSON(res, 200, {
        success: true,
        token: ADMIN_TOKEN,
        user: {
          email: ADMIN_EMAIL,
          name: 'Bensar Tiwari',
          role: 'admin'
        }
      });
    } else {
      return sendJSON(res, 401, {
        success: false,
        message: 'इमेल वा पासवर्ड मिलेन। कृपया जाँच गरेर फेरि प्रयास गर्नुहोस्।'
      });
    }
  }

  // --- API: Admin Check Auth ---
  if (pathname === '/api/admin/check-auth' && req.method === 'GET') {
    if (checkAdminAuth(req)) {
      return sendJSON(res, 200, {
        authenticated: true,
        user: { email: ADMIN_EMAIL, name: 'Bensar Tiwari', role: 'admin' }
      });
    }
    return sendJSON(res, 401, { authenticated: false });
  }

  // --- API: Admin Get Submissions ---
  if (pathname === '/api/admin/submissions' && req.method === 'GET') {
    if (!checkAdminAuth(req)) {
      return sendJSON(res, 401, { success: false, message: 'Unauthorized' });
    }
    const submissions = readSubmissions();
    submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sendJSON(res, 200, { success: true, submissions });
  }

  // --- API: Admin Verify Payment ---
  if (pathname.match(/^\/api\/admin\/submissions\/([^\/]+)\/verify$/) && req.method === 'POST') {
    if (!checkAdminAuth(req)) {
      return sendJSON(res, 401, { success: false, message: 'Unauthorized' });
    }
    const id = pathname.split('/')[4];
    const body = await parseJSONBody(req) || {};
    const submissions = readSubmissions();
    const item = submissions.find(s => s.id === id);
    if (!item) {
      return sendJSON(res, 404, { success: false, message: 'Submission not found' });
    }

    item.status = 'verified';
    item.verifiedAt = new Date().toISOString();
    item.verifiedBy = ADMIN_EMAIL;
    if (body.adminNote) {
      item.adminNote = body.adminNote;
    }
    writeSubmissions(submissions);
    return sendJSON(res, 200, { success: true, submission: item });
  }

  // --- API: Admin Reject Payment ---
  if (pathname.match(/^\/api\/admin\/submissions\/([^\/]+)\/reject$/) && req.method === 'POST') {
    if (!checkAdminAuth(req)) {
      return sendJSON(res, 401, { success: false, message: 'Unauthorized' });
    }
    const id = pathname.split('/')[4];
    const body = await parseJSONBody(req) || {};
    const submissions = readSubmissions();
    const item = submissions.find(s => s.id === id);
    if (!item) {
      return sendJSON(res, 404, { success: false, message: 'Submission not found' });
    }

    item.status = 'rejected';
    item.verifiedAt = new Date().toISOString();
    item.verifiedBy = ADMIN_EMAIL;
    if (body.adminNote) {
      item.adminNote = body.adminNote;
    }
    writeSubmissions(submissions);
    return sendJSON(res, 200, { success: true, submission: item });
  }

  // --- API: Admin Update Note ---
  if (pathname.match(/^\/api\/admin\/submissions\/([^\/]+)\/note$/) && req.method === 'POST') {
    if (!checkAdminAuth(req)) {
      return sendJSON(res, 401, { success: false, message: 'Unauthorized' });
    }
    const id = pathname.split('/')[4];
    const body = await parseJSONBody(req) || {};
    const submissions = readSubmissions();
    const item = submissions.find(s => s.id === id);
    if (!item) {
      return sendJSON(res, 404, { success: false, message: 'Submission not found' });
    }

    item.adminNote = body.adminNote || '';
    writeSubmissions(submissions);
    return sendJSON(res, 200, { success: true, submission: item });
  }

  // --- API: Admin Delete Submission ---
  if (pathname.match(/^\/api\/admin\/submissions\/([^\/]+)\/delete$/) && req.method === 'POST') {
    if (!checkAdminAuth(req)) {
      return sendJSON(res, 401, { success: false, message: 'Unauthorized' });
    }
    const id = pathname.split('/')[4];
    let submissions = readSubmissions();
    submissions = submissions.filter(s => s.id !== id);
    writeSubmissions(submissions);
    return sendJSON(res, 200, { success: true });
  }

  // --- API: Public New Submission (Form submission from customers) ---
  if (pathname === '/api/submissions' && req.method === 'POST') {
    const body = await parseJSONBody(req);
    if (!body) {
      return sendJSON(res, 400, { success: false, message: 'Invalid payload' });
    }

    const id = 'SUB-' + Date.now();
    let paymentScreenshotUrl = '';
    let kundaliPhotoUrl = '';

    // Save payment screenshot if provided (base64)
    if (body.paymentScreenshotBase64) {
      try {
        const matches = body.paymentScreenshotBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        const ext = matches ? (matches[1].split('/')[1] || 'jpg') : 'jpg';
        const rawData = matches ? matches[2] : body.paymentScreenshotBase64;
        const filename = `payment-${id}.${ext.replace('jpeg', 'jpg')}`;
        fs.writeFileSync(path.join(UPLOADS_DIR, filename), Buffer.from(rawData, 'base64'));
        paymentScreenshotUrl = `/uploads/${filename}`;
      } catch (e) {
        console.error('Error saving payment screenshot:', e);
      }
    }

    // Save kundali photo if provided (base64)
    if (body.kundaliPhotoBase64) {
      try {
        const matches = body.kundaliPhotoBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        const ext = matches ? (matches[1].split('/')[1] || 'jpg') : 'jpg';
        const rawData = matches ? matches[2] : body.kundaliPhotoBase64;
        const filename = `kundali-${id}.${ext.replace('jpeg', 'jpg')}`;
        fs.writeFileSync(path.join(UPLOADS_DIR, filename), Buffer.from(rawData, 'base64'));
        kundaliPhotoUrl = `/uploads/${filename}`;
      } catch (e) {
        console.error('Error saving kundali photo:', e);
      }
    }

    // Determine amount from package
    let amount = 499;
    const pkg = String(body.package || body.topic || '');
    if (pkg.includes('२९९') || pkg.includes('299') || pkg.toLowerCase().includes('basic')) {
      amount = 299;
    } else if (pkg.includes('१,०५५') || pkg.includes('1055') || pkg.toLowerCase().includes('vip')) {
      amount = 1055;
    }

    const newSubmission = {
      id: body.orderId || id,
      orderId: body.orderId || ('AT-' + Date.now().toString().slice(-6)),
      transactionId: body.transactionId || '',
      createdAt: new Date().toISOString(),
      name: body.name || 'Anonymous',
      phone: body.phone || '',
      email: body.email || '',
      gender: body.gender || '',
      dobBs: body.dobBs || body.dob_bs || '',
      dobAd: body.dobAd || body.dob_ad || '',
      birthTime: body.birthTime || (body.birth_hour ? `${body.birth_hour}:${body.birth_minute || '00'} ${body.birth_period || ''}`.trim() : ''),
      birthPeriod: body.birth_period || '',
      birthPlace: body.birthPlace || body.birth_place || '',
      package: pkg || 'Standard Package (रु. ४९९)',
      amount: Number(body.amount) || amount,
      message: body.message || '',
      rectification: body.rectification || '',
      paymentScreenshotUrl: paymentScreenshotUrl || body.paymentScreenshotUrl || '',
      kundaliPhotoUrl: kundaliPhotoUrl || body.kundaliPhotoUrl || '',
      status: 'pending',
      verifiedAt: null,
      verifiedBy: null,
      adminNote: ''
    };

    const submissions = readSubmissions();
    submissions.unshift(newSubmission);
    writeSubmissions(submissions);

    console.log(`[Submission] New customer submission: ${newSubmission.name} (${newSubmission.phone}), Package: ${newSubmission.package}, Trx: ${newSubmission.transactionId}`);
    return sendJSON(res, 200, { success: true, id, submission: newSubmission });
  }

  // --- Serve Uploaded Files ---
  if (pathname.startsWith('/uploads/')) {
    const filename = path.basename(pathname);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=86400' });
      fs.createReadStream(filePath).pipe(res);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
  }

  // --- Route /pay or /checkout to pay/index.html ---
  if (pathname === '/pay' || pathname === '/pay/' || pathname.startsWith('/pay/') || pathname === '/checkout' || pathname === '/checkout/') {
    const payPath = path.join(PUBLIC_DIR, 'pay', 'index.html');
    if (fs.existsSync(payPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      fs.createReadStream(payPath).pipe(res);
      return;
    }
  }

  // --- Route /admin to admin/index.html ---
  if (pathname === '/admin' || pathname === '/admin/' || pathname.startsWith('/admin/')) {
    const adminPath = path.join(PUBLIC_DIR, 'admin', 'index.html');
    if (fs.existsSync(adminPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      fs.createReadStream(adminPath).pipe(res);
      return;
    }
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

      if (pathname.includes('access.verifyBossCode')) {
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

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    if (path.extname(safePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

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
  console.log(`📡 Local Site:  http://localhost:${PORT}`);
  console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin`);
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
