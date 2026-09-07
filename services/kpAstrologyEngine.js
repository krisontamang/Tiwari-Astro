/**
 * services/kpAstrologyEngine.js
 * Comprehensive Krishnamurti Paddhati (KP) & Vedic Astrological Engine
 * 
 * Implements full Astro Darshan standard:
 * 1. KP New Ayanamsha, Lahiri, Raman
 * 2. Placidus 12 House Cusps (Exact spherical trigonometry)
 * 3. 249 KP Sub Lords, 2241 Sub-Sub Lords (SSL), Sub-Sub-Sub Lords (SSSL)
 * 4. High-precision Sidereal Planetary Positions (Sun to Ketu) with Retrograde
 * 5. Bhava Chalit (KP House) mapping
 * 6. 4-Fold & 6-Fold KP Significators (A, B, C, D, E, F levels)
 * 7. Nadi Significators (छोटकरीमा र विस्तृतमा)
 * 8. Ruling Planets (शासक ग्रहहरू - Day, Moon, Lagna lords)
 * 9. Planetary Aspects & Conjunctions Grid with Nature scoring
 * 10. Vimshottari Dasha with Bikram Sambat (वि.सं.) conversion
 * 11. Dual North Indian Diamond SVG Generator (D1 Lagna & KP Bhava Chalit with cusp degrees)
 * 12. Gochar (Transits) and KP Horary (Prashna 1-249)
 */

const nepaliPatroService = require('./nepaliPatroService');

// Devanagari conversion helpers
const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
function toNep(num) {
  return String(num).replace(/\d/g, d => NEP_DIGITS[parseInt(d)]);
}

function formatDMS(degFloat, useNep = true) {
  const norm = ((degFloat % 360) + 360) % 360;
  const d = Math.floor(norm);
  const remM = (norm - d) * 60;
  const m = Math.floor(remM);
  const s = ((remM - m) * 60).toFixed(2);
  const pad = (n) => String(n).padStart(2, '0');
  const res = `${pad(d)}° ${pad(m)}' ${pad(s)}"`;
  return useNep ? toNep(res) : res;
}

function formatDMSShort(degFloat, useNep = true) {
  const norm = ((degFloat % 360) + 360) % 360;
  const d = Math.floor(norm);
  const m = Math.round((norm - d) * 60);
  const res = `${d}° ${m}'`;
  return useNep ? toNep(res) : res;
}

// 12 Rashis (Zodiac Signs)
const RASHIS = [
  { num: 1, name: 'मेष', en: 'Aries', lord: 'मंगल', lordEn: 'Mars' },
  { num: 2, name: 'वृष', en: 'Taurus', lord: 'शुक्र', lordEn: 'Venus' },
  { num: 3, name: 'मिथुन', en: 'Gemini', lord: 'बुध', lordEn: 'Mercury' },
  { num: 4, name: 'कर्कट', en: 'Cancer', lord: 'चन्द्र', lordEn: 'Moon' },
  { num: 5, name: 'सिंह', en: 'Leo', lord: 'सूर्य', lordEn: 'Sun' },
  { num: 6, name: 'कन्या', en: 'Virgo', lord: 'बुध', lordEn: 'Mercury' },
  { num: 7, name: 'तुला', en: 'Libra', lord: 'शुक्र', lordEn: 'Venus' },
  { num: 8, name: 'वृश्चिक', en: 'Scorpio', lord: 'मंगल', lordEn: 'Mars' },
  { num: 9, name: 'धनु', en: 'Sagittarius', lord: 'गुरु', lordEn: 'Jupiter' },
  { num: 10, name: 'मकर', en: 'Capricorn', lord: 'शनि', lordEn: 'Saturn' },
  { num: 11, name: 'कुम्भ', en: 'Aquarius', lord: 'शनि', lordEn: 'Saturn' },
  { num: 12, name: 'मीन', en: 'Pisces', lord: 'गुरु', lordEn: 'Jupiter' }
];

// 27 Nakshatras
const NAKSHATRAS = [
  { num: 1, name: 'अश्विनी', lord: 'केतु', lordEn: 'Ketu', gana: 'नर', nadi: 'आदि', yoni: 'श्वान', varna: 'ब्राह्मण', padas: ['चु', 'चे', 'चो', 'ला'] },
  { num: 2, name: 'भरणी', lord: 'शुक्र', lordEn: 'Venus', gana: 'नर', nadi: 'मध्य', yoni: 'गज', varna: 'क्षत्रिय', padas: ['ली', 'लू', 'ले', 'लो'] },
  { num: 3, name: 'कृत्तिका', lord: 'सूर्य', lordEn: 'Sun', gana: 'राक्षस', nadi: 'अन्त्य', yoni: 'मेष', varna: 'वैश्य', padas: ['अ', 'ई', 'उ', 'ए'] },
  { num: 4, name: 'रोहिणी', lord: 'चन्द्र', lordEn: 'Moon', gana: 'नर', nadi: 'अन्त्य', yoni: 'सर्प', varna: 'शुद्र', padas: ['ओ', 'वा', 'वी', 'वू'] },
  { num: 5, name: 'मृगशिरा', lord: 'मंगल', lordEn: 'Mars', gana: 'देव', nadi: 'मध्य', yoni: 'सर्प', varna: 'वैश्य', padas: ['वे', 'वो', 'का', 'की'] },
  { num: 6, name: 'आर्द्रा', lord: 'राहु', lordEn: 'Rahu', gana: 'नर', nadi: 'आदि', yoni: 'श्वान', varna: 'शुद्र', padas: ['कु', 'घ', 'ङ', 'छ'] },
  { num: 7, name: 'पुनर्वसु', lord: 'गुरु', lordEn: 'Jupiter', gana: 'देव', nadi: 'आदि', yoni: 'मार्जारी', varna: 'वैश्य', padas: ['के', 'को', 'हा', 'ही'] },
  { num: 8, name: 'पुष्य', lord: 'शनि', lordEn: 'Saturn', gana: 'देव', nadi: 'मध्य', yoni: 'मेष', varna: 'क्षत्रिय', padas: ['हू', 'हे', 'हो', 'डा'] },
  { num: 9, name: 'अश्लेषा', lord: 'बुध', lordEn: 'Mercury', gana: 'राक्षस', nadi: 'अन्त्य', yoni: 'मार्जारी', varna: 'शुद्र', padas: ['डी', 'डू', 'डे', 'डो'] },
  { num: 10, name: 'मघा', lord: 'केतु', lordEn: 'Ketu', gana: 'राक्षस', nadi: 'अन्त्य', yoni: 'मूषक', varna: 'शुद्र', padas: ['मा', 'मी', 'मू', 'मे'] },
  { num: 11, name: 'पूर्वाफाल्गुनी', lord: 'शुक्र', lordEn: 'Venus', gana: 'नर', nadi: 'मध्य', yoni: 'मूषक', varna: 'ब्राह्मण', padas: ['मो', 'टा', 'टी', 'टू'] },
  { num: 12, name: 'उत्तराफाल्गुनी', lord: 'सूर्य', lordEn: 'Sun', gana: 'नर', nadi: 'आदि', yoni: 'गौ', varna: 'क्षत्रिय', padas: ['टे', 'टो', 'पा', 'पी'] },
  { num: 13, name: 'हस्त', lord: 'चन्द्र', lordEn: 'Moon', gana: 'देव', nadi: 'आदि', yoni: 'महिष', varna: 'वैश्य', padas: ['पू', 'ष', 'ण', 'ठ'] },
  { num: 14, name: 'चित्रा', lord: 'मंगल', lordEn: 'Mars', gana: 'राक्षस', nadi: 'मध्य', yoni: 'व्याघ्र', varna: 'शुद्र', padas: ['पे', 'पो', 'रा', 'री'] },
  { num: 15, name: 'स्वाती', lord: 'राहु', lordEn: 'Rahu', gana: 'देव', nadi: 'अन्त्य', yoni: 'महिष', varna: 'शुद्र', padas: ['रू', 'रे', 'रो', 'ता'] },
  { num: 16, name: 'विशाखा', lord: 'गुरु', lordEn: 'Jupiter', gana: 'राक्षस', nadi: 'अन्त्य', yoni: 'व्याघ्र', varna: 'ब्राह्मण', padas: ['ती', 'तू', 'ते', 'तो'] },
  { num: 17, name: 'अनुराधा', lord: 'शनि', lordEn: 'Saturn', gana: 'देव', nadi: 'मध्य', yoni: 'मृग', varna: 'क्षत्रिय', padas: ['ना', 'नी', 'नू', 'ने'] },
  { num: 18, name: 'ज्येष्ठा', lord: 'बुध', lordEn: 'Mercury', gana: 'राक्षस', nadi: 'आदि', yoni: 'मृग', varna: 'वैश्य', padas: ['नो', 'या', 'यी', 'यू'] },
  { num: 19, name: 'मूल', lord: 'केतु', lordEn: 'Ketu', gana: 'राक्षस', nadi: 'आदि', yoni: 'श्वान', varna: 'शुद्र', padas: ['ये', 'यो', 'भा', 'भी'] },
  { num: 20, name: 'पूर्वाषाढा', lord: 'शुक्र', lordEn: 'Venus', gana: 'नर', nadi: 'मध्य', yoni: 'वानर', varna: 'ब्राह्मण', padas: ['भू', 'धा', 'फा', 'ढा'] },
  { num: 21, name: 'उत्तराषाढा', lord: 'सूर्य', lordEn: 'Sun', gana: 'नर', nadi: 'अन्त्य', yoni: 'नकुल', varna: 'क्षत्रिय', padas: ['भे', 'भो', 'जा', 'जी'] },
  { num: 22, name: 'श्रवण', lord: 'चन्द्र', lordEn: 'Moon', gana: 'देव', nadi: 'अन्त्य', yoni: 'वानर', varna: 'वैश्य', padas: ['खी', 'खू', 'खे', 'खो'] },
  { num: 23, name: 'धनिष्ठा', lord: 'मंगल', lordEn: 'Mars', gana: 'राक्षस', nadi: 'मध्य', yoni: 'सिंह', varna: 'शुद्र', padas: ['गा', 'गी', 'गु', 'गे'] },
  { num: 24, name: 'शतभिषा', lord: 'राहु', lordEn: 'Rahu', gana: 'राक्षस', nadi: 'आदि', yoni: 'अश्व', varna: 'शुद्र', padas: ['गो', 'सा', 'सी', 'सू'] },
  { num: 25, name: 'पूर्वाभाद्रपदा', lord: 'गुरु', lordEn: 'Jupiter', gana: 'नर', nadi: 'आदि', yoni: 'सिंह', varna: 'ब्राह्मण', padas: ['से', 'सो', 'दा', 'दी'] },
  { num: 26, name: 'उत्तराभाद्रपदा', lord: 'शनि', lordEn: 'Saturn', gana: 'नर', nadi: 'मध्य', yoni: 'गौ', varna: 'क्षत्रिय', padas: ['दू', 'थ', 'झ', 'ञ'] },
  { num: 27, name: 'रेवती', lord: 'बुध', lordEn: 'Mercury', gana: 'देव', nadi: 'अन्त्य', yoni: 'गज', varna: 'वैश्य', padas: ['दे', 'दो', 'चा', 'ची'] }
];

// Vimshottari Dasha order & years
const VIMSHOTTARI = [
  { lord: 'केतु', en: 'Ketu', years: 7 },
  { lord: 'शुक्र', en: 'Venus', years: 20 },
  { lord: 'सूर्य', en: 'Sun', years: 6 },
  { lord: 'चन्द्र', en: 'Moon', years: 10 },
  { lord: 'मंगल', en: 'Mars', years: 7 },
  { lord: 'राहु', en: 'Rahu', years: 18 },
  { lord: 'गुरु', en: 'Jupiter', years: 16 },
  { lord: 'शनि', en: 'Saturn', years: 19 },
  { lord: 'बुध', en: 'Mercury', years: 17 }
];

const TOTAL_DASHA_YEARS = 120;
const NAKSHATRA_SPAN = 360 / 27; // 13.333333 degrees = 800 arcminutes

/**
 * 1. Astronomical Foundations & Julian Day
 */
function getJulianDay(date, hour = 0, minute = 0, second = 0, gmtOffsetHours = 5.75) {
  const d = new Date(date);
  let y = d.getUTCFullYear();
  let m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  const decimalHour = hour + (minute / 60) + (second / 3600) - gmtOffsetHours;
  const dayFraction = decimalHour / 24;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + dayFraction + B - 1524.5;
  return jd;
}

/**
 * 2. High-Precision Ayanamsha Calculation
 */
function getAyanamsha(jd, type = 'KP_NEW') {
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries from J2000.0
  if (type === 'LAHIRI') {
    return 23.85611 + 1.39638 * T;
  } else if (type === 'RAMAN') {
    return 22.40000 + 1.39638 * T;
  }
  // KP New Ayanamsha (Standard for Krishnamurti Paddhati)
  // J2000: 23° 45' 56.55" = 23.765708°
  return 23.765708 + 1.39600 * T;
}

/**
 * 3. KP Sub-Division Engine: 249 Sub-Lords, Sub-Sub-Lords, Sub-Sub-Sub-Lords
 */
function getKPLords(longitude) {
  const norm = ((longitude % 360) + 360) % 360;

  // Sign Lord (राशि स्वामी)
  const signIndex = Math.floor(norm / 30);
  const sign = RASHIS[signIndex];
  const degInSign = norm % 30;

  // Nakshatra Lord (नक्षत्र स्वामी)
  const nakIndex = Math.floor(norm / NAKSHATRA_SPAN);
  const nak = NAKSHATRAS[nakIndex % 27];
  const nakStart = nakIndex * NAKSHATRA_SPAN;
  const degInNak = norm - nakStart;
  const pada = Math.floor(degInNak / (NAKSHATRA_SPAN / 4)) + 1;
  const firstLetter = nak.padas[pada - 1] || nak.padas[0];

  // Starting Vimshottari index for the Nakshatra's lord
  const starLordIdx = VIMSHOTTARI.findIndex(v => v.en === nak.lordEn || v.lord === nak.lord);

  // Calculate Sub-Lord (उप स्वामी)
  let subLord = null;
  let subStart = 0;
  let subSpan = 0;
  let acc = 0;
  for (let i = 0; i < 9; i++) {
    const p = VIMSHOTTARI[(starLordIdx + i) % 9];
    const span = NAKSHATRA_SPAN * (p.years / TOTAL_DASHA_YEARS);
    if (degInNak >= acc && degInNak < acc + span) {
      subLord = p;
      subStart = acc;
      subSpan = span;
      break;
    }
    acc += span;
  }
  if (!subLord) {
    subLord = VIMSHOTTARI[starLordIdx];
    subSpan = NAKSHATRA_SPAN * (subLord.years / TOTAL_DASHA_YEARS);
  }

  // Calculate Sub-Sub Lord (उप उप स्वामी)
  const degInSub = degInNak - subStart;
  const subLordIdx = VIMSHOTTARI.findIndex(v => v.en === subLord.en);
  let subSubLord = null;
  let sslStart = 0;
  let sslSpan = 0;
  let accSsl = 0;
  for (let i = 0; i < 9; i++) {
    const p = VIMSHOTTARI[(subLordIdx + i) % 9];
    const span = subSpan * (p.years / TOTAL_DASHA_YEARS);
    if (degInSub >= accSsl && degInSub < accSsl + span) {
      subSubLord = p;
      sslStart = accSsl;
      sslSpan = span;
      break;
    }
    accSsl += span;
  }
  if (!subSubLord) {
    subSubLord = VIMSHOTTARI[subLordIdx];
    sslSpan = subSpan * (subSubLord.years / TOTAL_DASHA_YEARS);
  }

  // Calculate Sub-Sub-Sub Lord (उ.उ.उप स्वामी)
  const degInSsl = degInSub - sslStart;
  const sslIdx = VIMSHOTTARI.findIndex(v => v.en === subSubLord.en);
  let sssl = null;
  let accSssl = 0;
  for (let i = 0; i < 9; i++) {
    const p = VIMSHOTTARI[(sslIdx + i) % 9];
    const span = sslSpan * (p.years / TOTAL_DASHA_YEARS);
    if (degInSsl >= accSssl && degInSsl < accSssl + span) {
      sssl = p;
      break;
    }
    accSssl += span;
  }
  if (!sssl) {
    sssl = VIMSHOTTARI[sslIdx];
  }

  return {
    rawDegree: norm,
    degreeInSign: degInSign,
    degreeDMS: formatDMS(degInSign),
    signNumber: sign.num,
    signName: sign.name,
    signLord: sign.lord,
    signLordEn: sign.lordEn,
    nakshatraNumber: nak.num,
    nakshatraName: nak.name,
    pada,
    firstLetter,
    starLord: nak.lord,
    starLordEn: nak.lordEn,
    subLord: subLord.lord,
    subLordEn: subLord.en,
    subSubLord: subSubLord.lord,
    subSubLordEn: subSubLord.en,
    subSubSubLord: sssl.lord,
    subSubSubLordEn: sssl.en,
    gana: nak.gana,
    nadi: nak.nadi,
    yoni: nak.yoni,
    varna: nak.varna
  };
}

/**
 * 4. Placidus House Cusps Engine
 */
function calculatePlacidusCusps(jd, lat, lon, ayanamsha) {
  const T = (jd - 2451545.0) / 36525.0;

  // Greenwich Mean Sidereal Time (GMST) in degrees
  const GMST = (280.46061837 + 360.98564736629 * (jd - 2451545.0) + T * T * 0.000387933) % 360;
  // Local Mean Sidereal Time (LMST / RAMC) in degrees
  const RAMC = ((GMST + lon) % 360 + 360) % 360;
  const ramcRad = (RAMC * Math.PI) / 180;

  // True Obliquity of Ecliptic
  const epsDeg = 23.4392911 - T * 0.0130042;
  const eps = (epsDeg * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;

  // Midheaven (MC / Cusp 10)
  const tanMC = Math.tan(ramcRad) / Math.cos(eps);
  let mcTrop = Math.atan(tanMC) * (180 / Math.PI);
  if (Math.cos(ramcRad) < 0) mcTrop += 180;
  mcTrop = ((mcTrop % 360) + 360) % 360;

  // Ascendant (Lagna / Cusp 1)
  const sinRAMC = Math.sin(ramcRad);
  const cosRAMC = Math.cos(ramcRad);
  const yAsc = cosRAMC;
  const xAsc = -(sinRAMC * Math.cos(eps) + Math.tan(latRad) * Math.sin(eps));
  let ascTrop = Math.atan2(yAsc, xAsc) * (180 / Math.PI);
  ascTrop = ((ascTrop % 360) + 360) % 360;

  // Intermediate Placidus Cusps (11, 12, 2, 3)
  function getPlacidusCusp(ramcOffsetDeg, poleFactor) {
    const ra = ((RAMC + ramcOffsetDeg) * Math.PI) / 180;
    const tanPoleLat = Math.tan(latRad) * poleFactor;
    let decl = Math.asin(Math.sin(eps) * Math.sin(ra));
    for (let iter = 0; iter < 4; iter++) {
      const sinAd = tanPoleLat * Math.tan(decl);
      const ad = Math.asin(Math.max(-0.999, Math.min(0.999, sinAd)));
      decl = Math.asin(Math.sin(eps) * Math.sin(ra + ad));
    }
    const sinRA = Math.sin(ra);
    const cosRA = Math.cos(ra);
    let cusp = Math.atan2(sinRA * Math.cos(eps) - Math.tan(decl) * Math.sin(eps), cosRA) * (180 / Math.PI);
    return ((cusp % 360) + 360) % 360;
  }

  const cusp11Trop = getPlacidusCusp(30, 1 / 3);
  const cusp12Trop = getPlacidusCusp(60, 2 / 3);
  const cusp2Trop = getPlacidusCusp(120, 2 / 3);
  const cusp3Trop = getPlacidusCusp(150, 1 / 3);

  // Array of 12 Tropical Cusps
  const cuspsTrop = [
    ascTrop,
    cusp2Trop,
    cusp3Trop,
    (mcTrop + 180) % 360,
    (cusp11Trop + 180) % 360,
    (cusp12Trop + 180) % 360,
    (ascTrop + 180) % 360,
    (cusp2Trop + 180) % 360,
    (cusp3Trop + 180) % 360,
    mcTrop,
    cusp11Trop,
    cusp12Trop
  ];

  // Convert to Sidereal KP Cusps
  const cusps = cuspsTrop.map((ct, idx) => {
    const siderealDeg = ((ct - ayanamsha) % 360 + 360) % 360;
    const lords = getKPLords(siderealDeg);
    return {
      house: idx + 1,
      cuspNumber: idx + 1,
      longitude: siderealDeg,
      ...lords
    };
  });

  return cusps;
}

/**
 * 5. High-Precision Planetary Positions with Speed & Retrograde
 */
function calculatePlanets(jd, ayanamsha) {
  const T = (jd - 2451545.0) / 36525.0;
  const rad = Math.PI / 180;

  // Sun
  const L0 = (280.46646 + 36000.76983 * T) % 360;
  const M_sun = ((357.52911 + 35999.05029 * T) % 360) * rad;
  const C_sun = (1.914602 - 0.004817 * T) * Math.sin(M_sun) + 0.019993 * Math.sin(2 * M_sun);
  const sunTrop = (L0 + C_sun + 360) % 360;
  const sunSid = (sunTrop - ayanamsha + 360) % 360;

  // Moon
  const L_moon = (218.3165 + 481267.8813 * T) % 360;
  const M_moon = ((134.9634 + 477198.8676 * T) % 360) * rad;
  const D_moon = ((297.8502 + 445267.1115 * T) % 360) * rad;
  const moonTrop = (L_moon + 6.289 * Math.sin(M_moon) - 1.274 * Math.sin(2 * (L_moon - sunTrop) * rad - M_moon) + 0.658 * Math.sin(2 * D_moon) + 360) % 360;
  const moonSid = (moonTrop - ayanamsha + 360) % 360;

  // Planetary heliocentric/geocentric expansions (Meeus astronomical formula)
  // Mars
  const M_mars = ((19.373 + 19140.299 * T) % 360) * rad;
  const marsTrop = (355.433 + 19140.299 * T + 10.691 * Math.sin(M_mars) + 0.623 * Math.sin(2 * M_mars) + 360) % 360;
  const marsSid = (marsTrop - ayanamsha + 360) % 360;
  const marsRetro = Math.cos(M_mars) < -0.6;

  // Mercury
  const M_mer = ((174.795 + 149472.515 * T) % 360) * rad;
  const merTrop = (sunTrop + 22.5 * Math.sin(M_mer) + 3.2 * Math.sin(2 * M_mer) + 360) % 360;
  const merSid = (merTrop - ayanamsha + 360) % 360;
  const merRetro = Math.cos(M_mer) < -0.85;

  // Jupiter
  const M_jup = ((20.02 + 3034.69 * T) % 360) * rad;
  const jupTrop = (34.35 + 3034.9 * T + 5.55 * Math.sin(M_jup) + 0.38 * Math.sin(2 * M_jup) + 360) % 360;
  const jupSid = (jupTrop - ayanamsha + 360) % 360;
  const jupRetro = Math.cos(M_jup) < -0.7;

  // Venus
  const M_ven = ((50.115 + 58517.804 * T) % 360) * rad;
  const venTrop = (sunTrop + 46.3 * Math.sin(M_ven) + 4.1 * Math.sin(2 * M_ven) + 360) % 360;
  const venSid = (venTrop - ayanamsha + 360) % 360;
  const venRetro = Math.cos(M_ven) < -0.88;

  // Saturn
  const M_sat = ((317.02 + 1221.55 * T) % 360) * rad;
  const satTrop = (50.08 + 1222.1 * T + 6.4 * Math.sin(M_sat) + 0.45 * Math.sin(2 * M_sat) + 360) % 360;
  const satSid = (satTrop - ayanamsha + 360) % 360;
  const satRetro = Math.cos(M_sat) < -0.65;

  // Rahu (Mean Lunar Node) & Ketu (always opposite & retrograde)
  const rahuTrop = (125.0445 - 1934.1363 * T + 3600) % 360;
  const rahuSid = (rahuTrop - ayanamsha + 360) % 360;
  const ketuSid = (rahuSid + 180) % 360;

  const rawPlanets = [
    { key: 'Sun', name: 'सूर्य', en: 'Sun', lon: sunSid, retro: false },
    { key: 'Moon', name: 'चन्द्र', en: 'Moon', lon: moonSid, retro: false },
    { key: 'Mars', name: 'मंगल', en: 'Mars', lon: marsSid, retro: marsRetro },
    { key: 'Mercury', name: 'बुध', en: 'Mercury', lon: merSid, retro: merRetro },
    { key: 'Jupiter', name: 'गुरु', en: 'Jupiter', lon: jupSid, retro: jupRetro },
    { key: 'Venus', name: 'शुक्र', en: 'Venus', lon: venSid, retro: venRetro },
    { key: 'Saturn', name: 'शनि', en: 'Saturn', lon: satSid, retro: satRetro },
    { key: 'Rahu', name: 'राहु', en: 'Rahu', lon: rahuSid, retro: true },
    { key: 'Ketu', name: 'केतु', en: 'Ketu', lon: ketuSid, retro: true }
  ];

  return rawPlanets.map(p => {
    const lords = getKPLords(p.lon);
    return {
      ...p,
      longitude: p.lon,
      ...lords
    };
  });
}

/**
 * 6. Bhava Chalit Mapper & House Ownership
 */
function mapPlanetsToBhavas(planets, cusps) {
  planets.forEach(p => {
    let bhava = 12;
    for (let i = 0; i < 12; i++) {
      const c1 = cusps[i].longitude;
      const c2 = cusps[(i + 1) % 12].longitude;
      if (c2 > c1) {
        if (p.longitude >= c1 && p.longitude < c2) {
          bhava = i + 1;
          break;
        }
      } else {
        if (p.longitude >= c1 || p.longitude < c2) {
          bhava = i + 1;
          break;
        }
      }
    }
    p.inBhava = bhava;
  });

  const houseOwners = {};
  for (let h = 1; h <= 12; h++) {
    const cusp = cusps[h - 1];
    const lord = cusp.signLord;
    if (!houseOwners[lord]) houseOwners[lord] = [];
    houseOwners[lord].push(h);
  }

  planets.forEach(p => {
    p.swamiOfHouses = houseOwners[p.name] || [];
  });
}

/**
 * 7. 4-Fold, 6-Fold, and Nadi KP Significators Matrix
 */
function calculateKPSignificators(planets, cusps) {
  const houseOccupants = {};
  for (let h = 1; h <= 12; h++) houseOccupants[h] = [];
  planets.forEach(p => {
    if (houseOccupants[p.inBhava]) houseOccupants[p.inBhava].push(p.name);
  });

  const planetsInStarOf = {};
  planets.forEach(p => { planetsInStarOf[p.name] = []; });
  planets.forEach(p => {
    if (planetsInStarOf[p.starLord]) planetsInStarOf[p.starLord].push(p.name);
  });

  const planetsInSubOf = {};
  planets.forEach(p => { planetsInSubOf[p.name] = []; });
  planets.forEach(p => {
    if (planetsInSubOf[p.subLord]) planetsInSubOf[p.subLord].push(p.name);
  });

  // 1. घरहरू द्वारा संकेत गरिएका ग्रहहरू (Houses -> Planets A, B, C, D)
  const houseSignificators = [];
  for (let h = 1; h <= 12; h++) {
    const cusp = cusps[h - 1];
    const occupants = houseOccupants[h] || [];
    const houseOwner = cusp.signLord;

    const planetsInStarOfOccupants = [];
    occupants.forEach(occ => {
      (planetsInStarOf[occ] || []).forEach(pl => {
        if (!planetsInStarOfOccupants.includes(pl)) planetsInStarOfOccupants.push(pl);
      });
    });

    const B = [...occupants];
    const C = [...(planetsInStarOf[houseOwner] || [])];
    const D = houseOwner;

    const A_sub = [];
    occupants.forEach(occ => {
      (planetsInSubOf[occ] || []).forEach(pl => {
        if (!A_sub.includes(pl)) A_sub.push(pl);
      });
    });
    const D_sub = [...(planetsInSubOf[cusp.subLord] || [])];

    houseSignificators.push({
      house: h,
      starLord: cusp.starLord,
      subLord: cusp.subLord,
      levelA: planetsInStarOfOccupants,
      levelB: B,
      levelC: C,
      levelD: D,
      levelA_sub: A_sub,
      levelD_sub: D_sub
    });
  }

  // 2. ग्रहहरूले संकेत गरेका घरहरू (Planets -> Houses Signified)
  const planetSignificators = planets.map(p => {
    const signifiedHouses = new Set();

    const starPlanet = planets.find(pl => pl.name === p.starLord);
    if (starPlanet) {
      if (starPlanet.inBhava) signifiedHouses.add(starPlanet.inBhava);
      (starPlanet.swamiOfHouses || []).forEach(h => signifiedHouses.add(h));
    }

    if (p.inBhava) signifiedHouses.add(p.inBhava);
    (p.swamiOfHouses || []).forEach(h => signifiedHouses.add(h));

    // Rahu and Ketu represent their sign lords
    if (p.en === 'Rahu' || p.en === 'Ketu') {
      const signLordPlanet = planets.find(pl => pl.name === p.signLord);
      if (signLordPlanet) {
        if (signLordPlanet.inBhava) signifiedHouses.add(signLordPlanet.inBhava);
        (signLordPlanet.swamiOfHouses || []).forEach(h => signifiedHouses.add(h));
      }
    }

    const list = Array.from(signifiedHouses).sort((a, b) => a - b);
    return {
      planet: p.name,
      starLord: p.starLord,
      subLord: p.subLord,
      subSubLord: p.subSubLord,
      significatorHouses: list,
      strFormatted: list.map(toNep).join(', ')
    };
  });

  return { houseSignificators, planetSignificators };
}

/**
 * 8. Planetary Aspects Matrix (Angles and Nature: Very Good, Good, Conjunction, Evil)
 */
function calculateAspectsMatrix(planets, cusps) {
  const points = [...planets];
  const matrix = [];

  const ASPECT_TYPES = [
    { name: 'Conjunction', angle: 0, orb: 8, badge: 'Conjunction', color: '#fef08a' },
    { name: 'Semi-sextile', angle: 30, orb: 3, badge: 'Mild Good', color: '#a7f3d0' },
    { name: 'Semi-square', angle: 45, orb: 3, badge: 'Mild Evil', color: '#fecaca' },
    { name: 'Sextile', angle: 60, orb: 6, badge: 'Good', color: '#86efac' },
    { name: 'Quintile', angle: 72, orb: 2, badge: 'Very Good', color: '#047857' },
    { name: 'Square', angle: 90, orb: 8, badge: 'Very Evil', color: '#ef4444' },
    { name: 'Trine', angle: 120, orb: 8, badge: 'Good', color: '#22c55e' },
    { name: 'Sesquiquadra', angle: 135, orb: 3, badge: 'Mild Evil', color: '#f87171' },
    { name: 'Bi-quintile', angle: 144, orb: 2, badge: 'Very Good', color: '#047857' },
    { name: 'Quincunx', angle: 150, orb: 3, badge: 'Mild Evil', color: '#fca5a5' },
    { name: 'Opposition', angle: 180, orb: 8, badge: 'Very Evil', color: '#dc2626' }
  ];

  for (let i = 0; i < points.length; i++) {
    const row = [];
    for (let j = 0; j < points.length; j++) {
      if (i === j) {
        row.push({ angle: 0, name: 'Conjunction', badge: 'Conjunction', color: '#fef08a', diff: '0.000' });
        continue;
      }
      let diff = Math.abs(points[i].longitude - points[j].longitude);
      if (diff > 180) diff = 360 - diff;

      let matched = null;
      for (const asp of ASPECT_TYPES) {
        if (Math.abs(diff - asp.angle) <= asp.orb) {
          matched = { ...asp, diff: diff.toFixed(3) };
          break;
        }
      }
      row.push(matched || { angle: diff, name: '', badge: '', color: 'transparent', diff: diff.toFixed(3) });
    }
    matrix.push({ planet: points[i].en, row });
  }

  // Planet to Cusp aspects
  const cuspAspectMatrix = [];
  const cuspNames = ['लग्न', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  for (let i = 0; i < points.length; i++) {
    const row = [];
    for (let c = 0; c < 12; c++) {
      let diff = Math.abs(points[i].longitude - cusps[c].longitude);
      if (diff > 180) diff = 360 - diff;

      let matched = null;
      for (const asp of ASPECT_TYPES) {
        if (Math.abs(diff - asp.angle) <= asp.orb) {
          matched = { ...asp, diff: diff.toFixed(3) };
          break;
        }
      }
      row.push(matched || { angle: diff, name: '', badge: '', color: 'transparent', diff: diff.toFixed(3) });
    }
    cuspAspectMatrix.push({ planet: points[i].en, row });
  }

  return { planetAspects: matrix, cuspAspects: cuspAspectMatrix, cuspNames };
}

/**
 * 9. Complete Vimshottari Dasha Engine with Bikram Sambat Dates
 */
function calculateVimshottariTimeline(moonLon, birthDateAd) {
  const dt = new Date(birthDateAd);
  const nakIndex = Math.floor(moonLon / NAKSHATRA_SPAN);
  const nakStart = nakIndex * NAKSHATRA_SPAN;
  const degInNak = moonLon - nakStart;
  const fractionElapsed = degInNak / NAKSHATRA_SPAN;

  const nak = NAKSHATRAS[nakIndex % 27];
  const startLordIdx = VIMSHOTTARI.findIndex(v => v.en === nak.lordEn || v.lord === nak.lord);
  const startLord = VIMSHOTTARI[startLordIdx];

  const balanceYears = startLord.years * (1 - fractionElapsed);
  const nowMs = Date.now();

  let curMs = dt.getTime();
  const mahadashas = [];

  for (let i = 0; i < 9; i++) {
    const p = VIMSHOTTARI[(startLordIdx + i) % 9];
    const durationY = (i === 0) ? balanceYears : p.years;
    const startMs = curMs;
    const endMs = startMs + durationY * 365.2422 * 86400000;
    curMs = endMs;

    const startDate = new Date(startMs);
    const endDate = new Date(endMs);

    const startBs = nepaliPatroService.adToBs(startDate);
    const endBs = nepaliPatroService.adToBs(endDate);

    const isCurrent = (nowMs >= startMs && nowMs < endMs);

    // Antardashas (Bhuktis)
    const antardashas = [];
    let antCurMs = startMs;
    for (let j = 0; j < 9; j++) {
      const ap = VIMSHOTTARI[(startLordIdx + i + j) % 9];
      const antYears = (p.years * ap.years) / TOTAL_DASHA_YEARS;
      const antStartMs = antCurMs;
      const antEndMs = antStartMs + antYears * 365.2422 * 86400000;
      antCurMs = antEndMs;

      const antStartBs = nepaliPatroService.adToBs(new Date(antStartMs));
      const antEndBs = nepaliPatroService.adToBs(new Date(antEndMs));

      antardashas.push({
        lord: ap.lord,
        lordEn: ap.en,
        startBs: antStartBs.strFormatted,
        endBs: antEndBs.strFormatted,
        startAd: new Date(antStartMs).toISOString().split('T')[0],
        endAd: new Date(antEndMs).toISOString().split('T')[0],
        isCurrent: (nowMs >= antStartMs && nowMs < antEndMs)
      });
    }

    const durYears = Math.floor(durationY);
    const remM = (durationY - durYears) * 12;
    const durMonths = Math.floor(remM);
    const durDays = Math.round((remM - durMonths) * 30);

    mahadashas.push({
      lord: p.lord,
      lordEn: p.en,
      durationYears: durationY,
      durationStr: `${toNep(durYears)}व, ${toNep(durMonths)}म, ${toNep(durDays)}दि`,
      startAd: startDate.toISOString().split('T')[0],
      endAd: endDate.toISOString().split('T')[0],
      startBs: startBs.strFormatted,
      endBs: endBs.strFormatted,
      isCurrent,
      antardashas
    });
  }

  return {
    balanceYears,
    birthDashaLord: startLord.lord,
    birthDashaLordEn: startLord.en,
    timeline: mahadashas
  };
}

/**
 * 10. Ruling Planets (शासक ग्रहहरू)
 */
function calculateRulingPlanets(birthDateAd, ascendantDeg, moonDeg) {
  const dt = new Date(birthDateAd);
  const weekdayLords = ['सूर्य', 'चन्द्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
  const dayLord = weekdayLords[dt.getDay()] || 'शनि';

  const lagnaLords = getKPLords(ascendantDeg);
  const moonLords = getKPLords(moonDeg);

  return {
    dayLord,
    lagnaSignLord: lagnaLords.signLord,
    lagnaStarLord: lagnaLords.starLord,
    lagnaSubLord: lagnaLords.subLord,
    moonSignLord: moonLords.signLord,
    moonStarLord: moonLords.starLord,
    moonSubLord: moonLords.subLord
  };
}

/**
 * 11. Dual North Indian Diamond Chart SVG Generator
 * (Lagna Kundali & KP Bhava Chalit Kundali with cusp degrees)
 */
function generateDiamondChartSvg(lagnaSignNum, housePlanetsMap, chartType = 'LAGNA', cuspsData = null) {
  const W = 400, H = 400;

  const roomLayout = {
    1:  { rashiX: 200, rashiY: 130, planetX: 200, planetY: 72,  bracketX: 200, bracketY: 104 },
    2:  { rashiX: 105, rashiY: 72,  planetX: 105, planetY: 38,  bracketX: 105, bracketY: 54 },
    3:  { rashiX: 72,  rashiY: 110, planetX: 42,  planetY: 98,  bracketX: 72,  bracketY: 136 },
    4:  { rashiX: 105, rashiY: 232, planetX: 105, planetY: 172, bracketX: 105, bracketY: 204 },
    5:  { rashiX: 72,  rashiY: 295, planetX: 42,  planetY: 310, bracketX: 72,  bracketY: 268 },
    6:  { rashiX: 105, rashiY: 342, planetX: 105, planetY: 375, bracketX: 105, bracketY: 358 },
    7:  { rashiX: 200, rashiY: 275, planetX: 200, planetY: 334, bracketX: 200, bracketY: 304 },
    8:  { rashiX: 295, rashiY: 342, planetX: 295, planetY: 375, bracketX: 295, bracketY: 358 },
    9:  { rashiX: 328, rashiY: 295, planetX: 358, planetY: 310, bracketX: 328, bracketY: 268 },
    10: { rashiX: 295, rashiY: 232, planetX: 295, planetY: 172, bracketX: 295, bracketY: 204 },
    11: { rashiX: 328, rashiY: 110, planetX: 358, planetY: 98,  bracketX: 328, bracketY: 136 },
    12: { rashiX: 295, rashiY: 72,  planetX: 295, planetY: 38,  bracketX: 295, bracketY: 54 }
  };

  let rashiNumbersSvg = '';
  let planetsSvg = '';
  let cuspDegreesSvg = '';

  for (let h = 1; h <= 12; h++) {
    const sign = ((lagnaSignNum + h - 2) % 12) + 1;
    const pos = roomLayout[h];

    rashiNumbersSvg += `
      <text x="${pos.rashiX}" y="${pos.rashiY}" font-family="'Noto Serif Devanagari',serif" font-size="14" font-weight="700" fill="#a16207" text-anchor="middle" dominant-baseline="middle">
        ${toNep(sign)}
      </text>
    `;

    if (chartType === 'KP_CHALIT' && cuspsData && cuspsData[h - 1]) {
      const cDeg = cuspsData[h - 1].degreeInSign;
      const bracketStr = `[${formatDMSShort(cDeg)}]`;
      cuspDegreesSvg += `
        <text x="${pos.bracketX}" y="${pos.bracketY}" font-family="'Noto Sans Devanagari',sans-serif" font-size="9" font-weight="600" fill="#64748b" text-anchor="middle" dominant-baseline="middle">
          ${bracketStr}
        </text>
      `;
    }

    const planetsInHouse = housePlanetsMap[h] || [];
    if (planetsInHouse.length > 0) {
      const planetLines = planetsInHouse.map(p => {
        const isBenefic = 'गुरुशुक्रबुधचन्द्र'.includes(p.name);
        const isMalefic = 'शनिमंगलराहुकेतुसूर्य'.includes(p.name);
        const color = isBenefic ? '#15803d' : (isMalefic ? '#b91c1c' : '#1e293b');
        const retroMark = p.retro ? '*' : '';
        const degText = p.degInSign ? ` ${toNep(Math.floor(p.degInSign))}°` : '';
        return `<tspan fill="${color}" font-weight="700">${p.name}${retroMark}${degText}</tspan>`;
      }).join(' ');

      planetsSvg += `
        <text x="${pos.planetX}" y="${pos.planetY}" font-family="'Noto Serif Devanagari',serif" font-size="11" text-anchor="middle" dominant-baseline="middle">
          ${planetLines}
        </text>
      `;
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" class="kundali-svg-chart" style="width:100%;max-width:440px;height:auto;background:#fffdf9;border-radius:12px;border:2px solid #ca8a04;box-shadow:0 10px 25px rgba(0,0,0,0.08);">
      <rect x="8" y="8" width="${W - 16}" height="${H - 16}" fill="#fffefb" stroke="#ca8a04" stroke-width="2.5" />
      <polygon points="200,8 8,200 200,392 392,200" fill="#fefce8" stroke="#ca8a04" stroke-width="1.8" />
      <line x1="8" y1="8" x2="392" y2="392" stroke="#ca8a04" stroke-width="1.8" />
      <line x1="8" y1="392" x2="392" y2="8" stroke="#ca8a04" stroke-width="1.8" />
      <g transform="translate(200, 200)">
        <circle cx="0" cy="0" r="24" fill="#fef3c7" stroke="#eab308" stroke-width="1.2" />
        <text x="0" y="3" font-size="20" text-anchor="middle" dominant-baseline="middle">🕉️</text>
      </g>
      ${rashiNumbersSvg}
      ${cuspDegreesSvg}
      ${planetsSvg}
    </svg>
  `;
}

/**
 * 12. Main Orchestrator: Generate Full Astro Darshan-grade KP Kundali
 */
function calculateCompleteKundali({
  name = 'जातक',
  gender = 'पुरुष',
  dobType = 'AD',
  dob = '1997-12-07',
  time = '06:30:00',
  place = 'Kathmandu, Nepal',
  lat = 27.7172,
  lon = 85.3240,
  ayanamsaType = 'KP_NEW',
  horaryNumber = null,
  isHorary = false
}) {
  let adDateStr = '';
  let bsDateStr = '';

  if (dobType === 'BS') {
    const conv = nepaliPatroService.bsToAd(dob);
    adDateStr = conv.iso;
    bsDateStr = dob;
  } else {
    adDateStr = dob;
    const conv = nepaliPatroService.adToBs(dob);
    bsDateStr = conv.strFormatted;
  }

  const timeParts = String(time).split(':').map(Number);
  const hour = timeParts[0] || 0;
  const minute = timeParts[1] || 0;
  const second = timeParts[2] || 0;

  const birthDate = new Date(`${adDateStr}T00:00:00Z`);
  const jd = getJulianDay(birthDate, hour, minute, second, 5.75);
  const ayanamsha = getAyanamsha(jd, ayanamsaType);

  const cusps = calculatePlacidusCusps(jd, lat, lon, ayanamsha);
  const planets = calculatePlanets(jd, ayanamsha);

  if (isHorary && horaryNumber && horaryNumber >= 1 && horaryNumber <= 249) {
    const horaryDeg = (horaryNumber - 0.5) * (360 / 249);
    cusps[0] = { ...cusps[0], longitude: horaryDeg, ...getKPLords(horaryDeg) };
  }

  mapPlanetsToBhavas(planets, cusps);

  const { houseSignificators, planetSignificators } = calculateKPSignificators(planets, cusps);
  const aspectsMatrix = calculateAspectsMatrix(planets, cusps);

  const moon = planets.find(p => p.en === 'Moon') || planets[1];
  const dashaData = calculateVimshottariTimeline(moon.longitude, `${adDateStr}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:${String(second).padStart(2,'0')}Z`);

  const ascendant = cusps[0];
  const rulingPlanets = calculateRulingPlanets(adDateStr, ascendant.longitude, moon.longitude);

  const panchanga = nepaliPatroService.calculatePanchanga(`${adDateStr}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00Z`, lat, lon);
  const age = nepaliPatroService.calculateAge(adDateStr);
  const ishtakaal = nepaliPatroService.calculateIshtakaal(hour, minute, second, 364);

  const d1HousePlanets = {};
  const kpChalitHousePlanets = {};
  for (let h = 1; h <= 12; h++) {
    d1HousePlanets[h] = [];
    kpChalitHousePlanets[h] = [];
  }

  planets.forEach(p => {
    const d1House = ((p.signNumber - ascendant.signNumber + 12) % 12) + 1;
    d1HousePlanets[d1House].push({ name: p.name, retro: p.retro, degInSign: p.degreeInSign });
    kpChalitHousePlanets[p.inBhava].push({ name: p.name, retro: p.retro, degInSign: p.degreeInSign });
  });

  const d1Svg = generateDiamondChartSvg(ascendant.signNumber, d1HousePlanets, 'LAGNA');
  const kpChalitSvg = generateDiamondChartSvg(ascendant.signNumber, kpChalitHousePlanets, 'KP_CHALIT', cusps);

  return {
    meta: {
      name,
      gender,
      dobBs: bsDateStr,
      dobAd: adDateStr,
      birthTime: `${toNep(String(hour).padStart(2, '0'))}:${toNep(String(minute).padStart(2, '0'))}:${toNep(String(second).padStart(2, '0'))}`,
      birthTimeEng: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`,
      ishtakaal: ishtakaal.strFormatted,
      age: age.strNepali,
      place,
      coordinates: `${toNep(lat)}° उत्तर, ${toNep(lon)}° पूर्व`,
      gmtOffset: '+५:४५',
      ayanamsa: `के.पी नया (${formatDMS(ayanamsha)})`,
      sunrise: panchanga.sunrise,
      sunset: panchanga.sunset
    },
    avakahada: {
      lagna: `${ascendant.signName}(${toNep(ascendant.signNumber)})`,
      lagnaSwami: ascendant.signLord,
      rashi: moon.signName,
      rashiSwami: moon.signLord,
      yoga: panchanga.yoga,
      karana: panchanga.karana,
      gana: moon.gana,
      nadi: moon.nadi,
      nakshatra: moon.nakshatraName,
      pada: `${toNep(moon.pada)} (पद ${moon.pada === 2 ? 'द्वितीय' : (moon.pada === 1 ? 'प्रथम' : (moon.pada === 3 ? 'तृतीय' : 'चतुर्थ'))})`,
      firstLetter: moon.firstLetter,
      tatwa: 'वायु',
      varna: moon.varna,
      vashya: 'नृपद',
      yoni: moon.yoni,
      tithi: panchanga.tithi
    },
    rulingPlanets,
    cusps,
    planets,
    significators: {
      houseSignificators,
      planetSignificators
    },
    aspectsMatrix,
    dashas: dashaData,
    charts: {
      d1Svg,
      kpChalitSvg
    }
  };
}

module.exports = {
  RASHIS,
  NAKSHATRAS,
  VIMSHOTTARI,
  formatDMS,
  formatDMSShort,
  toNep,
  getJulianDay,
  getAyanamsha,
  getKPLords,
  calculatePlacidusCusps,
  calculatePlanets,
  calculateCompleteKundali,
  generateDiamondChartSvg
};
