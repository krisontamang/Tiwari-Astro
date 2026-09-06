/**
 * dashaService.js — 120-Year Vimshottari Dasha Engine
 * Derived from RoxyAPI (RoxyAPI/dasha-api), VedicAstrologer, and Almamesh.
 */

const https = require('https');

const ROXY_API_KEY = process.env.ROXY_API_KEY || '';

// 27 Nakshatras & their Vimshottari Lords
const NAKSHATRAS = [
  { id: 1, name: 'Ashwini (अश्विनी)', lord: 'Ketu', degrees: [0, 13.3333] },
  { id: 2, name: 'Bharani (भरणी)', lord: 'Venus', degrees: [13.3333, 26.6667] },
  { id: 3, name: 'Krittika (कृत्तिका)', lord: 'Sun', degrees: [26.6667, 40] },
  { id: 4, name: 'Rohini (रोहिणी)', lord: 'Moon', degrees: [40, 53.3333] },
  { id: 5, name: 'Mrigashira (मृगशिरा)', lord: 'Mars', degrees: [53.3333, 66.6667] },
  { id: 6, name: 'Ardra (आर्द्रा)', lord: 'Rahu', degrees: [66.6667, 80] },
  { id: 7, name: 'Punarvasu (पुनर्वसु)', lord: 'Jupiter', degrees: [80, 93.3333] },
  { id: 8, name: 'Pushya (पुष्य)', lord: 'Saturn', degrees: [93.3333, 106.6667] },
  { id: 9, name: 'Ashlesha (आश्लेषा)', lord: 'Mercury', degrees: [106.6667, 120] },
  { id: 10, name: 'Magha (मघा)', lord: 'Ketu', degrees: [120, 133.3333] },
  { id: 11, name: 'Purva Phalguni (पूर्वा फाल्गुनी)', lord: 'Venus', degrees: [133.3333, 146.6667] },
  { id: 12, name: 'Uttara Phalguni (उत्तरा फाल्गुनी)', lord: 'Sun', degrees: [146.6667, 160] },
  { id: 13, name: 'Hasta (हस्त)', lord: 'Moon', degrees: [160, 173.3333] },
  { id: 14, name: 'Chitra (चित्रा)', lord: 'Mars', degrees: [173.3333, 186.6667] },
  { id: 15, name: 'Swati (स्वाती)', lord: 'Rahu', degrees: [186.6667, 200] },
  { id: 16, name: 'Vishakha (विशाखा)', lord: 'Jupiter', degrees: [200, 213.3333] },
  { id: 17, name: 'Anuradha (अनुराधा)', lord: 'Saturn', degrees: [213.3333, 226.6667] },
  { id: 18, name: 'Jyeshtha (ज्येष्ठा)', lord: 'Mercury', degrees: [226.6667, 240] },
  { id: 19, name: 'Mula (मूल)', lord: 'Ketu', degrees: [240, 253.3333] },
  { id: 20, name: 'Purva Ashadha (पूर्वाषाढा)', lord: 'Venus', degrees: [253.3333, 266.6667] },
  { id: 21, name: 'Uttara Ashadha (उत्तराषाढा)', lord: 'Sun', degrees: [266.6667, 280] },
  { id: 22, name: 'Shravana (श्रवण)', lord: 'Moon', degrees: [280, 293.3333] },
  { id: 23, name: 'Dhanishta (धनिष्ठा)', lord: 'Mars', degrees: [293.3333, 306.6667] },
  { id: 24, name: 'Shatabhisha (शतभिषा)', lord: 'Rahu', degrees: [306.6667, 320] },
  { id: 25, name: 'Purva Bhadrapada (पूर्वाभाद्रपदा)', lord: 'Jupiter', degrees: [320, 333.3333] },
  { id: 26, name: 'Uttara Bhadrapada (उत्तराभाद्रपदा)', lord: 'Saturn', degrees: [333.3333, 346.6667] },
  { id: 27, name: 'Revati (रेवती)', lord: 'Mercury', degrees: [346.6667, 360] }
];

// Fixed 120-Year Vimshottari Cycle Order & Durations
const DASHA_LORDS = [
  { planet: 'Ketu', years: 7, sanskrit: 'केतु', description: 'अध्यात्म, वैराग्य, अनुसन्धान र आन्तरिक जागरण' },
  { planet: 'Venus', years: 20, sanskrit: 'शुक्र', description: 'विलासिता, प्रेम सम्बन्ध, कला, वाहन र भौतिक सुख' },
  { planet: 'Sun', years: 6, sanskrit: 'सूर्य', description: 'सत्ता, प्रशासनिक पद, सामाजिक प्रतिष्ठा र आत्मबल' },
  { planet: 'Moon', years: 10, sanskrit: 'चन्द्रमा', description: 'मानसिक शान्ति, गृहस्थी, जनसम्पर्क र भावनात्मक समृद्धि' },
  { planet: 'Mars', years: 7, sanskrit: 'मंगल', description: 'साहस, पराक्रम, भूमि-भवन लाभ र प्राविधिक सिद्धि' },
  { planet: 'Rahu', years: 18, sanskrit: 'राहु', description: 'आकस्मिक परिवर्तन, वैदेशिक यात्रा, कूटनीति र नवीन प्रविधि' },
  { planet: 'Jupiter', years: 16, sanskrit: 'बृहस्पति', description: 'ज्ञान, सन्तान, धार्मिक कार्य, धन-धान्य र गुरु कृपा' },
  { planet: 'Saturn', years: 19, sanskrit: 'शनि', description: 'कर्म फल, अनुशासित जीवन, श्रम साधना र स्थायी उन्नति' },
  { planet: 'Mercury', years: 17, sanskrit: 'बुध', description: 'व्यापार, तीक्ष्ण बुद्धि, विद्या, लेखन र सञ्चार सफलता' }
];

const TOTAL_YEARS = 120;

/**
 * Find Moon Nakshatra from absolute sidereal Moon longitude (0-360)
 */
function getNakshatraFromMoon(longitude) {
  const norm = ((longitude % 360) + 360) % 360;
  const span = 360 / 27; // 13° 20' = 13.333333°
  const index = Math.floor(norm / span);
  const nak = NAKSHATRAS[index] || NAKSHATRAS[0];
  const elapsedDegrees = norm - (index * span);
  const remainingFraction = 1 - (elapsedDegrees / span);

  return {
    nakshatra: nak,
    elapsedDegrees,
    remainingFraction: Math.max(0.01, Math.min(0.99, remainingFraction))
  };
}

/**
 * Calculate Antardashas (Bhuktis) for a Mahadasha
 */
function calculateAntardashas(mahaPlanet, mahaStartDate, mahaYears) {
  const startIndex = DASHA_LORDS.findIndex(d => d.planet === mahaPlanet);
  const antardashas = [];
  let currentDate = new Date(mahaStartDate);

  for (let i = 0; i < 9; i++) {
    const antarLord = DASHA_LORDS[(startIndex + i) % 9];
    // Antardasha years = (Mahadasha years * Antardasha years) / 120
    const antarYears = (mahaYears * antarLord.years) / 120;
    const days = antarYears * 365.25;

    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate.getTime() + (days * 24 * 60 * 60 * 1000));
    currentDate = endDate;

    antardashas.push({
      planet: antarLord.planet,
      sanskrit: antarLord.sanskrit,
      years: Math.round(antarYears * 100) / 100,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      description: `${mahaPlanet} को महादशामा ${antarLord.planet} को अन्तर्दशा`
    });
  }

  return antardashas;
}

/**
 * Calculate full 120-year Vimshottari Dasha timeline from birth
 */
function calculateVimshottariTimeline(birthDateStr = '1995-05-15', moonLongitude = 45.5) {
  const birthDate = new Date(birthDateStr);
  const { nakshatra, remainingFraction } = getNakshatraFromMoon(moonLongitude);

  const startLord = nakshatra.lord;
  const startLordIndex = DASHA_LORDS.findIndex(d => d.planet === startLord);

  const timeline = [];
  let currentDate = new Date(birthDate);

  // 1st Mahadasha has remaining balance
  const firstDasha = DASHA_LORDS[startLordIndex];
  const firstRemainingYears = firstDasha.years * remainingFraction;
  const firstDays = firstRemainingYears * 365.25;
  const firstEndDate = new Date(currentDate.getTime() + (firstDays * 24 * 60 * 60 * 1000));

  timeline.push({
    planet: firstDasha.planet,
    sanskrit: firstDasha.sanskrit,
    totalYears: firstDasha.years,
    remainingYearsAtBirth: Math.round(firstRemainingYears * 10) / 10,
    startDate: currentDate.toISOString().split('T')[0],
    endDate: firstEndDate.toISOString().split('T')[0],
    description: firstDasha.description,
    antardashas: calculateAntardashas(firstDasha.planet, currentDate, firstRemainingYears)
  });

  currentDate = firstEndDate;

  // Next 8 Mahadashas (full cycle)
  for (let i = 1; i < 9; i++) {
    const dasha = DASHA_LORDS[(startLordIndex + i) % 9];
    const days = dasha.years * 365.25;
    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate.getTime() + (days * 24 * 60 * 60 * 1000));
    currentDate = endDate;

    timeline.push({
      planet: dasha.planet,
      sanskrit: dasha.sanskrit,
      totalYears: dasha.years,
      remainingYearsAtBirth: dasha.years,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      description: dasha.description,
      antardashas: calculateAntardashas(dasha.planet, startDate, dasha.years)
    });
  }

  return {
    birthDate: birthDateStr,
    birthNakshatra: nakshatra.name,
    nakshatraLord: nakshatra.lord,
    birthDashaLord: nakshatra.lord,
    timeline
  };
}

/**
 * Determine currently active Mahadasha and Antardasha for a target date
 */
function getCurrentDasha(birthDateStr = '1995-05-15', moonLongitude = 45.5, targetDateStr = null) {
  const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
  const timelineResult = calculateVimshottariTimeline(birthDateStr, moonLongitude);
  const timeline = timelineResult.timeline;

  let activeMaha = null;
  let activeAntar = null;

  for (const m of timeline) {
    const mStart = new Date(m.startDate);
    const mEnd = new Date(m.endDate);

    if (targetDate >= mStart && targetDate <= mEnd) {
      activeMaha = m;
      for (const a of m.antardashas) {
        const aStart = new Date(a.startDate);
        const aEnd = new Date(a.endDate);
        if (targetDate >= aStart && targetDate <= aEnd) {
          activeAntar = a;
          break;
        }
      }
      break;
    }
  }

  if (!activeMaha && timeline.length > 0) {
    activeMaha = timeline[0];
    activeAntar = activeMaha.antardashas[0];
  }

  const mahaEndDate = new Date(activeMaha.endDate);
  const remainingTimeMs = Math.max(0, mahaEndDate - targetDate);
  const remainingYears = Math.floor(remainingTimeMs / (1000 * 60 * 60 * 24 * 365.25));
  const remainingMonths = Math.floor((remainingTimeMs % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.4375));
  const remainingDays = Math.floor((remainingTimeMs % (1000 * 60 * 60 * 24 * 30.4375)) / (1000 * 60 * 60 * 24));

  const mahaInfo = {
    lord: activeMaha.planet,
    planet: activeMaha.planet,
    sanskrit: activeMaha.sanskrit,
    startDate: activeMaha.startDate,
    endDate: activeMaha.endDate,
    description: activeMaha.description
  };

  const antarInfo = activeAntar ? {
    lord: activeAntar.planet,
    planet: activeAntar.planet,
    sanskrit: activeAntar.sanskrit,
    startDate: activeAntar.startDate,
    endDate: activeAntar.endDate,
    description: activeAntar.description
  } : null;

  return {
    success: true,
    targetDate: targetDate.toISOString().split('T')[0],
    birthNakshatra: timelineResult.birthNakshatra,
    nakshatraLord: timelineResult.nakshatraLord,
    birthDashaLord: timelineResult.birthDashaLord,
    activeMahadasha: mahaInfo,
    activeAntardasha: antarInfo,
    currentMahadasha: mahaInfo,
    currentAntardasha: antarInfo,
    remainingInMahadasha: {
      years: remainingYears,
      months: remainingMonths,
      days: remainingDays,
      formatted: `${remainingYears} वर्ष ${remainingMonths} महिना ${remainingDays} दिन`
    },
    astrologicalGuidance: `वर्तमानमा तपाईंको ${activeMaha.planet} महादशामा ${activeAntar ? activeAntar.planet : ''} अन्तर्दशा चलिरहेको छ। यस अवधिमा ${activeMaha.sanskrit} र ${activeAntar ? activeAntar.sanskrit : ''} को ग्रह मन्त्र जप, सम्बन्धित दान र साधनाले जीवनमा सुख, शान्ति र समृद्धि प्रदान गर्नेछ।`
  };
}

module.exports = {
  NAKSHATRAS,
  DASHA_LORDS,
  getNakshatraFromMoon,
  calculateVimshottariTimeline,
  getCurrentDasha
};
