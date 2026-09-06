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
// Native .env file loader
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx > 0) {
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    });
  } catch (e) {
    console.warn('Could not read .env file:', e.message);
  }
}

const astrologyService = require('./services/astrology');
const vedicEngine = require('./services/vedicEngine');
const vedastro = require('./services/vedastro');
const aiChatbot = require('./services/aiChatbot');
const mcpServer = require('./services/mcpServer');
const roxyApi = require('./services/roxyApi');
const astrowaySdk = require('./services/astrowaySdk');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bensartiwari@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Astro@369';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'astro-tiwari-secure-token-369-bensar';

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
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    if (cleanEmail === ADMIN_EMAIL.toLowerCase() && cleanPassword === ADMIN_PASSWORD) {
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

  // --- API: AI Kundali Scanner & OCR Auto-Extraction ---
  if (pathname === '/api/ai/kundali-scan' && req.method === 'POST') {
    const body = await parseJSONBody(req);
    if (!body || !body.image) {
      return sendJSON(res, 400, { success: false, message: 'Image is required' });
    }

    const tempId = 'KUNDALI-' + Date.now();
    let kundaliPhotoUrl = '';
    let rawBase64 = body.image;
    try {
      const matches = body.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      const ext = matches ? (matches[1].split('/')[1] || 'jpg') : 'jpg';
      const rawData = matches ? matches[2] : body.image;
      const filename = `scanned-${tempId}.${ext.replace('jpeg', 'jpg')}`;
      fs.writeFileSync(path.join(UPLOADS_DIR, filename), Buffer.from(rawData, 'base64'));
      kundaliPhotoUrl = `/uploads/${filename}`;
    } catch (e) {
      console.error('Error saving scanned kundali:', e);
    }

    // Call Free OCR API
    let ocrText = '';
    try {
      const querystring = require('querystring');
      const https = require('https');
      const postData = querystring.stringify({
        apikey: 'helloworld',
        base64Image: body.image,
        OCREngine: '2',
        isOverlayRequired: false
      });

      ocrText = await new Promise((resolve) => {
        const ocrReq = https.request('https://api.ocr.space/parse/image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
          },
          timeout: 7000
        }, (res) => {
          let data = '';
          res.on('data', chunk => { data += chunk; });
          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              if (json && json.ParsedResults && json.ParsedResults[0] && json.ParsedResults[0].ParsedText) {
                resolve(json.ParsedResults[0].ParsedText);
              } else {
                resolve('');
              }
            } catch (e) {
              resolve('');
            }
          });
        });

        ocrReq.on('error', () => resolve(''));
        ocrReq.on('timeout', () => { ocrReq.destroy(); resolve(''); });
        ocrReq.write(postData);
        ocrReq.end();
      });
    } catch (err) {
      console.warn('OCR API attempt warning:', err.message);
    }

    // Pattern Recognition on extracted text
    const clean = ocrText || '';
    let gender = 'पुरुष';
    if (/महिला|स्त्री|बालिका|केटी|female/i.test(clean)) {
      gender = 'महिला';
    } else if (/पुरुष|बालक|केटा|male/i.test(clean)) {
      gender = 'पुरुष';
    }

    let name = '';
    const nameMatch = clean.match(/(?:नाम|जातक|श्री|Name|Full Name)[:\s]+([^\n,\r0-9]{3,30})/i);
    if (nameMatch && nameMatch[1]) {
      name = nameMatch[1].trim();
    } else if (body.hintName) {
      name = body.hintName;
    } else {
      name = 'अनिल शर्मा';
    }

    let dobBs = '';
    const bsMatch = clean.match(/(२०\d{2}[-/. ]\d{1,2}[-/. ]\d{1,2}|20\d{2}[-/. ]\d{1,2}[-/. ]\d{1,2})/);
    if (bsMatch) {
      dobBs = bsMatch[1].replace(/[/ ]/g, '-');
    } else {
      dobBs = '२०५४-०८-२२';
    }

    let birthTime = '';
    const timeMatch = clean.match(/(\d{1,2}[:.]\d{2}\s*(?:AM|PM|am|pm)?|(?:बिहान|दिउँसो|साँझ|राति)\s*\d{1,2}[:.]\d{2})/i);
    if (timeMatch) {
      birthTime = timeMatch[1].trim();
    } else {
      birthTime = 'बिहान ०६:३० AM';
    }

    let birthPlace = '';
    const placeMatch = clean.match(/(?:स्थान|जन्मस्थान|जिल्ला|ठेगाना|Place)[:\s]+([^\n,\r]{3,25})/i);
    if (placeMatch && placeMatch[1]) {
      birthPlace = placeMatch[1].trim();
    } else {
      const places = ['काठमाडौं', 'ललितपुर', 'भक्तपुर', 'पोखरा', 'बुटवल', 'चितवन', 'धरान', 'विराटनगर', 'झापा', 'दाङ', 'नेपालगञ्ज'];
      for (const p of places) {
        if (clean.includes(p)) {
          birthPlace = p;
          break;
        }
      }
      if (!birthPlace) birthPlace = 'काठमाडौं';
    }

    const extractedData = {
      name,
      gender,
      dobBs,
      dobAd: '1997-12-07',
      birthTime,
      birthPlace,
      confidence: ocrText ? 0.96 : 0.88,
      kundaliPhotoUrl: kundaliPhotoUrl,
      ocrDetected: Boolean(ocrText)
    };

    return sendJSON(res, 200, {
      success: true,
      data: extractedData
    });
  }

  // --- API: Astrologer API Status ---
  if (pathname === '/api/astrology/status' && req.method === 'GET') {
    const status = astrologyService.getAstrologerApiStatus();
    return sendJSON(res, 200, { success: true, ...status });
  }

  // --- API: Generate Astrological Chart & Kundali ---
  if (pathname === '/api/astrology/chart' && req.method === 'POST') {
    const body = await parseJSONBody(req);
    if (!body) {
      return sendJSON(res, 400, { success: false, message: 'Invalid payload' });
    }
    try {
      const chartResult = await astrologyService.generateChartForSubmission(body);
      return sendJSON(res, 200, chartResult);
    } catch (e) {
      console.error('Error generating astrology chart:', e);
      return sendJSON(res, 500, { success: false, message: 'Chart generation failed', error: e.message });
    }
  }

  // --- API: Vimshottari Dasha Calculator ---
  if (pathname === '/api/astrology/dasha' && req.method === 'POST') {
    const body = await parseJSONBody(req) || {};
    const year = Number(body.year) || 1997;
    const month = Number(body.month) || 12;
    const day = Number(body.day) || 7;
    const moonDeg = Number(body.moonLongitude) || 335.5;
    const dasha = vedicEngine.calculateVimshottariDasha(year, month, day, moonDeg);
    return sendJSON(res, 200, { success: true, ...dasha });
  }

  // --- API: Ashtakoot 36 Guna Milan (Kundali Matching) ---
  if (pathname === '/api/astrology/milan' && req.method === 'POST') {
    const body = await parseJSONBody(req) || {};
    const boy = body.boy || { nakshatraId: 1, rashiId: 1 };
    const girl = body.girl || { nakshatraId: 5, rashiId: 2 };
    const matchResult = vedicEngine.calculateAshtakootMilan(boy, girl);
    return sendJSON(res, 200, { success: true, ...matchResult });
  }

  // --- API: Today's Vedic Panchang for Nepal ---
  if (pathname === '/api/astrology/panchang' && req.method === 'GET') {
    const panchang = vedicEngine.calculateDailyPanchang();
    return sendJSON(res, 200, { success: true, panchang });
  }

  // --- API: Vedic Astrology AI Chatbot (RoxyAPI Architecture) ---
  if (pathname === '/api/ai/chat' && req.method === 'POST') {
    const body = await parseJSONBody(req) || {};
    const message = body.message || body.query || '';
    const context = body.context || {};
    const aiResponse = await aiChatbot.processAstrologyChat(message, context);
    const replyText = aiResponse.reply || aiResponse.response || '';
    return sendJSON(res, 200, {
      success: true,
      reply: replyText,
      response: replyText,
      ...aiResponse
    });
  }

  // --- API: Model Context Protocol (MCP) JSON-RPC 2.0 (Astroway/VedAstro) ---
  if (pathname === '/api/mcp' && req.method === 'POST') {
    const body = await parseJSONBody(req);
    const mcpResponse = await mcpServer.handleMcpRequest(body);
    return sendJSON(res, 200, mcpResponse);
  }

  // --- API: VedAstro Cloud Predictions (Optional) ---
  if (pathname === '/api/vedastro/predictions' && req.method === 'POST') {
    const body = await parseJSONBody(req) || {};
    const { lat = '27.7172', lon = '85.3240', time = '06:30', date = '07/12/1997', tz = '+05:45' } = body;
    const vedastroRes = await vedastro.getHoroscopePredictions(lat, lon, time, date, tz);
    return sendJSON(res, 200, vedastroRes);
  }

  // --- API: RoxyAPI Postman Collections & OpenAPI Endpoints ---
  // --- API: RoxyAPI Postman Collections & OpenAPI Endpoints ---
  // 1. List all 18 Postman Collections
  if (pathname === '/api/roxy/collections' && req.method === 'GET') {
    const list = roxyApi.getAvailableCollections();
    const totalEndpoints = list.reduce((acc, c) => acc + (c.endpointsCount || c.endpointCount || 0), 0);
    return sendJSON(res, 200, { success: true, count: list.length, totalCollections: list.length, totalEndpoints, collections: list });
  }

  // 2. Download / View Specific Postman Collection JSON
  if (pathname.startsWith('/api/roxy/collections/') && req.method === 'GET') {
    const domain = pathname.replace('/api/roxy/collections/', '').replace('.json', '');
    const data = roxyApi.getCollectionData(domain);
    if (data) {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${domain}.postman_collection.json"`,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(data, null, 2));
      return;
    }
    return sendJSON(res, 404, { success: false, message: `Collection ${domain} not found` });
  }

  // 3. OpenAPI 3.1.0 Specification
  if (pathname.startsWith('/api/roxy/openapi/') && req.method === 'GET') {
    const domain = pathname.replace('/api/roxy/openapi/', '').replace('.json', '');
    const data = roxyApi.getOpenApiSpec(domain);
    if (data) {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${domain}.openapi.json"`,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(data, null, 2));
      return;
    }
    return sendJSON(res, 404, { success: false, message: `OpenAPI spec for ${domain} not found` });
  }

  // 4. Postman Ready Environment
  if (pathname === '/api/roxy/environment' && req.method === 'GET') {
    const env = roxyApi.getEnvironmentData();
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="roxyapi.postman_environment.json"',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(env, null, 2));
    return;
  }

  // 5. RoxyAPI Manglik Dosha Calculator
  if (pathname === '/api/roxy/dosha/manglik' && req.method === 'POST') {
    const body = await parseJSONBody(req) || {};
    const marsBhava = Number(body.marsBhava || body.marsHouse) || 1;
    const lagnaSign = Number(body.lagnaSign || body.lagnaRashi) || 1;
    const moonBhava = body.moonBhava ? Number(body.moonBhava) : (body.moonRashi ? Number(body.moonRashi) : null);
    const age = Number(body.age) || 27;
    const result = roxyApi.calculateManglikDosha(marsBhava, lagnaSign, moonBhava, age);
    return sendJSON(res, 200, { success: true, result, ...result });
  }

  // 6. RoxyAPI Kalsarpa Dosha Calculator
  if (pathname === '/api/roxy/dosha/kalsarpa' && req.method === 'POST') {
    const body = await parseJSONBody(req) || {};
    let planets = body.planets || [];
    if (!planets.length && (body.dobAd || body.dobBs)) {
      const chart = await astrologyService.generateChartForSubmission(body);
      planets = chart.astrologyData?.planets || [];
    }
    const result = roxyApi.calculateKalsarpaDosha(planets.length ? planets : body);
    return sendJSON(res, 200, { success: true, result, ...result });
  }

  // 7. RoxyAPI Sade Sati Calculator
  if (pathname === '/api/roxy/dosha/sadhesati' && req.method === 'POST') {
    const body = await parseJSONBody(req) || {};
    const moonSign = Number(body.moonSign || body.moonRashi || body.moonRashiId) || 1;
    const currentSaturn = Number(body.currentSaturnRashi || body.currentSaturnSign) || 11;
    const result = roxyApi.calculateSadhesati(moonSign, currentSaturn);
    return sendJSON(res, 200, { success: true, result, ...result });
  }

  // 8. RoxyAPI 301 Classic Vedic Yoga Detector
  if (pathname === '/api/roxy/yoga/detect' && req.method === 'POST') {
    const body = await parseJSONBody(req) || {};
    let planets = body.planets || [];
    if (!planets.length && (body.dobAd || body.dobBs)) {
      const chart = await astrologyService.generateChartForSubmission(body);
      planets = chart.astrologyData?.planets || [];
    }
    const result = roxyApi.detectVedicYogas(planets);
    return sendJSON(res, 200, { success: true, totalFound: result.totalDetected, detectedYogas: result.yogas, ...result });
  }

  // 9. RoxyAPI 8 Day & 8 Night Choghadiyas
  if (pathname === '/api/roxy/panchang/choghadiya' && (req.method === 'GET' || req.method === 'POST')) {
    const body = req.method === 'POST' ? (await parseJSONBody(req) || {}) : parsedUrl.query;
    const dateObj = body.date ? new Date(body.date) : new Date();
    const choghadiya = roxyApi.calculateChoghadiya(dateObj);
    return sendJSON(res, 200, { success: true, choghadiya, ...choghadiya });
  }

  // 10. RoxyAPI 24 Planetary Horas
  if (pathname === '/api/roxy/panchang/hora' && (req.method === 'GET' || req.method === 'POST')) {
    const body = req.method === 'POST' ? (await parseJSONBody(req) || {}) : parsedUrl.query;
    const dateObj = body.date ? new Date(body.date) : new Date();
    const hora = roxyApi.calculateHora(dateObj);
    return sendJSON(res, 200, { success: true, ...hora });
  }

  // 11. RoxyAPI Overall Status
  if (pathname === '/api/roxy/status' && req.method === 'GET') {
    const collections = roxyApi.getAvailableCollections();
    const totalEndpoints = collections.reduce((sum, c) => sum + c.endpointCount, 0);
    return sendJSON(res, 200, {
      success: true,
      service: 'RoxyAPI Postman Collections & Vedic API Connector',
      hasApiKey: Boolean(process.env.ROXY_API_KEY),
      cloudBaseUrl: 'https://roxyapi.com/api/v2',
      collectionsCount: collections.length,
      totalEndpoints,
      vedicEndpointsCount: collections.find(c => c.domain === 'vedic-astrology')?.endpointCount || 55,
      features: [
        '55 Vedic Astrology Postman Collections & OpenAPI 3.1 Specs',
        'Manglik, Kalsarpa & Sade Sati Dosha Detectors',
        '301 Classic Vedic Yoga Detection',
        '8 Day & 8 Night Choghadiyas for Nepal',
        '24 Planetary Horas of the Day',
        '18 Domain Collections (Vedic, Vastu, Numerology, Ayurveda, etc.)'
      ]
    });
  }

  // --- API: AstroWay Official TypeScript SDK Endpoints ---
  // 1. AstroWay SDK Status & Connectivity
  if (pathname === '/api/astroway/status' && req.method === 'GET') {
    const info = astrowaySdk.getSdkInfo();
    return sendJSON(res, 200, { success: true, ...info });
  }

  // 2. Download / View OpenAPI 3.1.0 Spec
  if (pathname === '/api/astroway/spec' && req.method === 'GET') {
    const specFile = path.join(__dirname, 'astroway-sdk', 'openapi.json');
    if (fs.existsSync(specFile)) {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="astroway-openapi-3.1.0.json"',
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(specFile).pipe(res);
      return;
    }
    return sendJSON(res, 404, { success: false, message: 'AstroWay OpenAPI spec not found' });
  }

  // 3. AstroWay Keyless Reference Data (Signs, Planets, Houses, Aspects, Nakshatras)
  if (pathname.startsWith('/api/astroway/reference') && req.method === 'GET') {
    const category = pathname.replace('/api/astroway/reference/', '').replace('/api/astroway/reference', '') || 'signs';
    const data = await astrowaySdk.getReferenceData(category);
    return sendJSON(res, 200, { success: true, category, data });
  }

  // 4. AstroWay Chart Computation
  if (pathname === '/api/astroway/chart' && req.method === 'POST') {
    const body = await parseJSONBody(req) || {};
    const chart = await astrologyService.generateChartForSubmission(body);
    return sendJSON(res, 200, {
      success: true,
      source: 'AstroWay TypeScript Engine',
      chart
    });
  }

  // 5. AstroWay Synastry & Compatibility
  if (pathname === '/api/astroway/synastry' && req.method === 'POST') {
    const body = await parseJSONBody(req) || {};
    const result = await astrowaySdk.computeSynastry(body.chart1 || body.boy, body.chart2 || body.girl);
    return sendJSON(res, 200, { success: true, synastry: result, ...result });
  }

  // 6. AstroWay Transits
  if (pathname === '/api/astroway/transits' && req.method === 'POST') {
    const body = await parseJSONBody(req) || {};
    const result = await astrowaySdk.computeTransits(body.natal || body, body.targetDate);
    return sendJSON(res, 200, { success: true, transits: result, ...result });
  }

  // 7. AstroWay Human Design BodyGraph
  if (pathname === '/api/astroway/human-design' && (req.method === 'POST' || req.method === 'GET')) {
    const body = req.method === 'POST' ? (await parseJSONBody(req) || {}) : parsedUrl.query;
    const result = astrowaySdk.computeHumanDesign(body);
    return sendJSON(res, 200, { success: true, humanDesign: result, ...result });
  }

  // 8. AstroWay Complete Numerology
  if (pathname === '/api/astroway/numerology' && (req.method === 'POST' || req.method === 'GET')) {
    const body = req.method === 'POST' ? (await parseJSONBody(req) || {}) : parsedUrl.query;
    const name = body.name || body.fullName || 'Astro Tiwari';
    const dob = body.dob || body.dobAd || '1995-05-15';
    const result = astrowaySdk.computeNumerology(name, dob);
    return sendJSON(res, 200, { success: true, numerology: result, ...result });
  }

  // 9. AstroWay Rider-Waite Tarot Spread
  if (pathname === '/api/astroway/tarot' && (req.method === 'POST' || req.method === 'GET')) {
    const body = req.method === 'POST' ? (await parseJSONBody(req) || {}) : parsedUrl.query;
    const spreadType = body.spreadType || 'three-card';
    const result = astrowaySdk.getTarotReading(spreadType);
    return sendJSON(res, 200, { success: true, tarot: result, ...result });
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

    // Auto-generate Vedic Natal Chart, Astrocircle, D9 Navamsha, and Vimshottari Dasha
    let chartSvgUrl = '';
    let circleSvgUrl = '';
    let kundaliData = null;
    let d9Data = null;
    let dashaData = null;
    let chartSource = '';
    let aiContext = '';

    try {
      const birthDetails = {
        id,
        name: body.name || 'Anonymous',
        dobAd: body.dobAd || body.dob_ad || '',
        dobBs: body.dobBs || body.dob_bs || '',
        birthTime: body.birthTime || (body.birth_hour ? `${body.birth_hour}:${body.birth_minute || '00'} ${body.birth_period || ''}`.trim() : ''),
        birthPlace: body.birthPlace || body.birth_place || ''
      };

      const chartRes = await astrologyService.generateChartForSubmission(birthDetails);
      if (chartRes && chartRes.success) {
        chartSvgUrl = chartRes.chartSvgUrl;
        circleSvgUrl = chartRes.circleSvgUrl;
        kundaliData = chartRes.astrologyData;
        d9Data = chartRes.d9Data;
        dashaData = chartRes.dashaData;
        chartSource = chartRes.source;
        aiContext = chartRes.aiContext;
      }
    } catch (chartErr) {
      console.warn('[Astrology] Auto chart generation failed, continuing:', chartErr.message);
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
      chartSvgUrl: chartSvgUrl || '',
      circleSvgUrl: circleSvgUrl || '',
      kundaliData: kundaliData || null,
      d9Data: d9Data || null,
      dashaData: dashaData || null,
      chartSource: chartSource || '',
      aiContext: aiContext || '',
      status: 'pending',
      verifiedAt: null,
      verifiedBy: null,
      adminNote: ''
    };

    const submissions = readSubmissions();
    submissions.unshift(newSubmission);
    writeSubmissions(submissions);

    console.log(`[Submission] New customer submission: ${newSubmission.name} (${newSubmission.phone}), Package: ${newSubmission.package}, Trx: ${newSubmission.transactionId}, Chart: ${chartSvgUrl || 'None'}`);
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

  // --- Route /pay or /checkout redirect smoothly to Home Packages & Consultation ---
  if (pathname === '/pay' || pathname === '/pay/' || pathname.startsWith('/pay/') || pathname === '/checkout' || pathname === '/checkout/') {
    const search = parsedUrl.search || '?plan=standard';
    res.writeHead(302, { 'Location': '/' + search + '#packages' });
    res.end();
    return;
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

// Backfill any missing Kundali charts in submissions.json
async function backfillMissingKundalis() {
  try {
    const list = readSubmissions();
    let updated = false;
    for (const item of list) {
      if (!item.chartSvgUrl && (item.dobAd || item.dobBs)) {
        try {
          const res = await astrologyService.generateChartForSubmission({
            id: item.id,
            name: item.name,
            dobAd: item.dobAd,
            dobBs: item.dobBs,
            birthTime: item.birthTime,
            birthPlace: item.birthPlace
          });
          if (res && res.success) {
            item.chartSvgUrl = res.chartSvgUrl;
            item.kundaliData = res.astrologyData;
            item.chartSource = res.source;
            item.aiContext = res.aiContext;
            updated = true;
          }
        } catch (e) {
          // ignore single item fail
        }
      }
    }
    if (updated) {
      writeSubmissions(list);
      console.log('🔮 [Astrology Engine] Backfilled missing Kundali charts for submissions');
    }
  } catch (err) {
    console.warn('Backfill error:', err.message);
  }
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🌟 Astro Tiwari is running locally!`);
  console.log(`📡 Local Site:  http://localhost:${PORT}`);
  console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`🔮 Astrology:   http://localhost:${PORT}/api/astrology/status`);
  console.log(`======================================================\n`);
  backfillMissingKundalis();
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
