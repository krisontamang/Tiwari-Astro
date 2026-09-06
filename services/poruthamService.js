/**
 * poruthamService.js — South Indian & Sri Lankan 10 Poruthams, Papasamya & Pancha Pakshi Engine
 * Derived from Fernando Family Astrology (NPFernando/fernandofamily-astrology) and Asterwise (asterwise/nextjs-vedic-matchmaking).
 */

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

// 5 Rajjus (1 to 27 Nakshatras mapped to Siro, Kanta, Udara, Kati, Pada)
// 1. Siro (Head): Mrigashira, Chitra, Dhanishta
// 2. Kanta (Neck): Rohini, Arudra, Hasta, Swati, Shravana, Shatabhisha
// 3. Udara (Stomach): Krittika, Punarvasu, U.Phalguni, Vishakha, U.Ashadha, P.Bhadrapada
// 4. Kati (Thigh): Bharani, Pushya, P.Phalguni, Anuradha, P.Ashadha, U.Bhadrapada
// 5. Pada (Foot): Ashwini, Ashlesha, Magha, Jyeshtha, Mula, Revati
const RAJJU_MAP = {
  // Pada
  1: 'Pada (पाद रज्जु - सुख/यात्रा)',
  9: 'Pada (पाद रज्जु - सुख/यात्रा)',
  10: 'Pada (पाद रज्जु - सुख/यात्रा)',
  18: 'Pada (पाद रज्जु - सुख/यात्रा)',
  19: 'Pada (पाद रज्जु - सुख/यात्रा)',
  27: 'Pada (पाद रज्जु - सुख/यात्रा)',
  // Kati
  2: 'Kati (कटि रज्जु - सन्तान/वंश)',
  8: 'Kati (कटि रज्जु - सन्तान/वंश)',
  11: 'Kati (कटि रज्जु - सन्तान/वंश)',
  17: 'Kati (कटि रज्जु - सन्तान/वंश)',
  20: 'Kati (कटि रज्जु - सन्तान/वंश)',
  26: 'Kati (कटि रज्जु - सन्तान/वंश)',
  // Udara
  3: 'Udara (उदर रज्जु - धन/आरोग्य)',
  7: 'Udara (उदर रज्जु - धन/आरोग्य)',
  12: 'Udara (उदर रज्जु - धन/आरोग्य)',
  16: 'Udara (उदर रज्जु - धन/आरोग्य)',
  21: 'Udara (उदर रज्जु - धन/आरोग्य)',
  25: 'Udara (उदर रज्जु - धन/आरोग्य)',
  // Kanta
  4: 'Kanta (कण्ठ रज्जु - सौभाग्य/स्त्री धन)',
  6: 'Kanta (कण्ठ रज्जु - सौभाग्य/स्त्री धन)',
  13: 'Kanta (कण्ठ रज्जु - सौभाग्य/स्त्री धन)',
  15: 'Kanta (कण्ठ रज्जु - सौभाग्य/स्त्री धन)',
  22: 'Kanta (कण्ठ रज्जु - सौभाग्य/स्त्री धन)',
  24: 'Kanta (कण्ठ रज्जु - सौभाग्य/स्त्री धन)',
  // Siro
  5: 'Siro (शिरो रज्जु - पति/दीर्घायु)',
  14: 'Siro (शिरो रज्जु - पति/दीर्घायु)',
  23: 'Siro (शिरो रज्जु - पति/दीर्घायु)'
};

// Vedha pairs (forbidden nakshatra combinations)
const VEDHA_PAIRS = [
  [1, 18], // Ashwini - Jyeshtha
  [2, 17], // Bharani - Anuradha
  [3, 16], // Krittika - Vishakha
  [4, 15], // Rohini - Swati
  [6, 13], // Ardra - Hasta
  [7, 12], // Punarvasu - U.Phalguni
  [8, 11], // Pushya - P.Phalguni
  [9, 10], // Ashlesha - Magha
  [19, 27], // Mula - Revati
  [20, 26], // P.Ashadha - U.Bhadrapada
  [21, 25], // U.Ashadha - P.Bhadrapada
  [22, 24]  // Shravana - Shatabhisha
];

// Ganas (1=Deva, 2=Manushya, 3=Rakshasa)
const GANA_MAP = {
  1: 'Deva', 2: 'Manushya', 3: 'Rakshasa', 4: 'Manushya', 5: 'Deva', 6: 'Manushya',
  7: 'Deva', 8: 'Deva', 9: 'Rakshasa', 10: 'Rakshasa', 11: 'Manushya', 12: 'Manushya',
  13: 'Deva', 14: 'Rakshasa', 15: 'Deva', 16: 'Rakshasa', 17: 'Deva', 18: 'Rakshasa',
  19: 'Rakshasa', 20: 'Manushya', 21: 'Manushya', 22: 'Deva', 23: 'Rakshasa', 24: 'Rakshasa',
  25: 'Manushya', 26: 'Manushya', 27: 'Deva'
};

// Pancha Pakshi Birds (1=Vulture, 2=Owl, 3=Crow, 4=Rooster, 5=Peacock)
const PANCHA_PAKSHI = [
  { id: 1, name: 'Vulture (गिद्ध)', bird: 'Vulture', rulingPlanet: 'Jupiter', nature: 'साहसी, एकाग्र, दूरदर्शी' },
  { id: 2, name: 'Owl (उल्लू)', bird: 'Owl', rulingPlanet: 'Sun', nature: 'गम्भीर, रहस्यमय, रात्रिकालीन बुद्धि' },
  { id: 3, name: 'Crow (काग)', bird: 'Crow', rulingPlanet: 'Moon', nature: 'चतुर, सतर्क, व्यावहारिक' },
  { id: 4, name: 'Rooster (भाले)', bird: 'Rooster', rulingPlanet: 'Mars', nature: 'उत्साही, समयनिष्ठ, ऊर्जावान' },
  { id: 5, name: 'Peacock (मयूर)', bird: 'Peacock', rulingPlanet: 'Venus', nature: 'कलात्मक, सौन्दर्यप्रेमी, राजसी' }
];
// Helper scales for Rashi and Nakshatra
const RASHI_NAMES = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];

function resolveNakshatraIndex(val) {
  if (typeof val === 'number') return Math.max(1, Math.min(27, Math.floor(val)));
  if (typeof val === 'string') {
    const idx = NAKSHATRA_NAMES.findIndex(n => n.toLowerCase() === val.trim().toLowerCase());
    if (idx !== -1) return idx + 1;
    const num = parseInt(val, 10);
    if (!isNaN(num)) return Math.max(1, Math.min(27, num));
  }
  return 1;
}

function resolveRashiIndex(val) {
  if (typeof val === 'number') return Math.max(1, Math.min(12, Math.floor(val)));
  if (typeof val === 'string') {
    const idx = RASHI_NAMES.findIndex(r => r.toLowerCase() === val.trim().toLowerCase());
    if (idx !== -1) return idx + 1;
    const num = parseInt(val, 10);
    if (!isNaN(num)) return Math.max(1, Math.min(12, num));
  }
  return 1;
}

/**
 * Determine Pancha Pakshi bird from Nakshatra index or name
 */
function getPanchaPakshiBird(nakshatraInput = 1) {
  const nakshatraNum = resolveNakshatraIndex(nakshatraInput);
  const birdIndex = (nakshatraNum - 1) % 5;
  const pakshi = PANCHA_PAKSHI[birdIndex] || PANCHA_PAKSHI[0];
  return {
    nakshatraId: nakshatraNum,
    nakshatraName: NAKSHATRA_NAMES[nakshatraNum - 1] || 'Ashwini',
    ...pakshi
  };
}

/**
 * Calculate 10 Poruthams for Marriage Compatibility
 */
function calculate10Poruthams(girlNakInput = 1, boyNakInput = 1, girlRashiInput = 1, boyRashiInput = 1) {
  const girlNak = resolveNakshatraIndex(girlNakInput);
  const boyNak = resolveNakshatraIndex(boyNakInput);
  const girlRashi = resolveRashiIndex(girlRashiInput);
  const boyRashi = resolveRashiIndex(boyRashiInput);

  const count = ((boyNak - girlNak + 27) % 27) + 1;

  // 1. Dina Porutham (Health & Prosperity)
  // Count from girl's star to boy's star: 2, 4, 6, 8, 9, 11, 13, 15, 18, 20, 24, 26 are favorable
  const dinaGood = [2, 4, 6, 8, 9, 11, 13, 15, 18, 20, 24, 26].includes(count);

  // 2. Gana Porutham (Temperament)
  const gGana = GANA_MAP[girlNak] || 'Deva';
  const bGana = GANA_MAP[boyNak] || 'Deva';
  let ganaGood = false;
  if (gGana === bGana) ganaGood = true;
  else if (gGana === 'Deva' && bGana === 'Manushya') ganaGood = true;
  else if (gGana === 'Manushya' && bGana === 'Deva') ganaGood = true;

  // 3. Mahendra Porutham (Lineage & Progeny)
  // Count: 4, 7, 10, 13, 16, 19, 22, 25 are favorable
  const mahendraGood = [4, 7, 10, 13, 16, 19, 22, 25].includes(count);

  // 4. Stree Deergha Porutham (Female Longevity)
  // If count is greater than 13, considered favorable
  const streeDeerghaGood = count > 13;

  // 5. Yoni Porutham (Physical Affinity)
  // Check if both stars are not extreme natural enemies
  const yoniGood = Math.abs(girlNak - boyNak) % 2 === 0 || count % 2 === 0;

  // 6. Rasi Porutham (Family Lineage & Joy)
  const rasiDiff = Math.abs(boyRashi - girlRashi);
  const rasiGood = rasiDiff !== 5 && rasiDiff !== 7; // Avoid 6/8 and 2/12

  // 7. Rasiyadhipati Porutham (Friendship of Lords)
  const rasiyadhipatiGood = rasiDiff <= 4 || rasiDiff === 8;

  // 8. Vasiya Porutham (Mutual Attraction)
  const vasiyaGood = [1, 3, 5, 7, 9, 11].includes(rasiDiff);

  // 9. Rajju Porutham (CRITICAL VETO: Longevity of Marital Bond)
  const gRajju = RAJJU_MAP[girlNak];
  const bRajju = RAJJU_MAP[boyNak];
  const rajjuGood = gRajju !== bRajju; // Must not be the same Rajju

  // 10. Vedha Porutham (CRITICAL VETO: Affliction Immunity)
  const hasVedha = VEDHA_PAIRS.some(pair => 
    (pair[0] === girlNak && pair[1] === boyNak) || (pair[1] === girlNak && pair[0] === boyNak)
  );
  const vedhaGood = !hasVedha;

  const poruthams = [
    { name: '1. Dina Porutham (दिन पोरुथम)', status: dinaGood ? 'उत्तम (Favorable)' : 'मध्यम (Neutral)', isPassed: dinaGood, significance: 'शारीरिक आरोग्य, दीर्घायु र रोगमुक्ति' },
    { name: '2. Gana Porutham (गण पोरुथम)', status: ganaGood ? 'अनुकूल (Compatible)' : 'विचारणीय (Check)', isPassed: ganaGood, significance: `स्वभाव र दृष्टिकोण (${gGana} + ${bGana})` },
    { name: '3. Mahendra Porutham (महेन्द्र पोरुथम)', status: mahendraGood ? 'शुभ (Favorable)' : 'सामान्य (Normal)', isPassed: mahendraGood, significance: 'सन्तान वृद्धि, वंश कल्याण र सुरक्षा' },
    { name: '4. Stree Deergha (स्त्री दीर्घ पोरुथम)', status: streeDeerghaGood ? 'उत्कृष्ट (Auspicious)' : 'मध्यम (Moderate)', isPassed: streeDeerghaGood, significance: 'महिलाको सौभाग्य, मान-सम्मान र समृद्धि' },
    { name: '5. Yoni Porutham (योनि पोरुथम)', status: yoniGood ? 'शुभ (Harmonious)' : 'सामान्य (Neutral)', isPassed: yoniGood, significance: 'पारस्परिक आकर्षण र शारीरिक सामञ्जस्य' },
    { name: '6. Rasi Porutham (राशि पोरुथम)', status: rasiGood ? 'अनुकूल (Auspicious)' : 'सचेत (Caution)', isPassed: rasiGood, significance: 'पारिवारिक सुख, कुल उन्नति र ऐश्वर्य' },
    { name: '7. Rasiyadhipati (राश्याधिपति पोरुथम)', status: rasiyadhipatiGood ? 'मित्रता (Friendly)' : 'तटस्थ (Neutral)', isPassed: rasiyadhipatiGood, significance: 'ग्रह स्वामीहरूको पारस्परिक मित्रता र समझदारी' },
    { name: '8. Vasiya Porutham (वश्य पोरुथम)', status: vasiyaGood ? 'आकर्षण (Attraction)' : 'सामान्य (Normal)', isPassed: vasiyaGood, significance: 'आपसी प्रेम, समर्पण र आत्मीय आकर्षण' },
    { name: '9. Rajju Porutham (रज्जु पोरुथम - मुख्य विचार)', status: rajjuGood ? 'दोषरहित (Safe)' : '⚠️ रज्जु दोष (Veto Warning)', isPassed: rajjuGood, significance: `वैवाहिक सूत्रको सुरक्षा (कन्या: ${gRajju}, वर: ${bRajju})`, isVeto: true },
    { name: '10. Vedha Porutham (वेध पोरुथम - मुख्य विचार)', status: vedhaGood ? 'दोषमुक्त (Clear)' : '⚠️ वेध दोष (Affliction Veto)', isPassed: vedhaGood, significance: hasVedha ? 'दुई नक्षत्र बीच वेध (टकराव) विद्यमान' : 'कुनै वेध दोष नभएको शुभ योग', isVeto: true }
  ];

  const passedCount = poruthams.filter(p => p.isPassed).length;
  const isVetoViolated = !rajjuGood || !vedhaGood;

  let overallVerdict = 'उत्कृष्ट वैवाहिक मिलान (Highly Recommended)';
  if (isVetoViolated) {
    overallVerdict = '⚠️ रज्जु वा वेध दोष विद्यमान (Requires Astrological Remedies / परिहार विचार आवश्यक)';
  } else if (passedCount < 6) {
    overallVerdict = 'मध्यम मिलान (Moderate Compatibility)';
  }

  return {
    success: true,
    totalPoruthams: 10,
    passedPoruthams: passedCount,
    isVetoViolated,
    overallVerdict,
    girlNakshatra: NAKSHATRA_NAMES[girlNak - 1] || 'Ashwini',
    boyNakshatra: NAKSHATRA_NAMES[boyNak - 1] || 'Ashwini',
    poruthams
  };
}

/**
 * Calculate Papasamya (Malefic point balance) between Bride & Groom
 */
function calculatePapasamya(payload = {}) {
  const boyMalefics = payload.boyMalefics || payload.groomMalefics || {};
  const girlMalefics = payload.girlMalefics || payload.brideMalefics || {};

  function extractPoints(chart, maleficsObj) {
    if (maleficsObj && Object.keys(maleficsObj).length > 0) {
      return (maleficsObj.mars || 0) * 2 + (maleficsObj.saturn || 0) * 1.5 + (maleficsObj.sun || 0) * 1 + (maleficsObj.rahu || 0) * 1;
    }
    if (chart && Array.isArray(chart.planets)) {
      let pts = 0;
      const maleficHouses = [1, 2, 4, 7, 8, 12];
      chart.planets.forEach(p => {
        const name = (p.name || '').toLowerCase();
        const house = Number(p.house || p.bhava || 0);
        if (maleficHouses.includes(house)) {
          if (name.includes('mars') || name.includes('mangal')) pts += 2;
          else if (name.includes('saturn') || name.includes('shani')) pts += 1.5;
          else if (name.includes('sun') || name.includes('surya')) pts += 1;
          else if (name.includes('rahu') || name.includes('ketu')) pts += 1;
        }
      });
      return pts;
    }
    return 2.5; // Baseline default
  }

  const boyScore = extractPoints(payload.groomChart || payload.boyChart, boyMalefics);
  const girlScore = extractPoints(payload.brideChart || payload.girlChart, girlMalefics);

  const diff = Math.abs(boyScore - girlScore);
  const isBalanced = boyScore >= girlScore || diff <= 1.5;

  return {
    success: true,
    boyPapamPoints: boyScore,
    girlPapamPoints: girlScore,
    bridePoints: girlScore,
    groomPoints: boyScore,
    isBalanced,
    status: isBalanced ? 'पापसाम्य सन्तुलित (Auspicious Balance)' : '⚠️ वर भन्दा कन्याको पाप अंक अधिक (Remedies Recommended)',
    guidance: isBalanced 
      ? 'दुई कुण्डली बीच पाप ग्रहहरूको सन्तुलन उत्कृष्ट छ। विवाहका लागि शुभ मानिन्छ।'
      : 'कन्याको पाप अंक बढी भएकाले कुम्भ विवाह, मंगल शान्ति वा महामृत्युञ्जय जप गरेर सन्तुलन गर्न शास्त्रीय विधान छ।'
  };
}

module.exports = {
  NAKSHATRA_NAMES,
  RAJJU_MAP,
  PANCHA_PAKSHI,
  resolveNakshatraIndex,
  resolveRashiIndex,
  getPanchaPakshiBird,
  calculate10Poruthams,
  calculatePoruthams: calculate10Poruthams,
  calculatePapasamya
};
