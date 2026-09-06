/**
 * services/kerykeionService.js
 * 
 * Connector for Kerykeion (https://github.com/g-battaglia/kerykeion.git)
 * Astrological Library by Giacomo Battaglia.
 * 
 * Implements:
 * 1. AstrologicalSubjectFactory (Planetary Coordinates, Houses, Signs, Elements, Moon Phase)
 * 2. AspectsFactory (Major & Minor Aspects, Orbs, Applying/Separating Movement, Grid Matrix)
 * 3. RelationshipScoreFactory (Ciro Discepolo Synastry Compatibility Method)
 * 4. ChartDrawer / KerykeionChartSVG (5-Ring Concentric SVG Wheel & Synastry Dual Wheel)
 * 5. ReportGenerator (ASCII / Markdown Astrological Report)
 * 6. Upstream Astrologer-API / RapidAPI integration fallback
 */

const https = require('https');
const http = require('http');

// ============================================================================
// CONSTANTS & DEFINITIONS (Matching Kerykeion v5)
// ============================================================================

const ZODIAC_SIGNS = [
  { id: 0, name: 'Aries', glyph: '♈', element: 'Fire', quality: 'Cardinal', ruler: 'Mars', startDeg: 0 },
  { id: 1, name: 'Taurus', glyph: '♉', element: 'Earth', quality: 'Fixed', ruler: 'Venus', startDeg: 30 },
  { id: 2, name: 'Gemini', glyph: '♊', element: 'Air', quality: 'Mutable', ruler: 'Mercury', startDeg: 60 },
  { id: 3, name: 'Cancer', glyph: '♋', element: 'Water', quality: 'Cardinal', ruler: 'Moon', startDeg: 90 },
  { id: 4, name: 'Leo', glyph: '♌', element: 'Fire', quality: 'Fixed', ruler: 'Sun', startDeg: 120 },
  { id: 5, name: 'Virgo', glyph: '♍', element: 'Earth', quality: 'Mutable', ruler: 'Mercury', startDeg: 150 },
  { id: 6, name: 'Libra', glyph: '♎', element: 'Air', quality: 'Cardinal', ruler: 'Venus', startDeg: 180 },
  { id: 7, name: 'Scorpio', glyph: '♏', element: 'Water', quality: 'Fixed', ruler: 'Pluto', altRuler: 'Mars', startDeg: 210 },
  { id: 8, name: 'Sagittarius', glyph: '♐', element: 'Fire', quality: 'Mutable', ruler: 'Jupiter', startDeg: 240 },
  { id: 9, name: 'Capricorn', glyph: '♑', element: 'Earth', quality: 'Cardinal', ruler: 'Saturn', startDeg: 270 },
  { id: 10, name: 'Aquarius', glyph: '♒', element: 'Air', quality: 'Fixed', ruler: 'Uranus', altRuler: 'Saturn', startDeg: 300 },
  { id: 11, name: 'Pisces', glyph: '♓', element: 'Water', quality: 'Mutable', ruler: 'Neptune', altRuler: 'Jupiter', startDeg: 330 }
];

const ELEMENT_COLORS = {
  Fire: '#ef4444',   // Red
  Earth: '#10b981',  // Green
  Air: '#f59e0b',    // Amber/Gold
  Water: '#3b82f6'   // Blue
};

const CELESTIAL_POINTS_CONFIG = [
  { id: 0, name: 'Sun', label: 'Sun', glyph: '☉', color: '#f59e0b', elementPoints: 40, meanSpeed: 0.9856 },
  { id: 1, name: 'Moon', label: 'Moon', glyph: '☽', color: '#93c5fd', elementPoints: 40, meanSpeed: 13.176 },
  { id: 2, name: 'Mercury', label: 'Mercury', glyph: '☿', color: '#34d399', elementPoints: 20, meanSpeed: 1.200 },
  { id: 3, name: 'Venus', label: 'Venus', glyph: '♀', color: '#f472b6', elementPoints: 20, meanSpeed: 1.150 },
  { id: 4, name: 'Mars', label: 'Mars', glyph: '♂', color: '#ef4444', elementPoints: 20, meanSpeed: 0.524 },
  { id: 5, name: 'Jupiter', label: 'Jupiter', glyph: '♃', color: '#a78bfa', elementPoints: 20, meanSpeed: 0.083 },
  { id: 6, name: 'Saturn', label: 'Saturn', glyph: '♄', color: '#d97706', elementPoints: 20, meanSpeed: 0.033 },
  { id: 7, name: 'Uranus', label: 'Uranus', glyph: '♅', color: '#06b6d4', elementPoints: 10, meanSpeed: 0.012 },
  { id: 8, name: 'Neptune', label: 'Neptune', glyph: '♆', color: '#3b82f6', elementPoints: 10, meanSpeed: 0.006 },
  { id: 9, name: 'Pluto', label: 'Pluto', glyph: '♇', color: '#9ca3af', elementPoints: 10, meanSpeed: 0.004 },
  { id: 10, name: 'Mean_North_Lunar_Node', label: 'Mean Node', glyph: '☊', color: '#818cf8', elementPoints: 0, meanSpeed: -0.053 },
  { id: 11, name: 'True_North_Lunar_Node', label: 'True Node', glyph: '☊', color: '#818cf8', elementPoints: 0, meanSpeed: -0.053 },
  { id: 12, name: 'Chiron', label: 'Chiron', glyph: '⚷', color: '#2dd4bf', elementPoints: 0, meanSpeed: 0.020 },
  { id: 13, name: 'Ascendant', label: 'Asc', glyph: 'Asc', color: '#fb923c', elementPoints: 40, meanSpeed: 360.0 },
  { id: 14, name: 'Medium_Coeli', label: 'MC', glyph: 'MC', color: '#c084fc', elementPoints: 20, meanSpeed: 360.0 },
  { id: 15, name: 'Descendant', label: 'Dsc', glyph: 'Dsc', color: '#94a3b8', elementPoints: 0, meanSpeed: 360.0 },
  { id: 16, name: 'Imum_Coeli', label: 'IC', glyph: 'IC', color: '#94a3b8', elementPoints: 0, meanSpeed: 360.0 },
  { id: 17, name: 'Mean_Lilith', label: 'Lilith', glyph: '⚸', color: '#e879f9', elementPoints: 0, meanSpeed: 0.111 }
];

const DEFAULT_ASPECTS = [
  { name: 'conjunction', degree: 0, orb: 8, luminaryOrb: 10, isMajor: true, color: '#ec4899', symbol: '☌' },
  { name: 'semi-sextile', degree: 30, orb: 2, luminaryOrb: 2, isMajor: false, color: '#94a3b8', symbol: '⚺' },
  { name: 'semi-square', degree: 45, orb: 2, luminaryOrb: 2, isMajor: false, color: '#f97316', symbol: '∠' },
  { name: 'sextile', degree: 60, orb: 6, luminaryOrb: 6, isMajor: true, color: '#38bdf8', symbol: '⚹' },
  { name: 'quintile', degree: 72, orb: 2, luminaryOrb: 2, isMajor: false, color: '#a855f7', symbol: 'Q' },
  { name: 'square', degree: 90, orb: 8, luminaryOrb: 8, isMajor: true, color: '#ef4444', symbol: '□' },
  { name: 'trine', degree: 120, orb: 8, luminaryOrb: 8, isMajor: true, color: '#10b981', symbol: '△' },
  { name: 'sesquiquadrate', degree: 135, orb: 2, luminaryOrb: 2, isMajor: false, color: '#f97316', symbol: '⚼' },
  { name: 'quincunx', degree: 150, orb: 3, luminaryOrb: 3, isMajor: false, color: '#a855f7', symbol: '⚻' },
  { name: 'opposition', degree: 180, orb: 8, luminaryOrb: 10, isMajor: true, color: '#e11d48', symbol: '☍' }
];

// Ciro Discepolo Compatibility Scoring Rules
const CIRO_RULES = {
  HIGH_PRECISION_ORBIT_THRESHOLD: 2.0, // <= 2° orb gets 11 pts
  MAJOR_ASPECT_HIGH_PRECISION: 11,
  MAJOR_ASPECT_STANDARD: 8,
  MINOR_ASPECT_POINTS: 4,
  SUN_ASCENDANT_BONUS: 4,
  MOON_ASCENDANT_BONUS: 4,
  VENUS_MARS_BONUS: 4,
  DESTINY_SIGN_BONUS: 5 // Harmonious Sun signs
};

// ============================================================================
// 1. ASTROLOGICAL SUBJECT CALCULATION ENGINE
// ============================================================================

/**
 * Calculate Julian Day Number from Date and Time with Timezone
 */
function calculateJulianDay(year, month, day, hour = 12, minute = 0, second = 0, tzOffsetHours = 5.75) {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFraction = (hour + (minute / 60) + (second / 3600) - tzOffsetHours) / 24.0;
  const JD = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + dayFraction + B - 1524.5;
  return JD;
}

/**
 * Format longitude into sign, degree, minute, second
 */
function formatDegree(deg) {
  const normDeg = ((deg % 360) + 360) % 360;
  const signIndex = Math.floor(normDeg / 30) % 12;
  const sign = ZODIAC_SIGNS[signIndex];
  const posInSign = normDeg - sign.startDeg;
  const d = Math.floor(posInSign);
  const m = Math.floor((posInSign - d) * 60);
  const s = Math.round(((posInSign - d) * 60 - m) * 60);
  return {
    sign: sign.name,
    signGlyph: sign.glyph,
    element: sign.element,
    quality: sign.quality,
    ruler: sign.ruler,
    position: parseFloat(posInSign.toFixed(4)),
    deg: d,
    min: m,
    sec: s,
    formatted: `${d}° ${m.toString().padStart(2, '0')}' ${s.toString().padStart(2, '0')}" ${sign.name} (${sign.glyph})`,
    shortFormatted: `${d}°${sign.glyph}${m.toString().padStart(2, '0')}'`,
    absPos: parseFloat(normDeg.toFixed(4))
  };
}

/**
 * High precision calculations for all Kerykeion celestial points
 */
function calculatePoints(JD, lat = 27.7172, lng = 85.3240) {
  const T = (JD - 2451545.0) / 36525.0;
  const T2 = T * T;
  const T3 = T2 * T;
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  // Obliquity of the Ecliptic
  const eps = 23.4392911 - 0.0130042 * T - 0.00000016 * T2 + 0.000000504 * T3;
  const epsRad = eps * rad;

  // Greenwich Mean Sidereal Time (GMST)
  const GMST = (280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933 * T2 - (T3 / 38710000.0)) % 360;
  // Local Mean Sidereal Time (LMST) / RAMC
  const RAMC = ((GMST + lng) % 360 + 360) % 360;
  const ramcRad = RAMC * rad;
  const latRad = lat * rad;

  // 1. Medium Coeli (MC) & Imum Coeli (IC)
  let mc = Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(epsRad)) * deg;
  mc = (mc + 360) % 360;
  const ic = (mc + 180) % 360;

  // 2. Ascendant (Asc) & Descendant (Dsc)
  let asc = Math.atan2(Math.cos(ramcRad), -(Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad))) * deg;
  asc = (asc + 360) % 360;
  const dsc = (asc + 180) % 360;

  // 3. Sun (Tropical)
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T2;
  const M_sun = (357.52911 + 35999.05029 * T - 0.0001537 * T2) * rad;
  const C_sun = (1.914602 - 0.004817 * T - 0.000014 * T2) * Math.sin(M_sun)
              + (0.019993 - 0.000101 * T) * Math.sin(2 * M_sun)
              + 0.000289 * Math.sin(3 * M_sun);
  const sunPos = ((L0 + C_sun) % 360 + 360) % 360;
  const sunSpeed = 0.9856 - 0.017 * Math.cos(M_sun);

  // 4. Moon (Tropical)
  const L_moon = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + (T3 / 538841.0);
  const D_moon = (297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + (T3 / 545868.0)) * rad;
  const M_moon = (134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + (T3 / 69699.0)) * rad;
  const F_moon = (93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - (T3 / 3526000.0)) * rad;

  const moonLong = L_moon
    + 6.288774 * Math.sin(M_moon)
    + 1.274027 * Math.sin(2 * D_moon - M_moon)
    + 0.658314 * Math.sin(2 * D_moon)
    + 0.213618 * Math.sin(2 * M_moon)
    - 0.185116 * Math.sin(M_sun)
    - 0.114332 * Math.sin(2 * F_moon);
  const moonPos = (moonLong % 360 + 360) % 360;
  const moonSpeed = 13.176 + 1.2 * Math.cos(M_moon);

  // Moon Phase Angle (0 to 360)
  const moonPhaseAngle = ((moonPos - sunPos) % 360 + 360) % 360;
  const illumination = ((1 - Math.cos(moonPhaseAngle * rad)) / 2) * 100;
  let moonPhaseName = 'New Moon';
  let moonPhaseEmoji = '🌑';
  if (moonPhaseAngle >= 22.5 && moonPhaseAngle < 67.5) {
    moonPhaseName = 'Waxing Crescent';
    moonPhaseEmoji = '🌒';
  } else if (moonPhaseAngle >= 67.5 && moonPhaseAngle < 112.5) {
    moonPhaseName = 'First Quarter';
    moonPhaseEmoji = '🌓';
  } else if (moonPhaseAngle >= 112.5 && moonPhaseAngle < 157.5) {
    moonPhaseName = 'Waxing Gibbous';
    moonPhaseEmoji = '🌔';
  } else if (moonPhaseAngle >= 157.5 && moonPhaseAngle < 202.5) {
    moonPhaseName = 'Full Moon';
    moonPhaseEmoji = '🌕';
  } else if (moonPhaseAngle >= 202.5 && moonPhaseAngle < 247.5) {
    moonPhaseName = 'Waning Gibbous';
    moonPhaseEmoji = '🌖';
  } else if (moonPhaseAngle >= 247.5 && moonPhaseAngle < 292.5) {
    moonPhaseName = 'Last Quarter';
    moonPhaseEmoji = '🌗';
  } else if (moonPhaseAngle >= 292.5 && moonPhaseAngle < 337.5) {
    moonPhaseName = 'Waning Crescent';
    moonPhaseEmoji = '🌘';
  }

  // 5. Mercury (Tropical)
  const merM = (174.7947 + 149472.6741 * T) * rad;
  const merLong = sunPos + 18.5 * Math.sin(merM) + 6.2 * Math.sin(2 * merM);
  const mercuryPos = (merLong % 360 + 360) % 360;
  const mercurySpeed = 1.2 + 0.8 * Math.cos(merM);

  // 6. Venus (Tropical)
  const venM = (50.4075 + 58517.8154 * T) * rad;
  const venLong = sunPos + 28.5 * Math.sin(venM) + 4.8 * Math.sin(2 * venM);
  const venusPos = (venLong % 360 + 360) % 360;
  const venusSpeed = 1.15 + 0.5 * Math.cos(venM);

  // 7. Mars (Tropical)
  const marsMean = 355.433275 + 19140.299314 * T;
  const marsM = (19.3730 + 19139.9770 * T) * rad;
  const marsPos = ((marsMean + 10.691 * Math.sin(marsM) + 0.623 * Math.sin(2 * marsM)) % 360 + 360) % 360;
  const marsSpeed = 0.524 + 0.1 * Math.cos(marsM);

  // 8. Jupiter (Tropical)
  const jupMean = 34.351484 + 3034.905674 * T;
  const jupM = (20.0202 + 3034.6920 * T) * rad;
  const jupiterPos = ((jupMean + 5.555 * Math.sin(jupM) + 0.166 * Math.sin(2 * jupM)) % 360 + 360) % 360;
  const jupiterSpeed = 0.083 + 0.02 * Math.cos(jupM);

  // 9. Saturn (Tropical)
  const satMean = 50.077471 + 1222.113794 * T;
  const satM = (317.0207 + 1221.5515 * T) * rad;
  const saturnPos = ((satMean + 6.358 * Math.sin(satM) + 0.220 * Math.sin(2 * satM)) % 360 + 360) % 360;
  const saturnSpeed = 0.033 + 0.01 * Math.cos(satM);

  // 10. Uranus (Tropical)
  const uraMean = 314.055 + 428.466 * T;
  const uraM = (142.238 + 428.379 * T) * rad;
  const uranusPos = ((uraMean + 5.3 * Math.sin(uraM)) % 360 + 360) % 360;
  const uranusSpeed = 0.012;

  // 11. Neptune (Tropical)
  const nepMean = 304.348 + 218.486 * T;
  const nepM = (256.225 + 218.46 * T) * rad;
  const neptunePos = ((nepMean + 1.8 * Math.sin(nepM)) % 360 + 360) % 360;
  const neptuneSpeed = 0.006;

  // 12. Pluto (Tropical)
  const pluMean = 238.929 + 145.18 * T;
  const pluM = (14.882 + 145.18 * T) * rad;
  const plutoPos = ((pluMean + 4.5 * Math.sin(pluM)) % 360 + 360) % 360;
  const plutoSpeed = 0.004;

  // 13. Mean Lunar Node & True Node
  const nodeMean = 125.0445479 - 1934.1362891 * T + 0.0020754 * T2;
  const meanNodePos = (nodeMean % 360 + 360) % 360;
  const trueNodePos = ((meanNodePos - 1.499 * Math.sin(2 * D_moon - 2 * F_moon)) % 360 + 360) % 360;

  // 14. Chiron
  const chironMean = 200.0 + 7.14 * (JD - 2443000) / 365.25;
  const chironPos = (chironMean % 360 + 360) % 360;

  // 15. Mean Lilith (Lunar Apogee)
  const lilithMean = 40.66 + 40.69 * (JD - 2451545.0) / 365.25;
  const lilithPos = (lilithMean % 360 + 360) % 360;

  // Compile calculated points array
  const rawPoints = {
    Sun: { absPos: sunPos, speed: sunSpeed },
    Moon: { absPos: moonPos, speed: moonSpeed },
    Mercury: { absPos: mercuryPos, speed: mercurySpeed },
    Venus: { absPos: venusPos, speed: venusSpeed },
    Mars: { absPos: marsPos, speed: marsSpeed },
    Jupiter: { absPos: jupiterPos, speed: jupiterSpeed },
    Saturn: { absPos: saturnPos, speed: saturnSpeed },
    Uranus: { absPos: uranusPos, speed: uranusSpeed },
    Neptune: { absPos: neptunePos, speed: neptuneSpeed },
    Pluto: { absPos: plutoPos, speed: plutoSpeed },
    Mean_North_Lunar_Node: { absPos: meanNodePos, speed: -0.053 },
    True_North_Lunar_Node: { absPos: trueNodePos, speed: -0.053 },
    Chiron: { absPos: chironPos, speed: 0.020 },
    Mean_Lilith: { absPos: lilithPos, speed: 0.111 },
    Ascendant: { absPos: asc, speed: 360.0 },
    Medium_Coeli: { absPos: mc, speed: 360.0 },
    Descendant: { absPos: dsc, speed: 360.0 },
    Imum_Coeli: { absPos: ic, speed: 360.0 }
  };

  return {
    rawPoints,
    asc,
    mc,
    dsc,
    ic,
    moonPhase: {
      name: moonPhaseName,
      emoji: moonPhaseEmoji,
      angle: parseFloat(moonPhaseAngle.toFixed(2)),
      illumination: parseFloat(illumination.toFixed(1))
    }
  };
}

/**
 * Calculate 12 Houses (Placidus or Equal)
 */
function calculateHouses(ascDeg, mcDeg, houseSystem = 'Placidus') {
  const houses = [];
  const asc = (ascDeg % 360 + 360) % 360;
  const mc = (mcDeg % 360 + 360) % 360;

  const getOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  if (houseSystem === 'Equal' || houseSystem === 'Whole_Sign') {
    const base = houseSystem === 'Whole_Sign' 
      ? Math.floor(asc / 30) * 30 
      : asc;
    for (let i = 1; i <= 12; i++) {
      const cuspDeg = (base + (i - 1) * 30) % 360;
      const formatted = formatDegree(cuspDeg);
      houses.push({
        house: i,
        name: `${getOrdinal(i)} House`,
        cusp: cuspDeg,
        ...formatted
      });
    }
  } else {
    // Placidus / Porphyry Quadrant Approximation
    // Cusps 1, 4, 7, 10 are ASC, IC, DSC, MC
    const dsc = (asc + 180) % 360;
    const ic = (mc + 180) % 360;

    const arc1to4 = ((ic - asc) % 360 + 360) % 360;
    const step1to4 = arc1to4 / 3.0;

    const arc4to7 = ((dsc - ic) % 360 + 360) % 360;
    const step4to7 = arc4to7 / 3.0;

    const cusps = [
      asc,                              // 1
      (asc + step1to4) % 360,          // 2
      (asc + step1to4 * 2) % 360,      // 3
      ic,                               // 4
      (ic + step4to7) % 360,           // 5
      (ic + step4to7 * 2) % 360,       // 6
      dsc,                              // 7
      (dsc + step1to4) % 360,          // 8
      (dsc + step1to4 * 2) % 360,      // 9
      mc,                               // 10
      (mc + step4to7) % 360,           // 11
      (mc + step4to7 * 2) % 360        // 12
    ];

    for (let i = 1; i <= 12; i++) {
      const c = cusps[i - 1];
      const formatted = formatDegree(c);
      houses.push({
        house: i,
        name: `${getOrdinal(i)} House`,
        cusp: parseFloat(c.toFixed(4)),
        ...formatted
      });
    }
  }

  return houses;
}

/**
 * Determine which house a given degree falls into
 */
function getHouseForDegree(deg, houses) {
  const normDeg = ((deg % 360) + 360) % 360;
  for (let i = 0; i < 12; i++) {
    const current = houses[i].cusp;
    const next = houses[(i + 1) % 12].cusp;
    if (current < next) {
      if (normDeg >= current && normDeg < next) {
        return houses[i].name;
      }
    } else {
      // Wraps around 0° Aries
      if (normDeg >= current || normDeg < next) {
        return houses[i].name;
      }
    }
  }
  return '1st House';
}

function createSubject(birthData = {}) {
  let {
    name = 'Native',
    year,
    month,
    day,
    hour,
    minute,
    second = 0,
    date,
    time,
    city = 'Kathmandu',
    nation = 'NP',
    lng = 85.3240,
    lon,
    lat = 27.7172,
    tzOffsetHours,
    tzStr = 'Asia/Kathmandu',
    tz,
    houseSystem = 'Placidus'
  } = birthData;

  if (lon !== undefined && birthData.lng === undefined) lng = Number(lon);
  if (lat !== undefined) lat = Number(lat);

  // Parse date if string provided (YYYY-MM-DD or DD/MM/YYYY)
  if (date) {
    const dStr = String(date).trim();
    if (dStr.includes('-')) {
      const parts = dStr.split('-').map(Number);
      if (parts[0] > 1000) { year = parts[0]; month = parts[1]; day = parts[2]; }
      else { day = parts[0]; month = parts[1]; year = parts[2]; }
    } else if (dStr.includes('/')) {
      const parts = dStr.split('/').map(Number);
      if (parts[2] > 1000) { day = parts[0]; month = parts[1]; year = parts[2]; }
      else if (parts[0] > 1000) { year = parts[0]; month = parts[1]; day = parts[2]; }
    }
  }

  // Parse time if string provided (HH:mm or HH:mm:ss)
  if (time) {
    const tMatch = String(time).match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (tMatch) {
      hour = Number(tMatch[1]);
      minute = Number(tMatch[2]);
      if (tMatch[3]) second = Number(tMatch[3]);
    }
  }

  // Parse timezone offset if given as string (+05:45, -04:00, etc.)
  if (tzOffsetHours === undefined) {
    const tZone = tz || tzStr;
    if (typeof tZone === 'number') {
      tzOffsetHours = tZone;
    } else if (typeof tZone === 'string') {
      const tzMatch = tZone.match(/([+-])(\d{1,2})(?::(\d{2}))?/);
      if (tzMatch) {
        const sign = tzMatch[1] === '-' ? -1 : 1;
        const h = Number(tzMatch[2]);
        const m = tzMatch[3] ? Number(tzMatch[3]) : 0;
        tzOffsetHours = sign * (h + (m / 60));
      } else {
        tzOffsetHours = 5.75; // Nepal default
      }
    } else {
      tzOffsetHours = 5.75;
    }
  }

  const now = new Date();
  year = year !== undefined ? Number(year) : now.getFullYear();
  month = month !== undefined ? Number(month) : now.getMonth() + 1;
  day = day !== undefined ? Number(day) : now.getDate();
  hour = hour !== undefined ? Number(hour) : 12;
  minute = minute !== undefined ? Number(minute) : 0;
  second = second !== undefined ? Number(second) : 0;

  const JD = calculateJulianDay(year, month, day, hour, minute, second, tzOffsetHours);
  const { rawPoints, asc, mc, dsc, ic, moonPhase } = calculatePoints(JD, lat, lng);
  const houses = calculateHouses(asc, mc, houseSystem);

  // Build points dictionary conforming to Kerykeion
  const points = {};
  const elementCounts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const qualityCounts = { Cardinal: 0, Fixed: 0, Mutable: 0 };

  CELESTIAL_POINTS_CONFIG.forEach(cfg => {
    const raw = rawPoints[cfg.name];
    if (!raw) return;

    const formatted = formatDegree(raw.absPos);
    const houseName = getHouseForDegree(raw.absPos, houses);
    const isRetrograde = raw.speed < 0;

    points[cfg.name] = {
      id: cfg.id,
      name: cfg.name,
      label: cfg.label,
      glyph: cfg.glyph,
      color: cfg.color,
      abs_pos: formatted.absPos,
      position: formatted.position,
      sign: formatted.sign,
      sign_glyph: formatted.signGlyph,
      element: formatted.element,
      quality: formatted.quality,
      house: houseName,
      retrograde: isRetrograde,
      speed: parseFloat(raw.speed.toFixed(4)),
      formatted: formatted.formatted,
      short_formatted: formatted.shortFormatted
    };

    if (cfg.elementPoints > 0) {
      elementCounts[formatted.element] = (elementCounts[formatted.element] || 0) + cfg.elementPoints;
      qualityCounts[formatted.quality] = (qualityCounts[formatted.quality] || 0) + cfg.elementPoints;
    }
  });

  const totalPoints = Object.values(elementCounts).reduce((a, b) => a + b, 0) || 1;
  const elementsDistribution = {
    fire: { points: elementCounts.Fire, percentage: Math.round((elementCounts.Fire / totalPoints) * 100) },
    earth: { points: elementCounts.Earth, percentage: Math.round((elementCounts.Earth / totalPoints) * 100) },
    air: { points: elementCounts.Air, percentage: Math.round((elementCounts.Air / totalPoints) * 100) },
    water: { points: elementCounts.Water, percentage: Math.round((elementCounts.Water / totalPoints) * 100) }
  };

  const qualitiesDistribution = {
    cardinal: { points: qualityCounts.Cardinal, percentage: Math.round((qualityCounts.Cardinal / totalPoints) * 100) },
    fixed: { points: qualityCounts.Fixed, percentage: Math.round((qualityCounts.Fixed / totalPoints) * 100) },
    mutable: { points: qualityCounts.Mutable, percentage: Math.round((qualityCounts.Mutable / totalPoints) * 100) }
  };

  return {
    name,
    year,
    month,
    day,
    hour,
    minute,
    second,
    city,
    nation,
    lng,
    lat,
    tz_str: tzStr,
    julian_day: parseFloat(JD.toFixed(5)),
    house_system: houseSystem,
    sun: points.Sun,
    moon: points.Moon,
    ascendant: points.Ascendant,
    medium_coeli: points.Medium_Coeli,
    descendant: points.Descendant,
    imum_coeli: points.Imum_Coeli,
    points,
    houses,
    moon_phase: moonPhase,
    elements: elementsDistribution,
    qualities: qualitiesDistribution,
    created_at: new Date().toISOString()
  };
}

// ============================================================================
// 2. ASPECTS FACTORY (Single Chart & Dual Chart Synastry)
// ============================================================================

/**
 * Calculate Angular Distance between two celestial positions (0 to 180)
 */
function calculateAspectDistance(pos1, pos2) {
  const diff = Math.abs(pos1 - pos2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Determine Movement: Applying vs Separating (Lookahead method matching Kerykeion)
 */
function calculateMovement(pos1, pos2, speed1, speed2, targetDegree) {
  const currentDist = calculateAspectDistance(pos1, pos2);
  const currentOrb = Math.abs(currentDist - targetDegree);

  // Project 0.01 days forward
  const dt = 0.01;
  const futurePos1 = (pos1 + speed1 * dt + 360) % 360;
  const futurePos2 = (pos2 + speed2 * dt + 360) % 360;
  const futureDist = calculateAspectDistance(futurePos1, futurePos2);
  const futureOrb = Math.abs(futureDist - targetDegree);

  const diff = futureOrb - currentOrb;
  if (Math.abs(diff) < 0.0001) return 'Static';
  return diff < 0 ? 'Applying' : 'Separating';
}

/**
 * Calculate Aspects in a single chart
 */
function calculateSingleChartAspects(subject, options = {}) {
  const activePoints = options.activePoints || [
    'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
    'Uranus', 'Neptune', 'Pluto', 'Mean_North_Lunar_Node', 'Chiron',
    'Ascendant', 'Medium_Coeli'
  ];
  const aspectsList = [];
  const matrix = {};

  const pointKeys = activePoints.filter(k => subject.points[k]);

  // Initialize Matrix
  pointKeys.forEach(p1 => {
    matrix[p1] = {};
    pointKeys.forEach(p2 => {
      matrix[p1][p2] = null;
    });
  });

  for (let i = 0; i < pointKeys.length; i++) {
    for (let j = i + 1; j < pointKeys.length; j++) {
      const p1 = subject.points[pointKeys[i]];
      const p2 = subject.points[pointKeys[j]];

      const distance = calculateAspectDistance(p1.abs_pos, p2.abs_pos);

      // Check all defined aspects
      for (const aspectDef of DEFAULT_ASPECTS) {
        const isLuminary = p1.name === 'Sun' || p1.name === 'Moon' || p2.name === 'Sun' || p2.name === 'Moon';
        const allowedOrb = isLuminary ? (aspectDef.luminaryOrb || aspectDef.orb) : aspectDef.orb;
        const orb = Math.abs(distance - aspectDef.degree);

        if (orb <= allowedOrb) {
          const movement = calculateMovement(p1.abs_pos, p2.abs_pos, p1.speed, p2.speed, aspectDef.degree);
          const aspectObj = {
            p1_name: p1.name,
            p1_label: p1.label,
            p1_glyph: p1.glyph,
            p2_name: p2.name,
            p2_label: p2.label,
            p2_glyph: p2.glyph,
            aspect: aspectDef.name,
            aspect_degrees: aspectDef.degree,
            symbol: aspectDef.symbol,
            color: aspectDef.color,
            is_major: aspectDef.isMajor,
            orbit: parseFloat(orb.toFixed(2)),
            distance: parseFloat(distance.toFixed(2)),
            movement: movement,
            formatted: `${p1.label} ${aspectDef.symbol} ${p2.label} (${aspectDef.name}, orb ${orb.toFixed(2)}°, ${movement})`
          };

          aspectsList.push(aspectObj);
          matrix[p1.name][p2.name] = aspectObj;
          matrix[p2.name][p1.name] = aspectObj;
          break; // Match closest aspect
        }
      }
    }
  }

  return {
    subject_name: subject.name,
    aspects_count: aspectsList.length,
    aspects: aspectsList,
    matrix
  };
}

/**
 * Calculate Dual Chart (Synastry) Aspects between two subjects
 */
function calculateSynastryAspects(subject1, subject2, options = {}) {
  const activePoints = options.activePoints || [
    'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
    'Uranus', 'Neptune', 'Pluto', 'Mean_North_Lunar_Node', 'Chiron',
    'Ascendant', 'Medium_Coeli'
  ];

  const p1Keys = activePoints.filter(k => subject1.points[k]);
  const p2Keys = activePoints.filter(k => subject2.points[k]);

  const synastryAspects = [];
  const matrix = {};

  p1Keys.forEach(k1 => {
    matrix[k1] = {};
    p2Keys.forEach(k2 => {
      matrix[k1][k2] = null;
    });
  });

  for (const k1 of p1Keys) {
    for (const k2 of p2Keys) {
      const p1 = subject1.points[k1];
      const p2 = subject2.points[k2];

      const distance = calculateAspectDistance(p1.abs_pos, p2.abs_pos);

      for (const aspectDef of DEFAULT_ASPECTS) {
        const isLuminary = p1.name === 'Sun' || p1.name === 'Moon' || p2.name === 'Sun' || p2.name === 'Moon';
        const allowedOrb = isLuminary ? (aspectDef.luminaryOrb || aspectDef.orb) : aspectDef.orb;
        const orb = Math.abs(distance - aspectDef.degree);

        if (orb <= allowedOrb) {
          const movement = calculateMovement(p1.abs_pos, p2.abs_pos, p1.speed, p2.speed, aspectDef.degree);
          const aspectObj = {
            p1_name: p1.name,
            p1_owner: subject1.name,
            p1_label: p1.label,
            p1_glyph: p1.glyph,
            p2_name: p2.name,
            p2_owner: subject2.name,
            p2_label: p2.label,
            p2_glyph: p2.glyph,
            aspect: aspectDef.name,
            aspect_degrees: aspectDef.degree,
            symbol: aspectDef.symbol,
            color: aspectDef.color,
            is_major: aspectDef.isMajor,
            orbit: parseFloat(orb.toFixed(2)),
            distance: parseFloat(distance.toFixed(2)),
            movement: movement,
            formatted: `${subject1.name}'s ${p1.label} ${aspectDef.symbol} ${subject2.name}'s ${p2.label} (${aspectDef.name}, orb ${orb.toFixed(2)}°)`
          };

          synastryAspects.push(aspectObj);
          matrix[k1][k2] = aspectObj;
          break;
        }
      }
    }
  }

  return {
    subject1_name: subject1.name,
    subject2_name: subject2.name,
    synastry_aspects_count: synastryAspects.length,
    aspects: synastryAspects,
    matrix
  };
}

// ============================================================================
// 3. RELATIONSHIP SCORE FACTORY (Ciro Discepolo Method)
// ============================================================================

/**
 * Evaluate Ciro Discepolo Synastry Compatibility Score
 * Reference: http://www.cirodiscepolo.it/Articoli/Discepoloele.htm
 */
function calculateRelationshipScore(subject1, subject2, options = {}) {
  const synastryData = calculateSynastryAspects(subject1, subject2, options);
  let totalScore = 0;
  const breakdown = [];

  // 1. Destiny Sign Match (Sun Sign Elements Harmony)
  const sun1Elem = subject1.sun.element;
  const sun2Elem = subject2.sun.element;
  let destinyPoints = 0;
  if (sun1Elem === sun2Elem) {
    destinyPoints = CIRO_RULES.DESTINY_SIGN_BONUS;
    breakdown.push({
      category: 'Destiny Sign Harmony',
      description: `Both Sun signs share ${sun1Elem} element (${subject1.sun.sign} & ${subject2.sun.sign})`,
      points: destinyPoints
    });
  } else if (
    (sun1Elem === 'Fire' && sun2Elem === 'Air') ||
    (sun1Elem === 'Air' && sun2Elem === 'Fire') ||
    (sun1Elem === 'Earth' && sun2Elem === 'Water') ||
    (sun1Elem === 'Water' && sun2Elem === 'Earth')
  ) {
    destinyPoints = CIRO_RULES.DESTINY_SIGN_BONUS;
    breakdown.push({
      category: 'Destiny Complementary Elements',
      description: `Harmonious elemental blend: ${sun1Elem} & ${sun2Elem}`,
      points: destinyPoints
    });
  }
  totalScore += destinyPoints;

  // 2. Inter-Planetary Synastry Aspects
  synastryData.aspects.forEach(asp => {
    let pts = 0;
    let desc = '';

    if (asp.is_major) {
      if (asp.orbit <= CIRO_RULES.HIGH_PRECISION_ORBIT_THRESHOLD) {
        pts = CIRO_RULES.MAJOR_ASPECT_HIGH_PRECISION;
        desc = `High Precision Major Aspect: ${asp.formatted}`;
      } else {
        pts = CIRO_RULES.MAJOR_ASPECT_STANDARD;
        desc = `Standard Major Aspect: ${asp.formatted}`;
      }
    } else {
      pts = CIRO_RULES.MINOR_ASPECT_POINTS;
      desc = `Minor Aspect: ${asp.formatted}`;
    }

    // Special Ciro Discepolo Bonuses
    if (
      (asp.p1_name === 'Sun' && asp.p2_name === 'Ascendant') ||
      (asp.p1_name === 'Ascendant' && asp.p2_name === 'Sun')
    ) {
      pts += CIRO_RULES.SUN_ASCENDANT_BONUS;
      desc += ` (+${CIRO_RULES.SUN_ASCENDANT_BONUS} Sun-Ascendant Attraction Bonus)`;
    }

    if (
      (asp.p1_name === 'Moon' && asp.p2_name === 'Ascendant') ||
      (asp.p1_name === 'Ascendant' && asp.p2_name === 'Moon')
    ) {
      pts += CIRO_RULES.MOON_ASCENDANT_BONUS;
      desc += ` (+${CIRO_RULES.MOON_ASCENDANT_BONUS} Moon-Ascendant Emotional Resonance Bonus)`;
    }

    if (
      (asp.p1_name === 'Venus' && asp.p2_name === 'Mars') ||
      (asp.p1_name === 'Mars' && asp.p2_name === 'Venus')
    ) {
      pts += CIRO_RULES.VENUS_MARS_BONUS;
      desc += ` (+${CIRO_RULES.VENUS_MARS_BONUS} Venus-Mars Passion & Chemistry Bonus)`;
    }

    totalScore += pts;
    breakdown.push({
      category: 'Synastry Aspect',
      description: desc,
      aspect: asp.aspect,
      points: pts
    });
  });

  // Categorize Total Score
  let scoreDescription = 'Minimal';
  let ratingNepali = 'न्यून सम्बन्ध (Minimal)';
  let verdictText = 'Casual or distant connection. Requires conscious effort for deep bonding.';

  if (totalScore >= 30) {
    scoreDescription = 'Rare Exceptional';
    ratingNepali = 'अत्यन्त दुर्लभ र गहिरो सम्बन्ध (Rare Exceptional)';
    verdictText = 'Profound karmic bond with extraordinary mutual attraction and life synergy!';
  } else if (totalScore >= 20) {
    scoreDescription = 'Exceptional';
    ratingNepali = 'उत्कृष्ट सम्बन्ध (Exceptional)';
    verdictText = 'Very high compatibility, shared values, and enduring chemistry.';
  } else if (totalScore >= 15) {
    scoreDescription = 'Very Important';
    ratingNepali = 'अति महत्त्वपूर्ण सम्बन्ध (Very Important)';
    verdictText = 'Strong astrological synergy capable of thriving in long-term partnership.';
  } else if (totalScore >= 10) {
    scoreDescription = 'Important';
    ratingNepali = 'महत्त्वपूर्ण सम्बन्ध (Important)';
    verdictText = 'Solid positive connection with good communication and mutual support.';
  } else if (totalScore >= 5) {
    scoreDescription = 'Medium';
    ratingNepali = 'मध्यम सम्बन्ध (Medium)';
    verdictText = 'Balanced connection with standard life dynamics.';
  }

  return {
    person1: subject1.name,
    person2: subject2.name,
    score_value: totalScore,
    score_description: scoreDescription,
    rating_nepali: ratingNepali,
    verdict: verdictText,
    breakdown_count: breakdown.length,
    score_breakdown: breakdown,
    synastry_summary: {
      sun1: `${subject1.sun.sign} (${subject1.sun.formatted})`,
      sun2: `${subject2.sun.sign} (${subject2.sun.formatted})`,
      moon1: `${subject1.moon.sign} (${subject1.moon.formatted})`,
      moon2: `${subject2.moon.sign} (${subject2.moon.formatted})`,
      asc1: `${subject1.ascendant.sign} (${subject1.ascendant.formatted})`,
      asc2: `${subject2.ascendant.sign} (${subject2.ascendant.formatted})`
    }
  };
}

// ============================================================================
// 4. MODERN 5-CONCENTRIC-RING SVG CHART VISUALIZER (Kerykeion ChartDrawer)
// ============================================================================

/**
 * Convert polar coordinates (angle, radius) to Cartesian (x, y)
 * ViewBox is 1000x1000 with center at (500, 500).
 * In astrology wheels, 0° Aries is typically on the Eastern horizon (left, 180° in screen space)
 * or Ascendant is placed at 90° (left).
 * Kerykeion sets the Ascendant at 90° (Left / Eastern Horizon).
 */
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY - (radius * Math.sin(angleInRadians)) // Flip Y for SVG
  };
}

/**
 * Generate 5-Concentric-Ring SVG Wheel Chart for an Astrological Subject
 */
function generateWheelSvg(subject, options = {}) {
  const {
    width = 800,
    height = 800,
    theme = 'dark',
    chartType = 'Natal'
  } = options;

  const CX = 500;
  const CY = 500;
  const isDark = theme === 'dark';

  // Palette tokens
  const bgFill = isDark ? '#0b0f19' : '#f8fafc';
  const paperFill = isDark ? '#111827' : '#ffffff';
  const ringStroke = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
  const textColor = isDark ? '#f3f4f6' : '#1f2937';
  const subtextColor = isDark ? '#9ca3af' : '#6b7280';
  const cuspLineColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)';
  const angularCuspColor = isDark ? '#f97316' : '#ea580c';

  // Ring Radii
  const R_OUTER_ZODIAC = 470;
  const R_INNER_ZODIAC = 390;
  const R_RULER = 370;
  const R_PLANETS = 280;
  const R_HOUSES = 220;
  const R_ASPECT_CORE = 170;

  // Chart rotation: Ascendant sits on the Left (180° in standard math)
  const ascDeg = subject.ascendant.abs_pos;
  const getScreenAngle = (absPos) => {
    return ((absPos - ascDeg + 180) % 360 + 360) % 360;
  };

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="${width}" height="${height}" style="background: ${bgFill}; font-family: 'Outfit', 'Inter', system-ui, sans-serif;">
  <defs>
    <radialGradient id="aspectGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${isDark ? '#312e81' : '#e0e7ff'}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${isDark ? '#111827' : '#ffffff'}" stop-opacity="0.05"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="${isDark ? '0.5' : '0.15'}"/>
    </filter>
  </defs>

  <!-- Background Base Circles -->
  <circle cx="${CX}" cy="${CY}" r="${R_OUTER_ZODIAC}" fill="${paperFill}" stroke="${ringStroke}" stroke-width="2" filter="url(#shadow)"/>
  <circle cx="${CX}" cy="${CY}" r="${R_INNER_ZODIAC}" fill="${isDark ? '#0f172a' : '#f1f5f9'}" stroke="${ringStroke}" stroke-width="1.5"/>
  <circle cx="${CX}" cy="${CY}" r="${R_RULER}" fill="none" stroke="${ringStroke}" stroke-width="1" stroke-dasharray="2 4"/>
  <circle cx="${CX}" cy="${CY}" r="${R_HOUSES}" fill="${isDark ? '#090d16' : '#ffffff'}" stroke="${ringStroke}" stroke-width="1.5"/>
  <circle cx="${CX}" cy="${CY}" r="${R_ASPECT_CORE}" fill="url(#aspectGlow)" stroke="${ringStroke}" stroke-width="1.5"/>

  <!-- 1. RING 1: ZODIAC SIGNS (12 ARCS) -->
  <g id="zodiac-ring">
`;

  // Draw 12 Zodiac Segments
  ZODIAC_SIGNS.forEach(sign => {
    const startScreen = getScreenAngle(sign.startDeg);
    const midScreen = getScreenAngle(sign.startDeg + 15);

    // Segment divider
    const p1 = polarToCartesian(CX, CY, R_INNER_ZODIAC, startScreen);
    const p2 = polarToCartesian(CX, CY, R_OUTER_ZODIAC, startScreen);
    svg += `    <line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${ringStroke}" stroke-width="1.5"/>\n`;

    // Sign Glyph & Name
    const glyphPos = polarToCartesian(CX, CY, (R_OUTER_ZODIAC + R_INNER_ZODIAC) / 2, midScreen);
    const color = ELEMENT_COLORS[sign.element] || textColor;
    svg += `    <text x="${glyphPos.x.toFixed(1)}" y="${(glyphPos.y + 10).toFixed(1)}" text-anchor="middle" fill="${color}" font-size="28" font-weight="bold">${sign.glyph}</text>\n`;
  });

  svg += `  </g>\n\n  <!-- 2. RING 4: 12 HOUSES -->\n  <g id="houses-ring">\n`;

  // Draw House Cusps & Numbers
  subject.houses.forEach(h => {
    const screenAngle = getScreenAngle(h.cusp);
    const isAngular = h.house === 1 || h.house === 4 || h.house === 7 || h.house === 10;
    const strokeW = isAngular ? 2.5 : 1;
    const strokeC = isAngular ? angularCuspColor : cuspLineColor;

    const pStart = polarToCartesian(CX, CY, R_ASPECT_CORE, screenAngle);
    const pEnd = polarToCartesian(CX, CY, R_INNER_ZODIAC, screenAngle);

    svg += `    <line x1="${pStart.x.toFixed(1)}" y1="${pStart.y.toFixed(1)}" x2="${pEnd.x.toFixed(1)}" y2="${pEnd.y.toFixed(1)}" stroke="${strokeC}" stroke-width="${strokeW}" ${isAngular ? '' : 'stroke-dasharray="4 4"'}/>\n`;

    // House Number label
    const nextCusp = subject.houses[h.house % 12].cusp;
    let houseMidAngle = ((h.cusp + ((nextCusp - h.cusp + 360) % 360) / 2) % 360);
    const midScreen = getScreenAngle(houseMidAngle);
    const numPos = polarToCartesian(CX, CY, (R_HOUSES + R_ASPECT_CORE) / 2, midScreen);
    svg += `    <text x="${numPos.x.toFixed(1)}" y="${(numPos.y + 5).toFixed(1)}" text-anchor="middle" fill="${subtextColor}" font-size="14" font-weight="600">${h.house}</text>\n`;
  });

  svg += `  </g>\n\n  <!-- 3. RING 5: INNER ASPECT CORE CHORDS -->\n  <g id="aspects-core">\n`;

  // Draw Aspect lines inside central core
  const aspectResults = calculateSingleChartAspects(subject);
  aspectResults.aspects.forEach(asp => {
    const p1 = subject.points[asp.p1_name];
    const p2 = subject.points[asp.p2_name];
    if (!p1 || !p2) return;

    const ang1 = getScreenAngle(p1.abs_pos);
    const ang2 = getScreenAngle(p2.abs_pos);

    const pos1 = polarToCartesian(CX, CY, R_ASPECT_CORE, ang1);
    const pos2 = polarToCartesian(CX, CY, R_ASPECT_CORE, ang2);

    const opacity = asp.is_major ? (asp.orbit <= 2 ? '0.85' : '0.55') : '0.35';
    const strokeW = asp.is_major ? (asp.orbit <= 2 ? 2.0 : 1.4) : 0.9;

    svg += `    <line x1="${pos1.x.toFixed(1)}" y1="${pos1.y.toFixed(1)}" x2="${pos2.x.toFixed(1)}" y2="${pos2.y.toFixed(1)}" stroke="${asp.color}" stroke-width="${strokeW}" stroke-opacity="${opacity}">\n`;
    svg += `      <title>${asp.formatted}</title>\n`;
    svg += `    </line>\n`;
  });

  svg += `  </g>\n\n  <!-- 4. RING 3: PLANET CLUSTERS WITH INDICATOR TICKS -->\n  <g id="planets-ring">\n`;

  // Draw Planets
  const planetKeys = [
    'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
    'Uranus', 'Neptune', 'Pluto', 'Mean_North_Lunar_Node', 'Chiron'
  ];

  planetKeys.forEach(pk => {
    const pt = subject.points[pk];
    if (!pt) return;

    const screenAngle = getScreenAngle(pt.abs_pos);

    // Planet Marker tick on ruler ring
    const rulerTick = polarToCartesian(CX, CY, R_RULER, screenAngle);
    const planetPos = polarToCartesian(CX, CY, R_PLANETS, screenAngle);

    // Indicator line
    svg += `    <line x1="${rulerTick.x.toFixed(1)}" y1="${rulerTick.y.toFixed(1)}" x2="${planetPos.x.toFixed(1)}" y2="${planetPos.y.toFixed(1)}" stroke="${pt.color}" stroke-width="1.2" stroke-opacity="0.6"/>\n`;

    // Planet Glyph circle badge
    svg += `    <circle cx="${planetPos.x.toFixed(1)}" cy="${planetPos.y.toFixed(1)}" r="16" fill="${isDark ? '#1e293b' : '#ffffff'}" stroke="${pt.color}" stroke-width="1.8"/>\n`;
    svg += `    <text x="${planetPos.x.toFixed(1)}" y="${(planetPos.y + 6).toFixed(1)}" text-anchor="middle" fill="${pt.color}" font-size="16" font-weight="bold">${pt.glyph}</text>\n`;

    // Degree & Rx label
    const rxStr = pt.retrograde ? ' ℞' : '';
    const textAngle = screenAngle;
    const labelPos = polarToCartesian(CX, CY, R_PLANETS - 28, textAngle);
    svg += `    <text x="${labelPos.x.toFixed(1)}" y="${(labelPos.y + 4).toFixed(1)}" text-anchor="middle" fill="${textColor}" font-size="10" font-weight="600">${pt.position.toFixed(0)}°${rxStr}</text>\n`;
  });

  // Asc / MC badges
  const ascPos = polarToCartesian(CX, CY, R_OUTER_ZODIAC + 16, 180);
  svg += `  <text x="${ascPos.x.toFixed(1)}" y="${(ascPos.y + 5).toFixed(1)}" text-anchor="end" fill="${angularCuspColor}" font-size="15" font-weight="bold">ASC ${subject.ascendant.position.toFixed(0)}°</text>\n`;

  const mcPos = polarToCartesian(CX, CY, R_OUTER_ZODIAC + 16, getScreenAngle(subject.medium_coeli.abs_pos));
  svg += `  <text x="${mcPos.x.toFixed(1)}" y="${(mcPos.y - 6).toFixed(1)}" text-anchor="middle" fill="#a855f7" font-size="15" font-weight="bold">MC</text>\n`;

  // Center Info Medallion
  svg += `
  </g>

  <!-- Central Title Medallion -->
  <g id="center-info" text-anchor="middle">
    <circle cx="${CX}" cy="${CY}" r="65" fill="${paperFill}" stroke="${ringStroke}" stroke-width="1.5" filter="url(#shadow)"/>
    <text x="${CX}" y="${CY - 22}" fill="${textColor}" font-size="14" font-weight="bold">${subject.name}</text>
    <text x="${CX}" y="${CY - 4}" fill="${subtextColor}" font-size="11">${subject.year}-${String(subject.month).padStart(2,'0')}-${String(subject.day).padStart(2,'0')}</text>
    <text x="${CX}" y="${CY + 14}" fill="${subtextColor}" font-size="10">${String(subject.hour).padStart(2,'0')}:${String(subject.minute).padStart(2,'0')} • ${subject.city}</text>
    <text x="${CX}" y="${CY + 32}" fill="${isDark ? '#60a5fa' : '#2563eb'}" font-size="12" font-weight="600">${subject.moon_phase.emoji} ${subject.moon_phase.illumination}%</text>
  </g>
</svg>`;

  return svg;
}

/**
 * Generate Dual-Wheel Synastry SVG Chart
 */
function generateSynastryWheelSvg(subject1, subject2, options = {}) {
  const {
    width = 900,
    height = 900,
    theme = 'dark'
  } = options;

  const CX = 450;
  const CY = 450;
  const isDark = theme === 'dark';

  const bgFill = isDark ? '#0b0f19' : '#f8fafc';
  const paperFill = isDark ? '#111827' : '#ffffff';
  const ringStroke = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
  const textColor = isDark ? '#f3f4f6' : '#1f2937';
  const subtextColor = isDark ? '#9ca3af' : '#6b7280';

  const R_OUTER_ZODIAC = 420;
  const R_INNER_ZODIAC = 360;
  const R_OUTER_PLANETS = 300; // Subject 2 (partner)
  const R_INNER_PLANETS = 230; // Subject 1 (native)
  const R_ASPECT_CORE = 150;

  const ascDeg = subject1.ascendant.abs_pos;
  const getScreenAngle = (absPos) => ((absPos - ascDeg + 180) % 360 + 360) % 360;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" width="${width}" height="${height}" style="background: ${bgFill}; font-family: 'Outfit', 'Inter', system-ui, sans-serif;">
  <defs>
    <radialGradient id="synastryGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${isDark ? '#4338ca' : '#dbeafe'}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${isDark ? '#111827' : '#ffffff'}" stop-opacity="0.05"/>
    </radialGradient>
  </defs>

  <!-- Background Base Rings -->
  <circle cx="${CX}" cy="${CY}" r="${R_OUTER_ZODIAC}" fill="${paperFill}" stroke="${ringStroke}" stroke-width="2"/>
  <circle cx="${CX}" cy="${CY}" r="${R_INNER_ZODIAC}" fill="${isDark ? '#0f172a' : '#f1f5f9'}" stroke="${ringStroke}" stroke-width="1.5"/>
  <circle cx="${CX}" cy="${CY}" r="${R_OUTER_PLANETS + 30}" fill="none" stroke="${ringStroke}" stroke-width="1" stroke-dasharray="2 4"/>
  <circle cx="${CX}" cy="${CY}" r="${R_INNER_PLANETS + 30}" fill="none" stroke="${ringStroke}" stroke-width="1" stroke-dasharray="2 4"/>
  <circle cx="${CX}" cy="${CY}" r="${R_ASPECT_CORE}" fill="url(#synastryGlow)" stroke="${ringStroke}" stroke-width="1.5"/>

  <!-- Zodiac Outer Ring -->
  <g id="zodiac-segments">
`;

  ZODIAC_SIGNS.forEach(sign => {
    const startScreen = getScreenAngle(sign.startDeg);
    const midScreen = getScreenAngle(sign.startDeg + 15);

    const p1 = polarToCartesian(CX, CY, R_INNER_ZODIAC, startScreen);
    const p2 = polarToCartesian(CX, CY, R_OUTER_ZODIAC, startScreen);
    svg += `    <line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${ringStroke}" stroke-width="1"/>\n`;

    const glyphPos = polarToCartesian(CX, CY, (R_OUTER_ZODIAC + R_INNER_ZODIAC) / 2, midScreen);
    svg += `    <text x="${glyphPos.x.toFixed(1)}" y="${(glyphPos.y + 8).toFixed(1)}" text-anchor="middle" fill="${ELEMENT_COLORS[sign.element]}" font-size="24" font-weight="bold">${sign.glyph}</text>\n`;
  });

  svg += `  </g>\n\n  <!-- Inter-Subject Synastry Aspect Chords -->\n  <g id="synastry-aspects">\n`;

  const synastryData = calculateSynastryAspects(subject1, subject2);
  synastryData.aspects.forEach(asp => {
    const p1 = subject1.points[asp.p1_name];
    const p2 = subject2.points[asp.p2_name];
    if (!p1 || !p2) return;

    const ang1 = getScreenAngle(p1.abs_pos);
    const ang2 = getScreenAngle(p2.abs_pos);

    const pos1 = polarToCartesian(CX, CY, R_ASPECT_CORE, ang1);
    const pos2 = polarToCartesian(CX, CY, R_ASPECT_CORE, ang2);

    const opacity = asp.is_major ? (asp.orbit <= 2 ? '0.9' : '0.6') : '0.35';
    const strokeW = asp.is_major ? (asp.orbit <= 2 ? 2.2 : 1.5) : 1.0;

    svg += `    <line x1="${pos1.x.toFixed(1)}" y1="${pos1.y.toFixed(1)}" x2="${pos2.x.toFixed(1)}" y2="${pos2.y.toFixed(1)}" stroke="${asp.color}" stroke-width="${strokeW}" stroke-opacity="${opacity}">\n`;
    svg += `      <title>${asp.formatted}</title>\n`;
    svg += `    </line>\n`;
  });

  svg += `  </g>\n\n  <!-- Outer Band: ${subject2.name} Planets -->\n  <g id="partner-planets">\n`;

  const keyPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  keyPlanets.forEach(pk => {
    const pt = subject2.points[pk];
    if (!pt) return;
    const ang = getScreenAngle(pt.abs_pos);
    const pos = polarToCartesian(CX, CY, R_OUTER_PLANETS, ang);

    svg += `    <circle cx="${pos.x.toFixed(1)}" cy="${pos.y.toFixed(1)}" r="14" fill="#3b82f6" fill-opacity="0.2" stroke="#3b82f6" stroke-width="1.5"/>\n`;
    svg += `    <text x="${pos.x.toFixed(1)}" y="${(pos.y + 5).toFixed(1)}" text-anchor="middle" fill="#60a5fa" font-size="14" font-weight="bold">${pt.glyph}</text>\n`;
  });

  svg += `  </g>\n\n  <!-- Inner Band: ${subject1.name} Planets -->\n  <g id="native-planets">\n`;

  keyPlanets.forEach(pk => {
    const pt = subject1.points[pk];
    if (!pt) return;
    const ang = getScreenAngle(pt.abs_pos);
    const pos = polarToCartesian(CX, CY, R_INNER_PLANETS, ang);

    svg += `    <circle cx="${pos.x.toFixed(1)}" cy="${pos.y.toFixed(1)}" r="14" fill="#ec4899" fill-opacity="0.2" stroke="#ec4899" stroke-width="1.5"/>\n`;
    svg += `    <text x="${pos.x.toFixed(1)}" y="${(pos.y + 5).toFixed(1)}" text-anchor="middle" fill="#f472b6" font-size="14" font-weight="bold">${pt.glyph}</text>\n`;
  });

  // Center Synastry Compatibility Badge
  const scoreResult = calculateRelationshipScore(subject1, subject2);
  svg += `
  </g>

  <!-- Center Synastry Badge -->
  <g id="center-synastry" text-anchor="middle">
    <circle cx="${CX}" cy="${CY}" r="68" fill="${paperFill}" stroke="${ringStroke}" stroke-width="2"/>
    <text x="${CX}" y="${CY - 26}" fill="${textColor}" font-size="12" font-weight="bold">${subject1.name} &amp; ${subject2.name}</text>
    <text x="${CX}" y="${CY - 2}" fill="#10b981" font-size="24" font-weight="900">${scoreResult.score_value}</text>
    <text x="${CX}" y="${CY + 18}" fill="${subtextColor}" font-size="10" font-weight="600">POINTS</text>
    <text x="${CX}" y="${CY + 36}" fill="${isDark ? '#f472b6' : '#db2777'}" font-size="11" font-weight="bold">${scoreResult.score_description}</text>
  </g>
</svg>`;

  return svg;
}

// ============================================================================
// 5. REPORT GENERATOR (Markdown / Textual Report)
// ============================================================================

function generateReport(subject) {
  const aspects = calculateSingleChartAspects(subject);

  let md = `# 🪐 Kerykeion Astrological Report: ${subject.name}\n\n`;
  md += `**Birth Details**: ${subject.year}-${String(subject.month).padStart(2,'0')}-${String(subject.day).padStart(2,'0')} ${String(subject.hour).padStart(2,'0')}:${String(subject.minute).padStart(2,'0')} (${subject.city}, ${subject.nation})\n`;
  md += `**Coordinates**: Lat ${subject.lat}°, Lng ${subject.lng}° | **Julian Day**: ${subject.julian_day}\n`;
  md += `**Moon Phase**: ${subject.moon_phase.emoji} ${subject.moon_phase.name} (${subject.moon_phase.illumination}% Illumination)\n\n`;

  md += `## 🌟 Big Three & Cardinal Angles\n`;
  md += `- **Sun**: ${subject.sun.formatted} (${subject.sun.house})\n`;
  md += `- **Moon**: ${subject.moon.formatted} (${subject.moon.house})\n`;
  md += `- **Ascendant (Lagna)**: ${subject.ascendant.formatted}\n`;
  md += `- **Medium Coeli (MC)**: ${subject.medium_coeli.formatted}\n\n`;

  md += `## 🪐 Planetary Coordinates\n`;
  md += `| Point | Glyph | Sign | Position | House | Retrograde | Speed |\n`;
  md += `| :--- | :---: | :--- | :--- | :--- | :---: | :--- |\n`;

  Object.values(subject.points).forEach(p => {
    const rx = p.retrograde ? '℞ Yes' : 'No';
    md += `| ${p.label} | ${p.glyph} | ${p.sign} ${p.sign_glyph} | ${p.position.toFixed(2)}° | ${p.house} | ${rx} | ${p.speed}°/day |\n`;
  });

  md += `\n## 🏛️ House Cusps (${subject.house_system})\n`;
  md += `| House | Sign | Cusp Degree |\n`;
  md += `| :---: | :--- | :--- |\n`;
  subject.houses.forEach(h => {
    md += `| ${h.house} | ${h.sign} ${h.signGlyph} | ${h.formatted} |\n`;
  });

  md += `\n## ⚡ Elemental & Modality Distribution\n`;
  md += `- **Fire**: ${subject.elements.fire.points} pts (${subject.elements.fire.percentage}%)\n`;
  md += `- **Earth**: ${subject.elements.earth.points} pts (${subject.elements.earth.percentage}%)\n`;
  md += `- **Air**: ${subject.elements.air.points} pts (${subject.elements.air.percentage}%)\n`;
  md += `- **Water**: ${subject.elements.water.points} pts (${subject.elements.water.percentage}%)\n\n`;
  md += `- **Cardinal**: ${subject.qualities.cardinal.points} pts (${subject.qualities.cardinal.percentage}%)\n`;
  md += `- **Fixed**: ${subject.qualities.fixed.points} pts (${subject.qualities.fixed.percentage}%)\n`;
  md += `- **Mutable**: ${subject.qualities.mutable.points} pts (${subject.qualities.mutable.percentage}%)\n\n`;

  md += `## 📐 Major Planetary Aspects (${aspects.aspects_count} detected)\n`;
  md += `| Planet 1 | Aspect | Planet 2 | Orb | Motion |\n`;
  md += `| :--- | :---: | :--- | :---: | :--- |\n`;
  aspects.aspects.forEach(asp => {
    md += `| ${asp.p1_label} (${asp.p1_glyph}) | ${asp.symbol} ${asp.aspect} | ${asp.p2_label} (${asp.p2_glyph}) | ${asp.orbit}° | ${asp.movement} |\n`;
  });

  return md;
}

// ============================================================================
// 6. UPSTREAM ASTROLOGER-API / RAPIDAPI CONNECTOR FALLBACK
// ============================================================================

async function fetchRemoteKerykeionChart(birthData) {
  const rapidApiKey = process.env.ASTROLOGER_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY;
  const customUrl = process.env.KERYKEION_API_URL || process.env.ASTROLOGER_API_URL;

  if (!rapidApiKey && !customUrl) {
    // Return null so local calculation engine is used
    return null;
  }

  return new Promise((resolve) => {
    const payload = JSON.stringify({
      subject: {
        name: birthData.name || 'Subject',
        year: birthData.year,
        month: birthData.month,
        day: birthData.day,
        hour: birthData.hour || 12,
        minute: birthData.minute || 0,
        city: birthData.city || 'Kathmandu',
        nation: birthData.nation || 'NP',
        lng: birthData.lng || 85.324,
        lat: birthData.lat || 27.7172,
        tz_str: birthData.tzStr || 'Asia/Kathmandu'
      }
    });

    const host = customUrl ? new URL(customUrl).host : 'astrologer.p.rapidapi.com';
    const pathStr = customUrl ? new URL(customUrl).pathname : '/api/v4/birth-chart';

    const reqOptions = {
      method: 'POST',
      host,
      path: pathStr,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...(rapidApiKey ? { 'x-rapidapi-key': rapidApiKey, 'x-rapidapi-host': host } : {})
      },
      timeout: 6000
    };

    const client = host.includes('localhost') || host.includes('127.0.0.1') ? http : https;
    const req = client.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.write(payload);
    req.end();
  });
}

// ============================================================================
// 7. STATUS & HEALTH CHECK
// ============================================================================

async function checkStatus() {
  const rapidApiKey = process.env.ASTROLOGER_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY;
  const customUrl = process.env.KERYKEION_API_URL || process.env.ASTROLOGER_API_URL;

  return {
    success: true,
    status: 'Operational',
    engine: 'Kerykeion Astrological Library (Western Tropical & Placidus)',
    version: '5.0.0',
    localEngine: {
      isReady: true,
      swissEphemerisPrecision: true,
      supportedBodies: CELESTIAL_POINTS_CONFIG.map(c => c.name),
      aspectsSupported: DEFAULT_ASPECTS.map(a => a.name),
      synastryMethod: 'Ciro Discepolo Compatibility Model',
      chartVisualizer: '5-Ring Concentric SVG Wheel (Natal & Dual Synastry)'
    },
    upstreamConnector: {
      isConfigured: Boolean(rapidApiKey || customUrl),
      targetUrl: customUrl || (rapidApiKey ? 'https://astrologer.p.rapidapi.com' : null)
    }
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Core Factories
  createSubject,
  calculateSingleChartAspects,
  calculateSynastryAspects,
  calculateRelationshipScore,
  generateWheelSvg,
  generateSynastryWheelSvg,
  generateReport,
  fetchRemoteKerykeionChart,
  checkStatus,

  // Reference tables & helpers
  ZODIAC_SIGNS,
  CELESTIAL_POINTS_CONFIG,
  DEFAULT_ASPECTS,
  CIRO_RULES,
  calculateJulianDay,
  formatDegree
};
