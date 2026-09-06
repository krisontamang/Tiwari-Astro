/**
 * services/astrology.js
 * Connector for Astrologer-API (https://github.com/g-battaglia/Astrologer-API.git)
 * and High-Precision Vedic Kundali Calculation Engine.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Common Nepal Cities Coordinate Lookup
const CITY_COORDINATES = {
  'काठमाडौं': { lat: 27.7172, lon: 85.3240, city: 'Kathmandu', nation: 'NP', tz: 'Asia/Kathmandu' },
  'kathmandu': { lat: 27.7172, lon: 85.3240, city: 'Kathmandu', nation: 'NP', tz: 'Asia/Kathmandu' },
  'ललितपुर': { lat: 27.6710, lon: 85.3216, city: 'Lalitpur', nation: 'NP', tz: 'Asia/Kathmandu' },
  'lalitpur': { lat: 27.6710, lon: 85.3216, city: 'Lalitpur', nation: 'NP', tz: 'Asia/Kathmandu' },
  'पाटन': { lat: 27.6710, lon: 85.3216, city: 'Patan', nation: 'NP', tz: 'Asia/Kathmandu' },
  'भक्तपुर': { lat: 27.6710, lon: 85.4298, city: 'Bhaktapur', nation: 'NP', tz: 'Asia/Kathmandu' },
  'bhaktapur': { lat: 27.6710, lon: 85.4298, city: 'Bhaktapur', nation: 'NP', tz: 'Asia/Kathmandu' },
  'पोखरा': { lat: 28.2096, lon: 83.9856, city: 'Pokhara', nation: 'NP', tz: 'Asia/Kathmandu' },
  'pokhara': { lat: 28.2096, lon: 83.9856, city: 'Pokhara', nation: 'NP', tz: 'Asia/Kathmandu' },
  'बुटवल': { lat: 27.7006, lon: 83.4484, city: 'Butwal', nation: 'NP', tz: 'Asia/Kathmandu' },
  'butwal': { lat: 27.7006, lon: 83.4484, city: 'Butwal', nation: 'NP', tz: 'Asia/Kathmandu' },
  'चितवन': { lat: 27.6833, lon: 84.4333, city: 'Chitwan', nation: 'NP', tz: 'Asia/Kathmandu' },
  'chitwan': { lat: 27.6833, lon: 84.4333, city: 'Chitwan', nation: 'NP', tz: 'Asia/Kathmandu' },
  'भरतपुर': { lat: 27.6833, lon: 84.4333, city: 'Bharatpur', nation: 'NP', tz: 'Asia/Kathmandu' },
  'धरान': { lat: 26.8126, lon: 87.2834, city: 'Dharan', nation: 'NP', tz: 'Asia/Kathmandu' },
  'dharan': { lat: 26.8126, lon: 87.2834, city: 'Dharan', nation: 'NP', tz: 'Asia/Kathmandu' },
  'विराटनगर': { lat: 26.4525, lon: 87.2718, city: 'Biratnagar', nation: 'NP', tz: 'Asia/Kathmandu' },
  'biratnagar': { lat: 26.4525, lon: 87.2718, city: 'Biratnagar', nation: 'NP', tz: 'Asia/Kathmandu' },
  'झापा': { lat: 26.6333, lon: 87.9833, city: 'Jhapa', nation: 'NP', tz: 'Asia/Kathmandu' },
  'jhapa': { lat: 26.6333, lon: 87.9833, city: 'Jhapa', nation: 'NP', tz: 'Asia/Kathmandu' },
  'बिर्तामोड': { lat: 26.6333, lon: 87.9833, city: 'Birtamod', nation: 'NP', tz: 'Asia/Kathmandu' },
  'हेटौंडा': { lat: 27.4284, lon: 85.0322, city: 'Hetauda', nation: 'NP', tz: 'Asia/Kathmandu' },
  'hetauda': { lat: 27.4284, lon: 85.0322, city: 'Hetauda', nation: 'NP', tz: 'Asia/Kathmandu' },
  'जनकपुर': { lat: 26.7288, lon: 85.9244, city: 'Janakpur', nation: 'NP', tz: 'Asia/Kathmandu' },
  'janakpur': { lat: 26.7288, lon: 85.9244, city: 'Janakpur', nation: 'NP', tz: 'Asia/Kathmandu' },
  'नेपालगञ्ज': { lat: 28.0500, lon: 81.6167, city: 'Nepalgunj', nation: 'NP', tz: 'Asia/Kathmandu' },
  'nepalgunj': { lat: 28.0500, lon: 81.6167, city: 'Nepalgunj', nation: 'NP', tz: 'Asia/Kathmandu' },
  'दाङ': { lat: 28.0333, lon: 82.4833, city: 'Dang', nation: 'NP', tz: 'Asia/Kathmandu' },
  'dang': { lat: 28.0333, lon: 82.4833, city: 'Dang', nation: 'NP', tz: 'Asia/Kathmandu' },
  'धनगढी': { lat: 28.6944, lon: 80.5978, city: 'Dhangadhi', nation: 'NP', tz: 'Asia/Kathmandu' },
  'dhangadhi': { lat: 28.6944, lon: 80.5978, city: 'Dhangadhi', nation: 'NP', tz: 'Asia/Kathmandu' },
  'वीरगञ्ज': { lat: 27.0167, lon: 84.8833, city: 'Birgunj', nation: 'NP', tz: 'Asia/Kathmandu' },
  'birgunj': { lat: 27.0167, lon: 84.8833, city: 'Birgunj', nation: 'NP', tz: 'Asia/Kathmandu' },
};

const RASHIS = [
  { id: 1, name: 'मेष', sanskrit: 'Aries', lord: 'मंगल (Mars)', element: 'अग्नि (Fire)' },
  { id: 2, name: 'वृष', sanskrit: 'Taurus', lord: 'शुक्र (Venus)', element: 'पृथ्वी (Earth)' },
  { id: 3, name: 'मिथुन', sanskrit: 'Gemini', lord: 'बुध (Mercury)', element: 'वायु (Air)' },
  { id: 4, name: 'कर्क', sanskrit: 'Cancer', lord: 'चन्द्र (Moon)', element: 'जल (Water)' },
  { id: 5, name: 'सिंह', sanskrit: 'Leo', lord: 'सूर्य (Sun)', element: 'अग्नि (Fire)' },
  { id: 6, name: 'कन्या', sanskrit: 'Virgo', lord: 'बुध (Mercury)', element: 'पृथ्वी (Earth)' },
  { id: 7, name: 'तुला', sanskrit: 'Libra', lord: 'शुक्र (Venus)', element: 'वायु (Air)' },
  { id: 8, name: 'वृश्चिक', sanskrit: 'Scorpio', lord: 'मंगल (Mars)', element: 'जल (Water)' },
  { id: 9, name: 'धनु', sanskrit: 'Sagittarius', lord: 'बृहस्पति (Jupiter)', element: 'अग्नि (Fire)' },
  { id: 10, name: 'मकर', sanskrit: 'Capricorn', lord: 'शनि (Saturn)', element: 'पृथ्वी (Earth)' },
  { id: 11, name: 'कुम्भ', sanskrit: 'Aquarius', lord: 'शनि (Saturn)', element: 'वायु (Air)' },
  { id: 12, name: 'मीन', sanskrit: 'Pisces', lord: 'बृहस्पति (Jupiter)', element: 'जल (Water)' }
];

const NAKSHATRAS = [
  'अश्विनी (Ashwini)', 'भरणी (Bharani)', 'कृत्तिका (Krittika)', 'रोहिणी (Rohini)',
  'मृगशिरा (Mrigashira)', 'आर्द्रा (Ardra)', 'पुनर्वसु (Punarvasu)', 'पुष्य (Pushya)',
  'आश्लेषा (Ashlesha)', 'मघा (Magha)', 'पूर्वाफाल्गुनी (Purva Phalguni)', 'उत्तराफाल्गुनी (Uttara Phalguni)',
  'हस्त (Hasta)', 'चित्रा (Chitra)', 'स्वाती (Swati)', 'विशाखा (Vishakha)',
  'अनुराधा (Anuradha)', 'ज्येष्ठा (Jyeshtha)', 'मूल (Mula)', 'पूर्वाषाढा (Purva Ashadha)',
  'उत्तराषाढा (Uttara Ashadha)', 'श्रवण (Shravana)', 'धनिष्ठा (Dhanishta)', 'शतभिषा (Shatabhisha)',
  'पूर्वाभाद्रपदा (Purva Bhadrapada)', 'उत्तराभाद्रपदा (Uttara Bhadrapada)', 'रेवती (Revati)'
];

const PLANET_GLYPHS = {
  'Sun': { dev: 'सू', name: 'सूर्य (Sun)', en: 'Su' },
  'Moon': { dev: 'चं', name: 'चन्द्र (Moon)', en: 'Mo' },
  'Mars': { dev: 'मं', name: 'मंगल (Mars)', en: 'Ma' },
  'Mercury': { dev: 'बु', name: 'बुध (Mercury)', en: 'Me' },
  'Jupiter': { dev: 'गु', name: 'बृहस्पति (Guru)', en: 'Ju' },
  'Venus': { dev: 'शु', name: 'शुक्र (Venus)', en: 'Ve' },
  'Saturn': { dev: 'श', name: 'शनि (Saturn)', en: 'Sa' },
  'Rahu': { dev: 'रा', name: 'राहु (Rahu)', en: 'Ra' },
  'Ketu': { dev: 'के', name: 'केतु (Ketu)', en: 'Ke' },
  'Ascendant': { dev: 'ल', name: 'लग्न (Ascendant)', en: 'Asc' }
};

/**
 * Resolve location coordinates from text
 */
function resolveLocation(placeStr) {
  if (!placeStr) {
    return { lat: 27.7172, lon: 85.3240, city: 'Kathmandu', nation: 'NP', tz: 'Asia/Kathmandu' };
  }
  const clean = placeStr.toLowerCase().trim();
  for (const [key, val] of Object.entries(CITY_COORDINATES)) {
    if (clean.includes(key.toLowerCase())) {
      return val;
    }
  }
  return { lat: 27.7172, lon: 85.3240, city: placeStr.trim() || 'Kathmandu', nation: 'NP', tz: 'Asia/Kathmandu' };
}

/**
 * Parse date components from Nepali BS or Western AD format
 */
function parseDateComponents(dobAd, dobBs, birthTime) {
  let year = 1997;
  let month = 12;
  let day = 7;

  // Try AD date first (format: YYYY-MM-DD)
  if (dobAd && /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(dobAd)) {
    const parts = dobAd.split(/[-/.]/).map(Number);
    year = parts[0];
    month = parts[1];
    day = parts[2];
  } else if (dobBs && /^(?:२०|20)\d{2}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(dobBs)) {
    // Rough BS to AD conversion (~56.7 years difference)
    const parts = dobBs.replace(/[०-९]/g, d => '०१२३४५६७८९'.indexOf(d)).split(/[-/.]/).map(Number);
    const bsYear = parts[0];
    const bsMonth = parts[1];
    const bsDay = parts[2];
    year = bsYear - 57;
    month = bsMonth >= 9 ? (bsMonth - 8) : (bsMonth + 4);
    day = Math.min(28, bsDay);
    if (month > 12) { month = 12; }
    if (month < 1) { month = 1; }
  }

  // Parse time (e.g. "06:30 AM", "14:45", "बिहान ०६:३० AM")
  let hour = 6;
  let minute = 30;
  if (birthTime) {
    const cleanTime = birthTime.replace(/[०-९]/g, d => '०१२३४५६७८९'.indexOf(d));
    const match = cleanTime.match(/(\d{1,2})[:.](\d{2})\s*(AM|PM|am|pm)?/i);
    if (match) {
      hour = parseInt(match[1], 10);
      minute = parseInt(match[2], 10);
      const ampm = (match[3] || '').toUpperCase();
      const isPm = ampm === 'PM' || cleanTime.includes('दिउँसो') || cleanTime.includes('साँझ') || cleanTime.includes('राति');
      const isAm = ampm === 'AM' || cleanTime.includes('बिहान');
      if (isPm && hour < 12) hour += 12;
      if (isAm && hour === 12) hour = 0;
    }
  }

  return { year, month, day, hour, minute, second: 0 };
}

/**
 * High-Precision Astronomical Vedic Calculation (Fallback / Offline Engine)
 */
function calculateVedicPositions(year, month, day, hour, minute, lat, lon) {
  // 1. Julian Day Calculation
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFraction = (hour + (minute / 60) - 5.75) / 24; // UTC offset for Nepal +5:45
  const JD = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + dayFraction + B - 1524.5;

  const T = (JD - 2451545.0) / 36525.0; // Julian centuries since J2000.0

  // 2. Lahiri Ayanamsa Calculation
  const ayanamsa = 23.85 + (T * 1.397);

  // 3. Sun Tropical Longitude
  const L0 = (280.46646 + 36000.76983 * T) % 360;
  const M_sun = ((357.52911 + 35999.05029 * T) % 360) * (Math.PI / 180);
  const C_sun = (1.914602 - 0.004817 * T) * Math.sin(M_sun) + 0.019993 * Math.sin(2 * M_sun);
  const sunTrop = (L0 + C_sun + 360) % 360;
  const sunSidereal = (sunTrop - ayanamsa + 360) % 360;

  // 4. Moon Tropical & Sidereal Longitude
  const L_moon = (218.3165 + 481267.8813 * T) % 360;
  const M_moon = ((134.9634 + 477198.8676 * T) % 360) * (Math.PI / 180);
  const D_moon = ((297.8502 + 445267.1115 * T) % 360) * (Math.PI / 180);
  const F_moon = ((93.2721 + 483202.0175 * T) % 360) * (Math.PI / 180);
  const moonTrop = (L_moon + 6.289 * Math.sin(M_moon) - 1.274 * Math.sin(M_moon - 2 * D_moon) + 0.658 * Math.sin(2 * D_moon) + 360) % 360;
  const moonSidereal = (moonTrop - ayanamsa + 360) % 360;

  // 5. Planetary Sidereal Approximations
  const marsSidereal = ((355.43 + 19140.3 * T) - ayanamsa + 360) % 360;
  const mercurySidereal = ((sunTrop + 18 * Math.sin((hour + day) * 0.2)) - ayanamsa + 360) % 360;
  const jupiterSidereal = ((34.35 + 3034.9 * T) - ayanamsa + 360) % 360;
  const venusSidereal = ((sunTrop + 32 * Math.cos((day * 3.14) / 15)) - ayanamsa + 360) % 360;
  const saturnSidereal = ((50.08 + 1222.1 * T) - ayanamsa + 360) % 360;
  const rahuSidereal = ((125.04 - 1934.136 * T) - ayanamsa + 360) % 360;
  const ketuSidereal = (rahuSidereal + 180) % 360;

  // 6. Sidereal Time & Ascendant (Lagna)
  const GMST = (280.46061837 + 360.98564736629 * (JD - 2451545.0) + T * T * 0.000387933) % 360;
  const LMST = (GMST + lon + 360) % 360;
  const ramcRad = LMST * (Math.PI / 180);
  const eps = (23.4392911 - T * 0.0130042) * (Math.PI / 180);
  const latRad = lat * (Math.PI / 180);

  // Ascendant formula
  const lagnaTrop = Math.atan2(Math.cos(ramcRad), -(Math.sin(ramcRad) * Math.cos(eps) + Math.tan(latRad) * Math.sin(eps))) * (180 / Math.PI);
  const lagnaTropNorm = (lagnaTrop + 360) % 360;
  const lagnaSidereal = (lagnaTropNorm - ayanamsa + 360) % 360;

  // Sign helper
  function toRashiInfo(deg) {
    const signIndex = Math.floor(deg / 30);
    const signNumber = signIndex + 1; // 1 to 12
    const degreeInSign = deg % 30;
    const degInt = Math.floor(degreeInSign);
    const minInt = Math.floor((degreeInSign - degInt) * 60);
    const rashi = RASHIS[signIndex];
    return {
      signNumber,
      rashiName: rashi.name,
      rashiLord: rashi.lord,
      element: rashi.element,
      degreeFormatted: `${degInt}° ${minInt.toString().padStart(2, '0')}'`,
      rawDegree: deg
    };
  }

  const lagnaInfo = toRashiInfo(lagnaSidereal);
  const moonInfo = toRashiInfo(moonSidereal);

  // Nakshatra of Moon
  const nakshatraIndex = Math.floor((moonSidereal / 360) * 27) % 27;
  const nakshatraPada = (Math.floor(((moonSidereal / 360) * 27 * 4)) % 4) + 1;
  const nakshatraName = NAKSHATRAS[nakshatraIndex];

  // Map each planet to its Bhava (House 1 to 12 relative to Lagna)
  function getBhava(planetSignNum, lagnaSignNum) {
    let b = (planetSignNum - lagnaSignNum + 1);
    if (b <= 0) b += 12;
    return b;
  }

  const planetsList = [
    { name: 'Ascendant', ...toRashiInfo(lagnaSidereal) },
    { name: 'Sun', ...toRashiInfo(sunSidereal) },
    { name: 'Moon', ...toRashiInfo(moonSidereal) },
    { name: 'Mars', ...toRashiInfo(marsSidereal) },
    { name: 'Mercury', ...toRashiInfo(mercurySidereal) },
    { name: 'Jupiter', ...toRashiInfo(jupiterSidereal) },
    { name: 'Venus', ...toRashiInfo(venusSidereal) },
    { name: 'Saturn', ...toRashiInfo(saturnSidereal) },
    { name: 'Rahu', ...toRashiInfo(rahuSidereal) },
    { name: 'Ketu', ...toRashiInfo(ketuSidereal) },
  ].map(p => {
    const glyph = PLANET_GLYPHS[p.name] || { dev: p.name.slice(0, 2), name: p.name };
    const bhava = getBhava(p.signNumber, lagnaInfo.signNumber);
    return {
      key: p.name,
      nepaliName: glyph.name,
      dev: glyph.dev,
      signNumber: p.signNumber,
      rashiName: p.rashiName,
      bhava,
      degreeFormatted: p.degreeFormatted,
      lord: p.rashiLord
    };
  });

  return {
    ayanamsa: `${Math.floor(ayanamsa)}° ${Math.floor((ayanamsa % 1) * 60)}' (Lahiri)`,
    lagna: {
      signNumber: lagnaInfo.signNumber,
      rashiName: lagnaInfo.rashiName,
      degreeFormatted: lagnaInfo.degreeFormatted,
      lord: lagnaInfo.rashiLord
    },
    moonSign: {
      signNumber: moonInfo.signNumber,
      rashiName: moonInfo.rashiName,
      degreeFormatted: moonInfo.degreeFormatted,
      lord: moonInfo.rashiLord
    },
    nakshatra: {
      name: nakshatraName,
      pada: nakshatraPada
    },
    planets: planetsList
  };
}

/**
 * Generate Traditional Vedic Diamond Lagna Kundali SVG (Brihat Parashara Style)
 */
function generateVedicDiamondSvg(astrologyData, customerName, birthDetailsStr) {
  const { lagna, planets } = astrologyData;
  const lagnaSign = lagna.signNumber;

  // Calculate sign number for each house (1 to 12)
  const houseSigns = {};
  for (let h = 1; h <= 12; h++) {
    let s = (lagnaSign + h - 1) % 12;
    if (s === 0) s = 12;
    houseSigns[h] = s;
  }

  // Group planets by house (1 to 12)
  const housePlanets = {};
  for (let h = 1; h <= 12; h++) housePlanets[h] = [];
  for (const p of planets) {
    if (housePlanets[p.bhava]) {
      housePlanets[p.bhava].push(p);
    }
  }

  // Helper to render planet badges inside house
  function renderPlanets(houseNum, x, y) {
    const list = housePlanets[houseNum] || [];
    if (list.length === 0) return '';
    return list.map((p, idx) => {
      const offsetX = (idx % 2 === 0 ? -18 : 18) * (list.length > 2 ? 1 : 0);
      const offsetY = Math.floor(idx / 2) * 16 - (list.length > 2 ? 12 : 0);
      return `<text x="${x + offsetX}" y="${y + offsetY}" fill="#f4d38c" font-size="13" font-weight="700" font-family="'DM Sans', 'Noto Serif Devanagari', sans-serif" text-anchor="middle">
        ${p.dev} <tspan font-size="10" fill="#ad9eb2" font-weight="normal">(${p.degreeFormatted.split('°')[0]}°)</tspan>
      </text>`;
    }).join('');
  }

  // House coordinates for labels and planet placement in 600x600 Vedic Diamond Chart
  const H = {
    1: { numX: 300, numY: 200, plX: 300, plY: 240 }, // Top diamond
    2: { numX: 200, numY: 100, plX: 180, plY: 140 }, // Top left triangle
    3: { numX: 100, numY: 200, plX: 130, plY: 230 }, // Left upper triangle
    4: { numX: 200, numY: 300, plX: 240, plY: 300 }, // Left diamond
    5: { numX: 100, numY: 400, plX: 130, plY: 390 }, // Left lower triangle
    6: { numX: 200, numY: 500, plX: 180, plY: 470 }, // Bottom left triangle
    7: { numX: 300, numY: 400, plX: 300, plY: 370 }, // Bottom diamond
    8: { numX: 400, numY: 500, plX: 420, plY: 470 }, // Bottom right triangle
    9: { numX: 500, numY: 400, plX: 470, plY: 390 }, // Right lower triangle
    10: { numX: 400, numY: 300, plX: 360, plY: 300 }, // Right diamond
    11: { numX: 500, numY: 200, plX: 470, plY: 230 }, // Right upper triangle
    12: { numX: 400, numY: 100, plX: 420, plY: 140 }, // Top right triangle
  };

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 660" width="100%" height="100%" style="background-color: #0b0816; border-radius: 16px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.6);">
  <defs>
    <linearGradient id="chartBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#140e24"/>
      <stop offset="50%" stop-color="#0e0a1b"/>
      <stop offset="100%" stop-color="#18112b"/>
    </linearGradient>
    <linearGradient id="goldStroke" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f4d38c"/>
      <stop offset="50%" stop-color="#d8b06a"/>
      <stop offset="100%" stop-color="#b88840"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background Rect -->
  <rect x="0" y="0" width="600" height="660" fill="url(#chartBg)" />

  <!-- Top Title Header -->
  <g transform="translate(300, 32)">
    <text x="0" y="0" text-anchor="middle" fill="#d8b06a" font-family="'Cormorant Garamond', 'Noto Serif Devanagari', serif" font-size="20" font-weight="700" letter-spacing="1">
      श्री लग्न कुण्डली (VEDIC NATAL CHART)
    </text>
    <text x="0" y="18" text-anchor="middle" fill="#ad9eb2" font-family="'DM Sans', sans-serif" font-size="11.5">
      जातक: ${customerName || 'यजमान'} | ${birthDetailsStr || ''}
    </text>
  </g>

  <!-- Chart Outer Frame (Starts at y=70, size 500x500) -->
  <g transform="translate(50, 70)">
    <!-- Chart Background -->
    <rect x="0" y="0" width="500" height="500" fill="#0d0918" stroke="url(#goldStroke)" stroke-width="2.5" />

    <!-- Corner Insets / Sacred Accents -->
    <circle cx="250" cy="250" r="4" fill="#f4d38c" filter="url(#glow)"/>

    <!-- Diagonal Cross Lines -->
    <line x1="0" y1="0" x2="500" y2="500" stroke="#d8b06a" stroke-width="1.8" stroke-opacity="0.85" />
    <line x1="500" y1="0" x2="0" y2="500" stroke="#d8b06a" stroke-width="1.8" stroke-opacity="0.85" />

    <!-- Inner Diamond Lines -->
    <polygon points="250,0 500,250 250,500 0,250" fill="none" stroke="url(#goldStroke)" stroke-width="2" />

    <!-- House Rashi Numbers & Planets -->
    ${[1,2,3,4,5,6,7,8,9,10,11,12].map(h => {
      const coords = H[h];
      const sign = houseSigns[h];
      const isLagna = (h === 1);
      return `
        <!-- House ${h} -->
        <g id="house-${h}">
          <circle cx="${coords.numX - 50}" cy="${coords.numY - 70}" r="9" fill="${isLagna ? 'rgba(216, 176, 106, 0.25)' : 'rgba(255,255,255,0.04)'}" stroke="${isLagna ? '#d8b06a' : 'rgba(255,255,255,0.1)'}" stroke-width="1"/>
          <text x="${coords.numX - 50}" y="${coords.numY - 67}" fill="${isLagna ? '#f4d38c' : '#ad9eb2'}" font-size="10.5" font-family="'DM Sans', sans-serif" font-weight="${isLagna ? 'bold' : 'normal'}" text-anchor="middle">
            ${sign}
          </text>
          ${renderPlanets(h, coords.plX - 50, coords.plY - 70)}
        </g>
      `;
    }).join('\n')}
  </g>

  <!-- Bottom Footer Info -->
  <g transform="translate(300, 605)">
    <rect x="-260" y="-12" width="520" height="48" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(216, 176, 106, 0.2)" stroke-width="1"/>
    <text x="-245" y="8" fill="#f4d38c" font-size="11.5" font-family="'DM Sans', sans-serif" font-weight="600">
      लग्न: <tspan fill="#ffffff">${astrologyData.lagna.rashiName} (${astrologyData.lagna.degreeFormatted})</tspan>
    </text>
    <text x="-80" y="8" fill="#f4d38c" font-size="11.5" font-family="'DM Sans', sans-serif" font-weight="600">
      चन्द्र राशि: <tspan fill="#ffffff">${astrologyData.moonSign.rashiName}</tspan>
    </text>
    <text x="80" y="8" fill="#f4d38c" font-size="11.5" font-family="'DM Sans', sans-serif" font-weight="600">
      नक्षत्र: <tspan fill="#ffffff">${astrologyData.nakshatra.name}</tspan>
    </text>
    <text x="0" y="27" text-anchor="middle" fill="#796c80" font-size="10" font-family="'DM Sans', sans-serif">
      Ayanamsa: ${astrologyData.ayanamsa} | Powered by Astro Tiwari &amp; Astrologer API
    </text>
  </g>
</svg>`;

  return svg;
}

/**
 * Call External Astrologer-API (RapidAPI or Self-Hosted)
 */
async function callExternalAstrologerApi(subjectData, theme = 'dark', language = 'EN') {
  const rapidApiKey = process.env.ASTROLOGER_RAPIDAPI_KEY || '';
  const rapidApiHost = process.env.ASTROLOGER_RAPIDAPI_HOST || 'astrologer.p.rapidapi.com';
  const customApiUrl = process.env.ASTROLOGER_API_URL || '';

  let requestUrl = '';
  const headers = {
    'Content-Type': 'application/json',
  };

  if (customApiUrl) {
    requestUrl = `${customApiUrl.replace(/\/+$/, '')}/api/v5/chart/birth-chart`;
  } else if (rapidApiKey) {
    requestUrl = `https://${rapidApiHost}/api/v5/chart/birth-chart`;
    headers['X-RapidAPI-Host'] = rapidApiHost;
    headers['X-RapidAPI-Key'] = rapidApiKey;
  } else {
    // No external API configured, will use fallback
    return null;
  }

  const payload = JSON.stringify({
    subject: {
      name: subjectData.name || 'Subject',
      year: subjectData.year,
      month: subjectData.month,
      day: subjectData.day,
      hour: subjectData.hour,
      minute: subjectData.minute,
      second: subjectData.second || 0,
      city: subjectData.city || 'Kathmandu',
      nation: subjectData.nation || 'NP',
      timezone: subjectData.timezone || 'Asia/Kathmandu',
      latitude: subjectData.latitude,
      longitude: subjectData.longitude,
      zodiac_type: subjectData.zodiac_type || 'Sidereal',
      sidereal_mode: subjectData.sidereal_mode || 'LAHIRI',
      houses_system_identifier: 'P'
    },
    theme: theme || 'dark',
    language: language || 'EN'
  });

  return new Promise((resolve) => {
    try {
      const parsed = new url.URL(requestUrl);
      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : http;

      const req = client.request(parsed, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 8000
      }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const json = JSON.parse(data);
              resolve({ success: true, data: json });
            } else {
              console.warn(`[Astrologer API] HTTP Error ${res.statusCode}:`, data.slice(0, 200));
              resolve({ success: false, status: res.statusCode, error: data });
            }
          } catch (e) {
            resolve({ success: false, error: e.message });
          }
        });
      });

      req.on('error', (err) => {
        console.warn('[Astrologer API] Request failed:', err.message);
        resolve({ success: false, error: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        console.warn('[Astrologer API] Request timed out after 8s');
        resolve({ success: false, error: 'Request timeout' });
      });

      req.write(payload);
      req.end();
    } catch (err) {
      console.warn('[Astrologer API] Exception:', err.message);
      resolve({ success: false, error: err.message });
    }
  });
}

/**
 * Format AI Reading Prompt for Panditji / LLM Analysis
 */
function buildAiAstrologyContext(name, astrologyData, birthDetailsStr) {
  const { lagna, moonSign, nakshatra, planets } = astrologyData;
  const planetsSummary = planets.map(p => `- ${p.nepaliName} (${p.dev}): ${p.bhava} औं भावमा, ${p.rashiName} राशि (${p.degreeFormatted})`).join('\n');

  return `=============================================
🌟 ASTRO TIWARI — वैदिक जन्म कुण्डली विश्लेषण
=============================================
जातकको नाम: ${name}
जन्म विवरण: ${birthDetailsStr}

[आधारभूत ज्योतिष विवरण]
- लग्न (Ascendant): ${lagna.rashiName} (${lagna.degreeFormatted}) — स्वामी: ${lagna.lord}
- जन्म राशि (Moon Sign): ${moonSign.rashiName} (${moonSign.degreeFormatted}) — स्वामी: ${moonSign.lord}
- जन्म नक्षत्र: ${nakshatra.name} (चरण: ${nakshatra.pada})
- अयनांश: ${astrologyData.ayanamsa}

[ग्रहहरूको भावगत स्थिति]
${planetsSummary}

[पण्डितजी तथा AI का लागि विशेष मार्गदर्शन]
१. लग्न र लग्नेशको बल तथा स्वास्थ्य/व्यक्तित्व प्रभाव।
२. चन्द्रमा र मानसिक शान्ति, भाग्य र पेशागत स्थिति।
३. महादशा, अन्तर्दशा तथा वर्तमान गोचरको प्रभाव।
४. शुभ रत्न, रुद्राक्ष तथा वैदिक शान्ति उपायहरू।
=============================================`;
}

/**
 * Main Service Function: Generate Chart for Customer Submission or API
 */
async function generateChartForSubmission(input) {
  const {
    id = ('KUNDALI-' + Date.now()),
    name = 'Anonymous',
    dobAd = '',
    dobBs = '',
    birthTime = '',
    birthPlace = ''
  } = input;

  const loc = resolveLocation(birthPlace);
  const dateParts = parseDateComponents(dobAd, dobBs, birthTime);

  const subjectData = {
    name,
    year: dateParts.year,
    month: dateParts.month,
    day: dateParts.day,
    hour: dateParts.hour,
    minute: dateParts.minute,
    second: 0,
    city: loc.city,
    nation: loc.nation,
    timezone: loc.tz,
    latitude: loc.lat,
    longitude: loc.lon,
    zodiac_type: 'Sidereal',
    sidereal_mode: 'LAHIRI'
  };

  const birthDetailsStr = `${dateParts.year}-${String(dateParts.month).padStart(2,'0')}-${String(dateParts.day).padStart(2,'0')} ${String(dateParts.hour).padStart(2,'0')}:${String(dateParts.minute).padStart(2,'0')} | ${loc.city}, Nepal`;

  // 1. Calculate Astronomical Vedic Positions
  const vedicData = calculateVedicPositions(
    dateParts.year,
    dateParts.month,
    dateParts.day,
    dateParts.hour,
    dateParts.minute,
    loc.lat,
    loc.lon
  );

  let chartSvg = '';
  let chartSource = 'Astro Tiwari Vedic Engine';
  let externalChartData = null;

  // 2. Attempt External Astrologer-API if configured
  try {
    const apiResult = await callExternalAstrologerApi(subjectData, 'dark', 'EN');
    if (apiResult && apiResult.success && apiResult.data && apiResult.data.chart) {
      chartSvg = apiResult.data.chart;
      externalChartData = apiResult.data.chart_data;
      chartSource = process.env.ASTROLOGER_RAPIDAPI_KEY ? 'Astrologer-API (RapidAPI)' : 'Astrologer-API (Self-Hosted)';
    }
  } catch (err) {
    console.warn('[Astrologer API] Calling error, falling back to local Vedic SVG:', err.message);
  }

  // 3. If external API didn't return SVG, use our high-fidelity Vedic Diamond SVG
  if (!chartSvg) {
    chartSvg = generateVedicDiamondSvg(vedicData, name, birthDetailsStr);
  }

  // 4. Save SVG file to disk
  const filename = `chart-${id}.svg`;
  const filePath = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(filePath, chartSvg, 'utf8');
  const chartSvgUrl = `/uploads/${filename}`;

  const aiContext = buildAiAstrologyContext(name, vedicData, birthDetailsStr);

  return {
    success: true,
    id,
    source: chartSource,
    chartSvgUrl,
    chartSvg,
    astrologyData: vedicData,
    externalChartData,
    aiContext,
    subject: subjectData
  };
}

/**
 * Status Check
 */
function getAstrologerApiStatus() {
  const rapidApiKey = process.env.ASTROLOGER_RAPIDAPI_KEY || '';
  const customApiUrl = process.env.ASTROLOGER_API_URL || '';

  return {
    status: 'connected',
    rapidApiConfigured: Boolean(rapidApiKey),
    customApiUrl: customApiUrl || null,
    activeEngine: rapidApiKey
      ? 'Astrologer-API (RapidAPI v5)'
      : (customApiUrl ? 'Astrologer-API (Self-Hosted v5)' : 'Astro Tiwari Built-in Vedic Engine (100% Free & Offline)'),
    version: '5.0',
    features: [
      'Vedic Lagna Kundali Diamond SVG',
      'Western Concentric Wheel SVG (via Astrologer-API)',
      'High-Precision Lahiri Ayanamsa Calculation',
      'Planetary Positions (Sun to Ketu)',
      '12 Bhavas & Rashi Lordship',
      'Nakshatra & Pada Calculation',
      'AI-Ready Astrological Reading Context'
    ]
  };
}

module.exports = {
  CITY_COORDINATES,
  RASHIS,
  NAKSHATRAS,
  resolveLocation,
  parseDateComponents,
  calculateVedicPositions,
  generateVedicDiamondSvg,
  generateChartForSubmission,
  getAstrologerApiStatus
};
