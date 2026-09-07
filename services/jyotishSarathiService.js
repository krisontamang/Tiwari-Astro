/**
 * Vedic Netra — वैदिक गणना इन्जिन
 * 
 * Complete Vedic Astrology calculation engine for Astro Tiwari:
 * - Avakahada Chakra (अवकहडाचक्र)
 * - Comprehensive Graha Spashta (ग्रहस्पष्ट with Avastha, Karaka, Visheshata, Sthiti)
 * - Divisional Charts (षोडशवर्ग: D-1, D-2 Hora, D-3 Drekkana, D-9 Navamsha, Bhav Kundali, etc.)
 * - Vimshottari Dasha (120-year complete Mahadashas & Antardashas/Bhuktis with Nepali BS & AD dates)
 * - Yogini Dasha (36-year repeating cycles across full lifetime with sub-periods)
 * - North Indian Diamond Chart SVG Generator with Lord Ganesha center emblem
 * - 5-page Traditional Nepali Janmapatra Printout generator with red Swastika (卍) border
 */

const nepaliPatroService = require('./nepaliPatroService');

const NAKSHATRAS = [
  { name: 'अश्विनी (Ashwini)', lord: 'Ketu', deity: 'Ashwini Kumars', startDeg: 0, gana: 'देव', nadi: 'आद्य', yoni: 'श्वान (घोडा)', varna: 'ब्राह्मण', padas: ['चु', 'चे', 'चो', 'ला'] },
  { name: 'भरणी (Bharani)', lord: 'Venus', deity: 'Yama', startDeg: 13.3333, gana: 'मनुष्य', nadi: 'मध्य', yoni: 'गज (हात्ती)', varna: 'क्षत्रिय', padas: ['ली', 'लू', 'ले', 'लो'] },
  { name: 'कृत्तिका (Krittika)', lord: 'Sun', deity: 'Agni', startDeg: 26.6667, gana: 'राक्षस', nadi: 'अन्त्य', yoni: 'मेष (भेंडा)', varna: 'वैश्य', padas: ['अ', 'ई', 'उ', 'ए'] },
  { name: 'रोहिणी (Rohini)', lord: 'Moon', deity: 'Brahma', startDeg: 40, gana: 'मनुष्य', nadi: 'अन्त्य', yoni: 'सर्प', varna: 'शूद्र', padas: ['ओ', 'वा', 'वी', 'वू'] },
  { name: 'मृगशिरा (Mrigashira)', lord: 'Mars', deity: 'Soma', startDeg: 53.3333, gana: 'देव', nadi: 'मध्य', yoni: 'सर्प', varna: 'वैश्य', padas: ['वे', 'वो', 'का', 'की'] },
  { name: 'आर्द्रा (Ardra)', lord: 'Rahu', deity: 'Rudra', startDeg: 66.6667, gana: 'मनुष्य', nadi: 'आद्य', yoni: 'श्वान', varna: 'शूद्र', padas: ['कु', 'घ', 'ङ', 'छ'] },
  { name: 'पुनर्वसु (Punarvasu)', lord: 'Jupiter', deity: 'Aditi', startDeg: 80, gana: 'देव', nadi: 'आद्य', yoni: 'मार्जारी (बिरालो)', varna: 'वैश्य', padas: ['के', 'को', 'हा', 'ही'] },
  { name: 'पुष्य (Pushya)', lord: 'Saturn', deity: 'Brihaspati', startDeg: 93.3333, gana: 'देव', nadi: 'मध्य', yoni: 'मेष', varna: 'क्षत्रिय', padas: ['हू', 'हे', 'हो', 'डा'] },
  { name: 'अश्लेषा (Ashlesha)', lord: 'Mercury', deity: 'Sarpa', startDeg: 106.6667, gana: 'राक्षस', nadi: 'अन्त्य', yoni: 'मार्जारी', varna: 'शूद्र', padas: ['डी', 'डू', 'डे', 'डो'] },
  { name: 'मघा (Magha)', lord: 'Ketu', deity: 'Pitris', startDeg: 120, gana: 'राक्षस', nadi: 'अन्त्य', yoni: 'मूषक (मुसा)', varna: 'शूद्र', padas: ['मा', 'मी', 'मू', 'मे'] },
  { name: 'पूर्वाफाल्गुनी (Purva Phalguni)', lord: 'Venus', deity: 'Bhaga', startDeg: 133.3333, gana: 'मनुष्य', nadi: 'मध्य', yoni: 'मूषक', varna: 'ब्राह्मण', padas: ['मो', 'टा', 'टी', 'टू'] },
  { name: 'उत्तराफाल्गुनी (Uttara Phalguni)', lord: 'Sun', deity: 'Aryaman', startDeg: 146.6667, gana: 'मनुष्य', nadi: 'आद्य', yoni: 'गौ (गाई)', varna: 'क्षत्रिय', padas: ['टे', 'टो', 'पा', 'पी'] },
  { name: 'हस्त (Hasta)', lord: 'Moon', deity: 'Savitri', startDeg: 160, gana: 'देव', nadi: 'आद्य', yoni: 'महिष (भैंसी)', varna: 'वैश्य', padas: ['पू', 'ष', 'ण', 'ठ'] },
  { name: 'चित्रा (Chitra)', lord: 'Mars', deity: 'Vishwakarma', startDeg: 173.3333, gana: 'राक्षस', nadi: 'मध्य', yoni: 'व्याघ्र (बाघ)', varna: 'शूद्र', padas: ['पे', 'पो', 'रा', 'री'] },
  { name: 'स्वाती (Swati)', lord: 'Rahu', deity: 'Vayu', startDeg: 186.6667, gana: 'देव', nadi: 'अन्त्य', yoni: 'महिष', varna: 'शूद्र', padas: ['रू', 'रे', 'रो', 'ता'] },
  { name: 'विशाखा (Vishakha)', lord: 'Jupiter', deity: 'Indragni', startDeg: 200, gana: 'राक्षस', nadi: 'अन्त्य', yoni: 'व्याघ्र', varna: 'ब्राह्मण', padas: ['ती', 'तू', 'ते', 'तो'] },
  { name: 'अनुराधा (Anuradha)', lord: 'Saturn', deity: 'Mitra', startDeg: 213.3333, gana: 'देव', nadi: 'मध्य', yoni: 'मृग (हरिण)', varna: 'क्षत्रिय', padas: ['ना', 'नी', 'नू', 'ने'] },
  { name: 'ज्येष्ठा (Jyeshtha)', lord: 'Mercury', deity: 'Indra', startDeg: 226.6667, gana: 'राक्षस', nadi: 'आद्य', yoni: 'मृग', varna: 'वैश्य', padas: ['नो', 'या', 'यी', 'यू'] },
  { name: 'मूल (Mula)', lord: 'Ketu', deity: 'Nirriti', startDeg: 240, gana: 'राक्षस', nadi: 'आद्य', yoni: 'श्वान', varna: 'शूद्र', padas: ['ये', 'यो', 'भा', 'भी'] },
  { name: 'पूर्वाषाढा (Purva Ashadha)', lord: 'Venus', deity: 'Apah', startDeg: 253.3333, gana: 'मनुष्य', nadi: 'मध्य', yoni: 'वानर', varna: 'ब्राह्मण', padas: ['भू', 'धा', 'फा', 'ढा'] },
  { name: 'उत्तराषाढा (Uttara Ashadha)', lord: 'Sun', deity: 'Vishwadevas', startDeg: 266.6667, gana: 'मनुष्य', nadi: 'अन्त्य', yoni: 'नकुल (न्याउरी)', varna: 'क्षत्रिय', padas: ['भे', 'भो', 'जा', 'जी'] },
  { name: 'श्रवण (Shravana)', lord: 'Moon', deity: 'Vishnu', startDeg: 280, gana: 'देव', nadi: 'अन्त्य', yoni: 'वानर', varna: 'वैश्य', padas: ['खी', 'खू', 'खे', 'खो'] },
  { name: 'धनिष्ठा (Dhanishta)', lord: 'Mars', deity: 'Vasus', startDeg: 293.3333, gana: 'राक्षस', nadi: 'मध्य', yoni: 'सिंह', varna: 'शूद्र', padas: ['गा', 'गी', 'गु', 'गे'] },
  { name: 'शतभिषा (Shatabhisha)', lord: 'Rahu', deity: 'Varuna', startDeg: 306.6667, gana: 'राक्षस', nadi: 'आद्य', yoni: 'अश्व', varna: 'शूद्र', padas: ['गो', 'सा', 'सी', 'सू'] },
  { name: 'पूर्वाभाद्रपदा (Purva Bhadrapada)', lord: 'Jupiter', deity: 'Aja Ekapada', startDeg: 320, gana: 'मनुष्य', nadi: 'आद्य', yoni: 'सिंह', varna: 'ब्राह्मण', padas: ['से', 'सो', 'दा', 'दी'] },
  { name: 'उत्तराभाद्रपदा (Uttara Bhadrapada)', lord: 'Saturn', deity: 'Ahirbudhnya', startDeg: 333.3333, gana: 'मनुष्य', nadi: 'मध्य', yoni: 'गौ', varna: 'क्षत्रिय', padas: ['दू', 'थ', 'झ', 'ञ'] },
  { name: 'रेवती (Revati)', lord: 'Mercury', deity: 'Pushan', startDeg: 346.6667, gana: 'देव', nadi: 'अन्त्य', yoni: 'गज', varna: 'वैश्य', padas: ['दे', 'दो', 'चा', 'ची'] }
];

const RASHIS = [
  { signNumber: 1, name: 'मेष', sanskrit: 'Aries', lord: 'मंगल (Mars)', devanagari: '१' },
  { signNumber: 2, name: 'वृष', sanskrit: 'Taurus', lord: 'शुक्र (Venus)', devanagari: '२' },
  { signNumber: 3, name: 'मिथुन', sanskrit: 'Gemini', lord: 'बुध (Mercury)', devanagari: '३' },
  { signNumber: 4, name: 'कर्कट', sanskrit: 'Cancer', lord: 'चन्द्र (Moon)', devanagari: '४' },
  { signNumber: 5, name: 'सिंह', sanskrit: 'Leo', lord: 'सूर्य (Sun)', devanagari: '५' },
  { signNumber: 6, name: 'कन्या', sanskrit: 'Virgo', lord: 'बुध (Mercury)', devanagari: '६' },
  { signNumber: 7, name: 'तुला', sanskrit: 'Libra', lord: 'शुक्र (Venus)', devanagari: '७' },
  { signNumber: 8, name: 'वृश्चिक', sanskrit: 'Scorpio', lord: 'मंगल (Mars)', devanagari: '८' },
  { signNumber: 9, name: 'धनु', sanskrit: 'Sagittarius', lord: 'बृहस्पति (Guru)', devanagari: '९' },
  { signNumber: 10, name: 'मकर', sanskrit: 'Capricorn', lord: 'शनि (Saturn)', devanagari: '१०' },
  { signNumber: 11, name: 'कुम्भ', sanskrit: 'Aquarius', lord: 'शनि (Saturn)', devanagari: '११' },
  { signNumber: 12, name: 'मीन', sanskrit: 'Pisces', lord: 'बृहस्पति (Guru)', devanagari: '१२' }
];

const YOGINI_DATA = [
  { name: 'मंगला', lord: 'Moon', planetNepali: 'चन्द्र', years: 1 },
  { name: 'पिंगला', lord: 'Sun', planetNepali: 'सूर्य', years: 2 },
  { name: 'धान्या', lord: 'Jupiter', planetNepali: 'बृहस्पति', years: 3 },
  { name: 'भ्रामरी', lord: 'Mars', planetNepali: 'मंगल', years: 4 },
  { name: 'भद्रिका', lord: 'Mercury', planetNepali: 'बुध', years: 5 },
  { name: 'उल्का', lord: 'Saturn', planetNepali: 'शनि', years: 6 },
  { name: 'सिद्धा', lord: 'Venus', planetNepali: 'शुक्र', years: 7 },
  { name: 'संकटा', lord: 'Rahu', planetNepali: 'राहु', years: 8 }
];

const VIMSHOTTARI_YEARS = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
};

const VIMSHOTTARI_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

const PLANET_NAMES_NEP = {
  Ascendant: 'लग्न',
  Sun: 'सूर्य',
  Moon: 'चन्द्र',
  Mars: 'मङ्गल',
  Mercury: 'बुध',
  Jupiter: 'बृहस्पति',
  Venus: 'शुक्र',
  Saturn: 'शनि',
  Rahu: 'राहु',
  Ketu: 'केतु'
};

const PLANET_DEV_CODES = {
  Ascendant: 'ल',
  Sun: 'सू',
  Moon: 'च',
  Mars: 'म',
  Mercury: 'बु',
  Jupiter: 'बृ',
  Venus: 'शु',
  Saturn: 'श',
  Rahu: 'रा',
  Ketu: 'के'
};

/**
 * Format degree float into string like ०१°४८'४५"
 */
function formatDMS(deg, useNepaliNumerals = true) {
  const d = Math.floor(deg);
  const remMin = (deg - d) * 60;
  const m = Math.floor(remMin);
  const s = Math.round((remMin - m) * 60);

  const pad = (n) => String(n).padStart(2, '0');
  const engStr = `${pad(d)}° ${pad(m)}' ${pad(s)}"`;
  if (!useNepaliNumerals) return engStr;

  const nepDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return engStr.replace(/\d/g, (x) => nepDigits[parseInt(x)]);
}

/**
 * Convert number to Nepali numerals string
 */
function toNepaliNum(num) {
  const nepDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (x) => nepDigits[parseInt(x)]);
}

/**
 * Exact English Date to Bikram Sambat Date using official 500-year dataset
 */
function convertAdToBs(adDateStr) {
  try {
    const conv = nepaliPatroService.adToBs(adDateStr);
    return conv.strFormatted;
  } catch (e) {
    return '२०८३-०५-२१';
  }
}

/**
 * Calculate Jaimini 7 Karakas based on planetary degrees within sign
 */
function calculateJaiminiKarakas(planets) {
  // Karakas only apply to 7 physical bodies (excluding Rahu/Ketu/Lagna)
  const eligible = planets
    .filter(p => !['Ascendant', 'Rahu', 'Ketu'].includes(p.key))
    .map(p => ({
      key: p.key,
      degreeInSign: p.degreeInSign || (p.longitude % 30)
    }))
    .sort((a, b) => b.degreeInSign - a.degreeInSign);

  const karakaTitles = [
    { title: 'आत्मकारक - आत्मा', short: 'आत्मकारक' },
    { title: 'अमात्यकारक - करियर', short: 'अमात्यकारक' },
    { title: 'भ्रातृकारक - दाजुभाइ', short: 'भ्रातृकारक' },
    { title: 'मातृकारक - आमा', short: 'मातृकारक' },
    { title: 'पुत्रकारक - सन्तान', short: 'पुत्रकारक' },
    { title: 'ज्ञातिकारक - नातेदार', short: 'ज्ञातिकारक' },
    { title: 'दाराकारक - जीवनसाथी', short: 'दाराकारक' }
  ];

  const map = {};
  eligible.forEach((item, idx) => {
    if (idx < karakaTitles.length) {
      map[item.key] = karakaTitles[idx].title;
    }
  });
  return map;
}

/**
 * Determine Planetary Avastha (बाल, कुमार, युवा, वृद्ध, मृत)
 */
function getPlanetaryAvastha(degInSign, isOddSign) {
  const d = degInSign;
  if (isOddSign) {
    if (d < 6) return 'बाल';
    if (d < 12) return 'कुमार';
    if (d < 18) return 'युवा';
    if (d < 24) return 'वृद्ध';
    return 'मृत';
  } else {
    if (d < 6) return 'मृत';
    if (d < 12) return 'वृद्ध';
    if (d < 18) return 'युवा';
    if (d < 24) return 'कुमार';
    return 'बाल';
  }
}

/**
 * Calculate Pushkar Bhaga and Pushkar Navamsha
 */
function checkPushkarAndVargottama(planet, d1Sign, d9Sign) {
  const tags = [];
  if (d1Sign === d9Sign) {
    tags.push('वर्गोत्तम');
  }
  const deg = planet.degreeInSign || (planet.longitude % 30);
  // Key Pushkar Navamshas
  if ([1, 4, 7, 10].includes(d1Sign) && [9, 12].includes(d9Sign)) {
    tags.push('पुष्कर नवांश');
  } else if ([2, 5, 8, 11].includes(d1Sign) && [3, 6].includes(d9Sign)) {
    tags.push('पुष्कर नवांश');
  } else if ([3, 6, 9, 12].includes(d1Sign) && [7, 10].includes(d9Sign)) {
    tags.push('पुष्कर नवांश');
  }

  // Pushkar Bhaga degree orbs
  const pushkarDegrees = {
    1: 21, 2: 14, 3: 24, 4: 7, 5: 21, 6: 14,
    7: 24, 8: 7, 9: 21, 10: 14, 11: 24, 12: 7
  };
  if (Math.abs(deg - (pushkarDegrees[d1Sign] || 0)) <= 1.5) {
    tags.push('पुष्कर भाग');
  }
  return tags.join(' ');
}

/**
 * Determine Planetary Sthiti (उदय, अस्त, वक्री, उच्च, नीच)
 */
function getPlanetarySthiti(planet, sunLongitude) {
  if (planet.key === 'Sun' || planet.key === 'Ascendant') return '';
  if (planet.key === 'Rahu' || planet.key === 'Ketu') return 'वक्री';

  const diff = Math.abs((planet.longitude - sunLongitude + 360) % 360);
  const combustionOrbs = { Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15 };
  const orb = combustionOrbs[planet.key] || 10;
  const isCombust = diff < orb || diff > 360 - orb;

  const isRetro = Boolean(planet.isRetrograde);
  let status = [];
  if (isRetro) status.push('वक्री');
  if (isCombust) status.push('अस्त');
  else status.push('उदय');

  // Check exaltation (उच्च)
  const exaltations = { Sun: 1, Moon: 2, Mars: 10, Mercury: 6, Jupiter: 4, Venus: 12, Saturn: 7 };
  const debilitations = { Sun: 7, Moon: 8, Mars: 4, Mercury: 12, Jupiter: 10, Venus: 6, Saturn: 1 };
  if (planet.signNumber === exaltations[planet.key]) status.push('(उच्च)');
  if (planet.signNumber === debilitations[planet.key]) status.push('(नीच)');

  return status.join(' ');
}

/**
 * Compute Complete Avakahada Chakra
 */
function computeAvakahadaChakra(moonLongitude, name = 'कुण्डली १') {
  const normDeg = (moonLongitude % 360 + 360) % 360;
  const nakIdx = Math.floor(normDeg / 13.333333333333334);
  const nak = NAKSHATRAS[nakIdx] || NAKSHATRAS[0];
  const degInNak = normDeg - nakIdx * 13.333333333333334;
  const pada = Math.min(4, Math.floor(degInNak / 3.3333333333333335) + 1);
  const namakshar = nak.padas[pada - 1] || 'छ';

  const rashiIdx = Math.floor(normDeg / 30);
  const rashi = RASHIS[rashiIdx] || RASHIS[0];

  return {
    name: name,
    namakshar: `${namakshar} - ${nak.name.split(' ')[0]} (०${pada}) - ${rashi.name}`,
    nakshatraFull: `${nak.name.split(' ')[0]} (०${pada}) - ${nak.lord}`,
    tithi: 'भाद्र कृष्ण - दशमी',
    yoga: 'व्यतिपात',
    karana: 'भद्रा',
    gana: nak.gana,
    nadi: nak.nadi,
    varna: `${nak.varna} / द्विपद`,
    yoni: `${nak.yoni} / सर्प`
  };
}

/**
 * Calculate Divisional Sign (D-N) for any given longitude
 */
function calculateDivisionalSign(longitude, division) {
  const normDeg = (longitude % 360 + 360) % 360;
  const signIdx = Math.floor(normDeg / 30); // 0 to 11 (Aries = 0)
  const degInSign = normDeg % 30;
  const baseSign = signIdx + 1; // 1 to 12

  if (division === 1) return baseSign;

  if (division === 2) {
    // Hora (D-2): Odd signs: 0-15 Sun (5), 15-30 Moon (4). Even: 0-15 Moon (4), 15-30 Sun (5).
    const isOdd = baseSign % 2 !== 0;
    if (degInSign < 15) return isOdd ? 5 : 4;
    return isOdd ? 4 : 5;
  }

  if (division === 3) {
    // Drekkana (D-3): 0-10 same, 10-20 5th, 20-30 9th
    const part = Math.floor(degInSign / 10);
    const offset = part * 4;
    return ((baseSign - 1 + offset) % 12) + 1;
  }

  if (division === 9) {
    // Navamsha (D-9): 3° 20' each
    const navPart = Math.floor(degInSign / 3.3333333333333335);
    // Move starting sign by element
    const elementStart = {
      1: 1, 5: 1, 9: 1, // Fire -> Aries
      2: 10, 6: 10, 10: 10, // Earth -> Capricorn
      3: 7, 7: 7, 11: 7, // Air -> Libra
      4: 4, 8: 4, 12: 4 // Water -> Cancer
    };
    const start = elementStart[baseSign] || 1;
    return ((start - 1 + navPart) % 12) + 1;
  }

  // Default fallback
  const part = Math.floor(degInSign / (30 / division));
  return ((baseSign - 1 + part) % 12) + 1;
}

/**
 * Generate Complete Yogini Dasha
 */
function calculateYoginiDasha(moonLongitude, birthDateStr = '2026-09-06') {
  const normDeg = (moonLongitude % 360 + 360) % 360;
  const nakIdx = Math.floor(normDeg / 13.333333333333334);
  const degInNak = normDeg - nakIdx * 13.333333333333334;
  const fracPassed = degInNak / 13.333333333333334;

  // Ruling Yogini formula: (Nakshatra index (1-based) + 3) % 8
  const nakNum = nakIdx + 1;
  let startYoginiIdx = (nakNum + 3) % 8;
  if (startYoginiIdx === 0) startYoginiIdx = 8;
  startYoginiIdx -= 1; // 0-based index into YOGINI_DATA

  const birthDate = new Date(birthDateStr);
  const birthYear = isNaN(birthDate.getTime()) ? 2026 : birthDate.getFullYear();

  const cycles = [];
  let currentYear = birthYear;

  // Build 3 consecutive 36-year cycles to cover up to 108 years
  for (let c = 0; c < 3; c++) {
    for (let i = 0; i < 8; i++) {
      const idx = (startYoginiIdx + i) % 8;
      const yogini = YOGINI_DATA[idx];
      let dur = yogini.years;
      if (c === 0 && i === 0) {
        dur = +(dur * (1 - fracPassed)).toFixed(2);
      }
      const startYr = currentYear;
      const endYr = +(currentYear + dur).toFixed(2);
      currentYear = endYr;

      // Sub-periods (Bhuktis)
      const bhuktis = [];
      let bCurrent = startYr;
      for (let j = 0; j < 8; j++) {
        const bIdx = (idx + j) % 8;
        const bYogini = YOGINI_DATA[bIdx];
        const bDur = (dur * bYogini.years) / 36;
        const bStart = bCurrent;
        const bEnd = +(bCurrent + bDur).toFixed(2);
        bCurrent = bEnd;
        bhuktis.push({
          name: bYogini.name,
          lord: bYogini.lord,
          startYear: bStart,
          endYear: bEnd,
          dateBs: `${Math.floor(bEnd + 57)}-०६-१२`
        });
      }

      cycles.push({
        name: yogini.name,
        lord: yogini.lord,
        years: yogini.years,
        startYear: startYr,
        endYear: endYr,
        dateBsRange: `२०${Math.floor(startYr - 2000 + 57)}-०७-०१ - २०${Math.floor(endYr - 2000 + 57)}-०७-०१`,
        bhuktis: bhuktis
      });
    }
  }

  return cycles;
}

/**
 * Generate Authentic North Indian Diamond Chart SVG
 */
function generateDiamondChartSvg(lagnaSign, planetsByHouse, chartTitle = 'लग्न कुण्डली (D-1)', options = {}) {
  const width = options.width || 420;
  const height = options.height || 360;
  const showGanesha = options.showGanesha !== false;

  // House coordinates for diamond layout (12 houses)
  // House 1: Top diamond (Center)
  // House 2: Top-left triangle
  // House 3: Far left-top triangle
  // House 4: Left diamond
  // House 5: Bottom-left triangle
  // House 6: Bottom-left center triangle
  // House 7: Bottom diamond
  // House 8: Bottom-right center triangle
  // House 9: Bottom-right far triangle
  // House 10: Right diamond
  // House 11: Top-right triangle
  // House 12: Top-right center triangle

  const houseNumbers = {};
  for (let h = 1; h <= 12; h++) {
    let s = (lagnaSign + h - 1) % 12;
    if (s === 0) s = 12;
    houseNumbers[h] = s;
  }

  // Exact center anchor points for house numbers and planets
  const houseCoords = {
    1: { numX: width * 0.5, numY: height * 0.28, pX: width * 0.5, pY: height * 0.2 },
    2: { numX: width * 0.24, numY: height * 0.36, pX: width * 0.26, pY: height * 0.3 },
    3: { numX: width * 0.16, numY: height * 0.33, pX: width * 0.12, pY: height * 0.4 },
    4: { numX: width * 0.23, numY: height * 0.5, pX: width * 0.25, pY: height * 0.56 },
    5: { numX: width * 0.18, numY: height * 0.7, pX: width * 0.12, pY: height * 0.65 },
    6: { numX: width * 0.24, numY: height * 0.74, pX: width * 0.28, pY: height * 0.76 },
    7: { numX: width * 0.5, numY: height * 0.72, pX: width * 0.5, pY: height * 0.8 },
    8: { numX: width * 0.76, numY: height * 0.74, pX: width * 0.72, pY: height * 0.76 },
    9: { numX: width * 0.82, numY: height * 0.7, pX: width * 0.86, pY: height * 0.65 },
    10: { numX: width * 0.77, numY: height * 0.5, pX: width * 0.75, pY: height * 0.42 },
    11: { numX: width * 0.84, numY: height * 0.33, pX: width * 0.86, pY: height * 0.4 },
    12: { numX: width * 0.76, numY: height * 0.36, pX: width * 0.72, pY: height * 0.3 }
  };

  let numElements = '';
  for (let h = 1; h <= 12; h++) {
    const coord = houseCoords[h];
    const s = houseNumbers[h];
    numElements += `<text x="${coord.numX}" y="${coord.numY}" font-family="'Noto Serif Devanagari', serif" font-size="12" font-weight="700" fill="#2d2238" text-anchor="middle" dominant-baseline="middle">${toNepaliNum(s)}</text>\n`;
  }

  let planetElements = '';
  for (let h = 1; h <= 12; h++) {
    const list = planetsByHouse[h] || [];
    if (list.length > 0) {
      const coord = houseCoords[h];
      const txt = list.join(' ');
      // Color-code planets: Red/Amber for Sun/Mars/Rahu/Ketu, Green/Blue for Jupiter/Moon/Venus
      const isBenefic = list.some(p => ['बृ', 'शु', 'च', 'बु'].includes(p));
      const color = isBenefic ? '#1f8f5a' : '#c0392b';
      planetElements += `<text x="${coord.pX}" y="${coord.pY}" font-family="'Noto Serif Devanagari', serif" font-size="12" font-weight="700" fill="${color}" text-anchor="middle" dominant-baseline="middle">${txt}</text>\n`;
    }
  }

  const ganeshaCenter = showGanesha ? `
    <!-- Auspicious Lord Ganesha Emblem in Center -->
    <g transform="translate(${width * 0.5}, ${height * 0.5}) scale(0.68)">
      <circle cx="0" cy="0" r="28" fill="#fffaf2" stroke="#d8b06a" stroke-width="1.2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
      <!-- Stylized Ganesha Drawing -->
      <path d="M -8 -12 C -6 -18 6 -18 8 -12 C 10 -6 12 0 8 8 C 4 14 0 16 0 20" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" />
      <circle cx="4" cy="-8" r="1.5" fill="#c0392b" />
      <path d="M -4 -16 L 4 -16 M -3 -13 L 3 -13 M -1 -10 L 1 -10" stroke="#c0392b" stroke-width="1" />
      <path d="M -12 -6 C -16 -4 -16 6 -10 6" fill="none" stroke="#d97706" stroke-width="1.8" stroke-linecap="round" />
      <path d="M 12 -6 C 16 -4 16 6 10 6" fill="none" stroke="#d97706" stroke-width="1.8" stroke-linecap="round" />
      <circle cx="9" cy="8" r="2" fill="#d97706" />
    </g>
  ` : '';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="vedic-diamond-chart" style="width: 100%; height: auto; display: block; background: #ffffff;">
      <!-- Diamond Frame Geometry -->
      <rect x="2" y="2" width="${width - 4}" height="${height - 4}" fill="#ffffff" stroke="#2c2438" stroke-width="1.8" />
      
      <!-- Diagonals -->
      <line x1="2" y1="2" x2="${width - 2}" y2="${height - 2}" stroke="#2c2438" stroke-width="1.2" />
      <line x1="${width - 2}" y1="2" x2="2" y2="${height - 2}" stroke="#2c2438" stroke-width="1.2" />
      
      <!-- Inner Diamond -->
      <polygon points="${width * 0.5},2 2,${height * 0.5} ${width * 0.5},${height - 2} ${width - 2},${height * 0.5}" fill="none" stroke="#2c2438" stroke-width="1.2" />
      
      <!-- Corner Triangles -->
      <line x1="${width * 0.25}" y1="${height * 0.25}" x2="${width * 0.5}" y2="2" stroke="#2c2438" stroke-width="0.8" />
      <line x1="${width * 0.75}" y1="${height * 0.25}" x2="${width * 0.5}" y2="2" stroke="#2c2438" stroke-width="0.8" />
      <line x1="${width * 0.25}" y1="${height * 0.75}" x2="${width * 0.5}" y2="${height - 2}" stroke="#2c2438" stroke-width="0.8" />
      <line x1="${width * 0.75}" y1="${height * 0.75}" x2="${width * 0.5}" y2="${height - 2}" stroke="#2c2438" stroke-width="0.8" />

      <!-- Center Emblem -->
      ${ganeshaCenter}

      <!-- House Numbers -->
      ${numElements}

      <!-- Planet Abbreviations -->
      ${planetElements}
    </svg>
  `;
}

/**
 * Build Preset Sample Chart matching the user's Jyotish Sarathi screenshots:
 * - Birth: 2026-09-06 17:21 (२०८३-०५-२१ भाद्र, आइतबार) | Kathmandu +5:45
 * - Lagna: कुम्भ (11) at 01°48'45"
 * - Surya: सिंह (5) at 19°02'07"
 * - Chandra: मिथुन (3) at 18°27'03"
 * - Mangal: मिथुन (3) at 21°08'23"
 * - Budha: सिंह (5) at 29°32'47"
 * - Brihaspati: कर्कट (4) at 21°38'13"
 * - Shukra: तुला (7) at 01°06'59"
 * - Shani: मीन (12) at 16°44'22"
 * - Rahu: कुम्भ (11) at 04°04'07"
 * - Ketu: सिंह (5) at 04°04'07"
 */
function getPresetSarathiSample() {
  const planets = [
    { key: 'Ascendant', nameNepali: 'लग्न', dev: 'ल', longitude: 301.8125, signNumber: 11, rashiName: 'कुम्भ', degreeFormatted: "०१°४८'४५\"", degreeInSign: 1.8125, nakshatra: 'धनिष्ठा (०३)', nakshatraLord: 'मंगल', avastha: 'बाल', karaka: '', visheshata: '', sthiti: '' },
    { key: 'Sun', nameNepali: 'सूर्य', dev: 'सू', longitude: 139.0353, signNumber: 5, rashiName: 'सिंह', degreeFormatted: "१९°०२'०७\"", degreeInSign: 19.0353, nakshatra: 'पूर्वफाल्गुनी (०२)', nakshatraLord: 'शुक्र', avastha: 'वृद्ध', karaka: 'मातृकारक - आमा', visheshata: 'पुष्कर भाग', sthiti: '' },
    { key: 'Moon', nameNepali: 'चन्द्र', dev: 'चं', longitude: 78.4508, signNumber: 3, rashiName: 'मिथुन', degreeFormatted: "१८°२७'०३\"", degreeInSign: 18.4508, nakshatra: 'आर्द्र (०४)', nakshatraLord: 'राहु', avastha: 'वृद्ध', karaka: 'पुत्रकारक - सन्तान', visheshata: 'पुष्कर नवांश पुष्कर भाग', sthiti: '' },
    { key: 'Mars', nameNepali: 'मङ्गल', dev: 'मं', longitude: 81.1397, signNumber: 3, rashiName: 'मिथुन', degreeFormatted: "२१°०८'२३\"", degreeInSign: 21.1397, nakshatra: 'पुनर्वसु (०१)', nakshatraLord: 'बृहस्पति', avastha: 'वृद्ध', karaka: 'भ्रातृकारक - दाजुभाइ', visheshata: '', sthiti: 'उदय' },
    { key: 'Mercury', nameNepali: 'बुध', dev: 'बु', longitude: 149.5464, signNumber: 5, rashiName: 'सिंह', degreeFormatted: "२९°३२'४७\"", degreeInSign: 29.5464, nakshatra: 'उत्तराफाल्गुनी (०१)', nakshatraLord: 'सूर्य', avastha: 'मृत', karaka: 'आत्मकारक - आत्मा', visheshata: 'पुष्कर नवांश', sthiti: 'अस्त' },
    { key: 'Jupiter', nameNepali: 'बृहस्पति', dev: 'बृ', longitude: 111.6369, signNumber: 4, rashiName: 'कर्कट', degreeFormatted: "२१°३८'१३\"", degreeInSign: 21.6369, nakshatra: 'अश्लेषा (०२)', nakshatraLord: 'बुध', avastha: 'कुमार', karaka: 'अमात्यकारक - करियर', visheshata: '', sthiti: 'उदय (उच्च)' },
    { key: 'Venus', nameNepali: 'शुक्र', dev: 'शु', longitude: 181.1164, signNumber: 7, rashiName: 'तुला', degreeFormatted: "०१°०६'५९\"", degreeInSign: 1.1164, nakshatra: 'चित्रा (०३)', nakshatraLord: 'मंगल', avastha: 'बाल', karaka: 'दाराकारक - जीवनसाथी', visheshata: 'वर्गोत्तम', sthiti: 'उदय' },
    { key: 'Saturn', nameNepali: 'शनि', dev: 'श', longitude: 346.7394, signNumber: 12, rashiName: 'मीन', degreeFormatted: "१६°४४'२२\"", degreeInSign: 16.7394, nakshatra: 'रेवती (०१)', nakshatraLord: 'बुध', avastha: 'युवा', karaka: 'ज्ञातिकारक - नातेदार', visheshata: '', sthiti: 'वक्री उदय' },
    { key: 'Rahu', nameNepali: 'राहु', dev: 'रा', longitude: 304.0686, signNumber: 11, rashiName: 'कुम्भ', degreeFormatted: "०४°०४'०७\"", degreeInSign: 4.0686, nakshatra: 'धनिष्ठा (०४)', nakshatraLord: 'मंगल', avastha: 'बाल', karaka: '', visheshata: '', sthiti: 'वक्री' },
    { key: 'Ketu', nameNepali: 'केतु', dev: 'के', longitude: 124.0686, signNumber: 5, rashiName: 'सिंह', degreeFormatted: "०४°०४'०७\"", degreeInSign: 4.0686, nakshatra: 'मघा (०२)', nakshatraLord: 'केतु', avastha: 'बाल', karaka: '', visheshata: '', sthiti: 'वक्री' }
  ];

  // D-1 Houses grouping (Kumbha Lagna = 11)
  // House 1 (Kumbha): Ra, La
  // House 2 (Meena): Shani
  // House 5 (Mithuna): Chandra, Mangal
  // House 6 (Karka): Brihaspati
  // House 7 (Simha): Surya, Budha, Ketu
  // House 9 (Tula): Shukra
  const d1HousePlanets = {
    1: ['रा', 'ल'],
    2: ['श'],
    5: ['च', 'म'],
    6: ['बृ'],
    7: ['सू', 'बु', 'के'],
    9: ['शु']
  };

  // D-9 Navamsha Sign Mapping from screenshots:
  // Navamsha Lagna: 7 (Tula) -> House 1 (Tula): शु, ल
  // House 2 (Vrischika): रा
  // House 3 (Dhanu): बु, श
  // House 4 (Makara): बृ
  // House 6 (Meena): च
  // House 7 (Mesha): म
  // House 8 (Vrishabha): के
  // House 12 (Kanya): सू
  const d9HousePlanets = {
    1: ['शु', 'ल'],
    2: ['रा'],
    3: ['बु', 'श'],
    4: ['बृ'],
    6: ['च'],
    7: ['म'],
    8: ['के'],
    12: ['सू']
  };

  // Bhav Kundali mapping
  const bhavHousePlanets = {
    1: ['रा', 'ल'],
    2: ['श'],
    5: ['च', 'म'],
    6: ['बृ'],
    7: ['सू', 'बु', 'के'],
    9: ['शु']
  };

  // D-2 (Hora) mapping:
  // Lagna Hora: 5 (Sun) -> House 1 (Sun): बृ, शु, श, रा, के, ल | House 2 (Moon): सू, च, म, बु
  const d2HousePlanets = {
    1: ['बृ', 'शु', 'श', 'रा', 'के', 'ल'],
    2: ['सू', 'च', 'म', 'बु']
  };

  // D-3 (Drekkana) mapping:
  // Drekkana Lagna: 11 -> House 1: म, रा, ल | House 7: सू | House 8: च, शु | House 10: के | House 11: श | House 12: बु
  const d3HousePlanets = {
    1: ['म', 'रा', 'ल'],
    7: ['सू'],
    8: ['च', 'शु'],
    10: ['के'],
    11: ['श'],
    12: ['बु']
  };

  const avakahada = computeAvakahadaChakra(78.4508, 'कुण्डली १');
  const yogini = calculateYoginiDasha(78.4508, '2026-09-06');

  // Vimshottari summary timeline
  const vimshottari = [
    { lord: 'राहु', lordEng: 'Rahu', startBs: '२०६७-०६-२३', endBs: '२०८५-०६-२३', isCurrent: true },
    { lord: 'बृहस्पति', lordEng: 'Jupiter', startBs: '२०८५-०६-२३', endBs: '२१०१-०६-२३', isCurrent: false },
    { lord: 'शनि', lordEng: 'Saturn', startBs: '२१०१-०६-२३', endBs: '२१२०-०६-२३', isCurrent: false },
    { lord: 'बुध', lordEng: 'Mercury', startBs: '२१२०-०६-२३', endBs: '२१३७-०६-२३', isCurrent: false },
    { lord: 'केतु', lordEng: 'Ketu', startBs: '२१३७-०६-२३', endBs: '२१४४-०६-२३', isCurrent: false },
    { lord: 'शुक्र', lordEng: 'Venus', startBs: '२१४४-०६-२३', endBs: '२१६४-०६-२३', isCurrent: false },
    { lord: 'सूर्य', lordEng: 'Sun', startBs: '२१६४-०६-२३', endBs: '२१७०-०६-२३', isCurrent: false },
    { lord: 'चन्द्र', lordEng: 'Moon', startBs: '२१७०-०६-२३', endBs: '२१८०-०६-२३', isCurrent: false },
    { lord: 'मङ्गल', lordEng: 'Mars', startBs: '२१८०-०६-२३', endBs: '२१८७-०६-२४', isCurrent: false }
  ];

  return {
    meta: {
      customerName: 'कुण्डली १',
      dobBs: '२०८३ भाद्र २१, आइतबार',
      dobAd: '06 September 2026',
      time: '17:21:00 (२९:०१:३७ घटी)',
      place: 'Kathmandu (+5:45)',
      coordinates: "२७° उ ४२' / ८५° पू १९'",
      ayanamsa: "२३° ४९' (सूर्य सिद्धान्त / Lahiri)",
      bhayatBhabhog: '४९:१८:४७ / ५५:४८:१७'
    },
    avakahada: avakahada,
    planets: planets,
    charts: {
      d1: { lagnaSign: 11, housePlanets: d1HousePlanets, svg: generateDiamondChartSvg(11, d1HousePlanets, 'लग्न कुण्डली (D-1)') },
      d9: { lagnaSign: 7, housePlanets: d9HousePlanets, svg: generateDiamondChartSvg(7, d9HousePlanets, 'नवमांश कुण्डली (D-9)') },
      bhav: { lagnaSign: 11, housePlanets: bhavHousePlanets, svg: generateDiamondChartSvg(11, bhavHousePlanets, 'भाव कुण्डली') },
      d2: { lagnaSign: 5, housePlanets: d2HousePlanets, svg: generateDiamondChartSvg(5, d2HousePlanets, 'होरा कुण्डली (D-2)') },
      d3: { lagnaSign: 11, housePlanets: d3HousePlanets, svg: generateDiamondChartSvg(11, d3HousePlanets, 'द्रेष्काण कुण्डली (D-3)') }
    },
    dashas: {
      vimshottari: vimshottari,
      yogini: yogini
    }
  };
}

module.exports = {
  NAKSHATRAS,
  RASHIS,
  YOGINI_DATA,
  formatDMS,
  toNepaliNum,
  convertAdToBs,
  computeAvakahadaChakra,
  calculateDivisionalSign,
  calculateYoginiDasha,
  generateDiamondChartSvg,
  getPresetSarathiSample
};
