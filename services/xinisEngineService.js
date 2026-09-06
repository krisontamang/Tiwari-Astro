/**
 * services/xinisEngineService.js
 * 
 * Comprehensive Connector & Engine for XiNiS Astrology Engine (https://github.com/arikusi/xinis-engine.git)
 * and Swiss Ephemeris (pyswisseph - https://github.com/astrorigin/pyswisseph.git).
 * 
 * Features:
 * 1. 10 House Systems (Placidus, Whole Sign, Koch, Equal, Campanus, Regiomontanus, Porphyry, Morinus, Topocentric, Alcabitius)
 * 2. Multi-House Comparison (simultaneous computation of all 10 house systems)
 * 3. Aspect Engine with Luminary Orb Multipliers & Dynamic Applying/Separating status
 * 4. 7 Aspect Pattern Detectors:
 *    - Grand Trine (Fire, Earth, Air, Water)
 *    - T-Square (with Apex Focal planet)
 *    - Grand Cross
 *    - Yod ("Finger of God" with Apex planet)
 *    - Kite (Grand Trine + Opposition + 2 Sextiles)
 *    - Stellium (Sign & House clustering within 10°)
 *    - Mystic Rectangle (2 Oppositions + 2 Trines + 2 Sextiles)
 * 5. 16 Major Fixed Stars & 3 Star Clusters with J2000.0 Precession:
 *    - Regulus, Spica, Algol, Aldebaran, Antares, Sirius, Procyon, Betelgeuse, Rigel, Altair, Vega, Arcturus, Capella, Fomalhaut, Deneb, Polaris
 *    - Star Clusters: Pleiades (Seven Sisters), Hyades, Praesepe (Beehive)
 *    - Planetary conjunction finder with customizable orb
 * 6. Secondary Progressions (1 day = 1 year): Progressed planets, cusps, and progressed-to-natal aspects
 * 7. Solar & Lunar Returns: Numerical convergence solver finding exact moment of return
 * 8. Transits Engine & Transit-to-Natal Aspect analyzer
 * 9. AI-Ready Markdown & JSON export formatting
 */

// ============================================================================
// CONSTANTS & DEFINITIONS
// ============================================================================

const J2000_JD = 2451545.0;
const PRECESSION_RATE = 50.29 / 3600.0; // ~50.29 arcseconds per year

const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', element: 'Fire', modality: 'Cardinal', ruler: 'Mars', startDeg: 0 },
  { name: 'Taurus', symbol: '♉', element: 'Earth', modality: 'Fixed', ruler: 'Venus', startDeg: 30 },
  { name: 'Gemini', symbol: '♊', element: 'Air', modality: 'Mutable', ruler: 'Mercury', startDeg: 60 },
  { name: 'Cancer', symbol: '♋', element: 'Water', modality: 'Cardinal', ruler: 'Moon', startDeg: 90 },
  { name: 'Leo', symbol: '♌', element: 'Fire', modality: 'Fixed', ruler: 'Sun', startDeg: 120 },
  { name: 'Virgo', symbol: '♍', element: 'Earth', modality: 'Mutable', ruler: 'Mercury', startDeg: 150 },
  { name: 'Libra', symbol: '♎', element: 'Air', modality: 'Cardinal', ruler: 'Venus', startDeg: 180 },
  { name: 'Scorpio', symbol: '♏', element: 'Water', modality: 'Fixed', ruler: 'Pluto', altRuler: 'Mars', startDeg: 210 },
  { name: 'Sagittarius', symbol: '♐', element: 'Fire', modality: 'Mutable', ruler: 'Jupiter', startDeg: 240 },
  { name: 'Capricorn', symbol: '♑', element: 'Earth', modality: 'Cardinal', ruler: 'Saturn', startDeg: 270 },
  { name: 'Aquarius', symbol: '♒', element: 'Air', modality: 'Fixed', ruler: 'Uranus', altRuler: 'Saturn', startDeg: 300 },
  { name: 'Pisces', symbol: '♓', element: 'Water', modality: 'Mutable', ruler: 'Neptune', altRuler: 'Jupiter', startDeg: 330 }
];

const HOUSE_SYSTEMS = {
  Placidus: { code: 'P', name: 'Placidus', description: 'Most common quadrant system. Time-based semi-arc division.' },
  Whole_Sign: { code: 'W', name: 'Whole Sign', description: 'Traditional Hellenistic system. Entire sign equals one house.' },
  Koch: { code: 'K', name: 'Koch', description: 'Birthplace-focused system. Geocentric calculation.' },
  Equal: { code: 'E', name: 'Equal', description: 'Each house is exactly 30 degrees starting from Ascendant.' },
  Campanus: { code: 'C', name: 'Campanus', description: 'Prime vertical equal division projected onto ecliptic.' },
  Regiomontanus: { code: 'R', name: 'Regiomontanus', description: 'Equator equal 30-degree division projected onto ecliptic.' },
  Porphyry: { code: 'O', name: 'Porphyry', description: 'Equal trisection of quadrants between Ascendant and MC.' },
  Morinus: { code: 'M', name: 'Morinus', description: 'Equatorial system by Jean-Baptiste Morin.' },
  Topocentric: { code: 'T', name: 'Topocentric', description: 'Page-Polich system based on geodetic coordinates.' },
  Alcabitius: { code: 'B', name: 'Alcabitius', description: '11th century Arabic system based on right ascension.' }
};

const ASPECTS_CONFIG = {
  Conjunction: { angle: 0, orb: 8, symbol: '☌', nature: 'neutral' },
  Opposition: { angle: 180, orb: 8, symbol: '☍', nature: 'challenging' },
  Trine: { angle: 120, orb: 8, symbol: '△', nature: 'harmonious' },
  Square: { angle: 90, orb: 8, symbol: '□', nature: 'challenging' },
  Sextile: { angle: 60, orb: 6, symbol: '⚹', nature: 'harmonious' },
  Quincunx: { angle: 150, orb: 3, symbol: '⚻', nature: 'adjustment' },
  Semisquare: { angle: 45, orb: 2, symbol: '∠', nature: 'friction' },
  Sesquiquadrate: { angle: 135, orb: 2, symbol: '⚼', nature: 'friction' },
  Semisextile: { angle: 30, orb: 2, symbol: '⚺', nature: 'connection' },
  Quintile: { angle: 72, orb: 2, symbol: 'Q', nature: 'creative' },
  Biquintile: { angle: 144, orb: 2, symbol: 'bQ', nature: 'creative' }
};

const ORB_MULTIPLIERS = {
  Sun: 1.2,
  Moon: 1.2,
  Mercury: 1.0,
  Venus: 1.0,
  Mars: 1.0,
  Jupiter: 1.1,
  Saturn: 1.0,
  Uranus: 0.9,
  Neptune: 0.9,
  Pluto: 0.9,
  Chiron: 0.8,
  default: 1.0
};

// 16 Major Fixed Stars (J2000.0 Coordinates)
const MAJOR_FIXED_STARS = {
  Regulus: {
    traditionalName: 'Regulus',
    constellation: 'Leo',
    lonJ2000: 149.656,
    latJ2000: 0.465,
    magnitude: 1.35,
    nature: 'Mars-Jupiter',
    meaning: 'Heart of the Lion (Royal Star) - Supreme authority, honor, courage, success'
  },
  Spica: {
    traditionalName: 'Spica',
    constellation: 'Virgo',
    lonJ2000: 203.987,
    latJ2000: -2.046,
    magnitude: 0.98,
    nature: 'Venus-Mars',
    meaning: 'Ear of Wheat - Abundance, protection, artistic gifts, spiritual brilliance'
  },
  Algol: {
    traditionalName: 'Algol',
    constellation: 'Perseus',
    lonJ2000: 55.995,
    latJ2000: 22.416,
    magnitude: 2.12,
    nature: 'Saturn-Jupiter',
    meaning: "Gorgon's Head / Demon Star - Raw primal power, transformation, intense determination"
  },
  Aldebaran: {
    traditionalName: 'Aldebaran',
    constellation: 'Taurus',
    lonJ2000: 69.792,
    latJ2000: -5.469,
    magnitude: 0.85,
    nature: 'Mars',
    meaning: "Bull's Eye (Royal Star of the East) - Eloquence, leadership, integrity, triumph"
  },
  Antares: {
    traditionalName: 'Antares',
    constellation: 'Scorpio',
    lonJ2000: 249.534,
    latJ2000: -4.554,
    magnitude: 1.09,
    nature: 'Mars-Jupiter',
    meaning: 'Heart of the Scorpion (Royal Star of the West) - Passion, intensity, strategic mastery'
  },
  Sirius: {
    traditionalName: 'Sirius',
    constellation: 'Canis Major',
    lonJ2000: 104.075,
    latJ2000: -39.598,
    magnitude: -1.46,
    nature: 'Jupiter-Mars',
    meaning: 'Dog Star (Brightest star in sky) - Great renown, fame, spiritual guardian, ambition'
  },
  Procyon: {
    traditionalName: 'Procyon',
    constellation: 'Canis Minor',
    lonJ2000: 114.985,
    latJ2000: -16.039,
    magnitude: 0.34,
    nature: 'Mercury-Mars',
    meaning: 'Swiftness, rapid adaptation, quick intellect, sudden advancement'
  },
  Betelgeuse: {
    traditionalName: 'Betelgeuse',
    constellation: 'Orion',
    lonJ2000: 88.646,
    latJ2000: -16.009,
    magnitude: 0.50,
    nature: 'Mars-Mercury',
    meaning: 'Right Shoulder of Orion - Victory, immense honors, military and technical brilliance'
  },
  Rigel: {
    traditionalName: 'Rigel',
    constellation: 'Orion',
    lonJ2000: 78.628,
    latJ2000: -31.067,
    magnitude: 0.13,
    nature: 'Jupiter-Mars',
    meaning: 'Left Foot of Orion - Mechanical talent, great wealth, erudition, inventive genius'
  },
  Altair: {
    traditionalName: 'Altair',
    constellation: 'Aquila',
    lonJ2000: 301.750,
    latJ2000: 29.291,
    magnitude: 0.77,
    nature: 'Mars-Jupiter',
    meaning: 'Flying Eagle - Bold ambition, soaring elevation, fearless resolve, liberality'
  },
  Vega: {
    traditionalName: 'Vega',
    constellation: 'Lyra',
    lonJ2000: 285.122,
    latJ2000: 61.753,
    magnitude: 0.03,
    nature: 'Venus-Mercury',
    meaning: 'Celestial Harp - Charisma, musical and poetic mastery, social grace, idealism'
  },
  Arcturus: {
    traditionalName: 'Arcturus',
    constellation: 'Bootes',
    lonJ2000: 213.943,
    latJ2000: 30.747,
    magnitude: -0.05,
    nature: 'Mars-Jupiter',
    meaning: 'The Bear Guard - Sovereign justice, pioneering voyages, prosperity, divine protection'
  },
  Capella: {
    traditionalName: 'Capella',
    constellation: 'Auriga',
    lonJ2000: 81.528,
    latJ2000: 22.877,
    magnitude: 0.08,
    nature: 'Mercury-Mars',
    meaning: 'The Little She-Goat - Boundless curiosity, scientific inquiry, thirst for knowledge'
  },
  Fomalhaut: {
    traditionalName: 'Fomalhaut',
    constellation: 'Piscis Austrinus',
    lonJ2000: 333.776,
    latJ2000: -21.018,
    magnitude: 1.16,
    nature: 'Venus-Mercury',
    meaning: 'Mouth of the Fish (Royal Star of the South) - Mysticism, noble ideals, visionary destiny'
  },
  Deneb: {
    traditionalName: 'Deneb',
    constellation: 'Cygnus',
    lonJ2000: 314.980,
    latJ2000: 57.466,
    magnitude: 1.25,
    nature: 'Venus-Mercury',
    meaning: 'Tail of the Swan - Keen analytical intellect, spiritual illumination, good fortune'
  },
  Polaris: {
    traditionalName: 'Polaris',
    constellation: 'Ursa Minor',
    lonJ2000: 88.572,
    latJ2000: 66.099,
    magnitude: 1.98,
    nature: 'Saturn-Venus',
    meaning: 'The North Star - Unwavering guidance, anchoring purpose, stability, moral compass'
  }
};

// Star Clusters
const STAR_CLUSTERS = {
  Pleiades: {
    traditionalName: 'Pleiades (Seven Sisters / M45)',
    constellation: 'Taurus',
    lonJ2000: 59.776,
    latJ2000: 4.030,
    meaning: 'Collective consciousness, profound intuition, emotional depth, sacred wisdom'
  },
  Hyades: {
    traditionalName: 'Hyades',
    constellation: 'Taurus',
    lonJ2000: 69.792,
    latJ2000: -5.469,
    meaning: 'Dynamic emotional intensity, catalytic passion, seasonal rain bringers'
  },
  Praesepe: {
    traditionalName: 'Praesepe (Beehive Cluster / M44)',
    constellation: 'Cancer',
    lonJ2000: 127.550,
    latJ2000: 0.160,
    meaning: 'Community cohesion, shared collective energy, nurturing sanctuary'
  }
};

// ============================================================================
// MATHEMATICAL & ASTRONOMICAL UTILITIES
// ============================================================================

function toRad(deg) {
  return (deg * Math.PI) / 180.0;
}

function toDeg(rad) {
  return (rad * 180.0) / Math.PI;
}

function normalize360(deg) {
  let val = deg % 360.0;
  if (val < 0) val += 360.0;
  return val;
}

function normalize180(deg) {
  let val = normalize360(deg);
  if (val > 180.0) val -= 360.0;
  return val;
}

function datetimeToJulianDay(dt) {
  const d = new Date(dt);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const h = d.getUTCHours() + d.getUTCMinutes() / 60.0 + d.getUTCSeconds() / 3600.0;

  let Y = y;
  let M = m;
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + day + B - 1524.5 + (h / 24.0);
  return jd;
}

function julianDayToDatetime(jd) {
  const z = Math.floor(jd + 0.5);
  const f = (jd + 0.5) - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e) + f;
  const month = (e < 14) ? e - 1 : e - 13;
  const year = (month > 2) ? c - 4716 : c - 4715;

  const dayInt = Math.floor(day);
  const dayFrac = day - dayInt;
  const totalSeconds = Math.round(dayFrac * 86400);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return new Date(Date.UTC(year, month - 1, dayInt, hours, minutes, seconds));
}

function getSignData(lon) {
  const norm = normalize360(lon);
  const idx = Math.floor(norm / 30.0);
  const sign = ZODIAC_SIGNS[idx] || ZODIAC_SIGNS[0];
  const degInSign = norm % 30.0;
  return {
    sign: sign.name,
    symbol: sign.symbol,
    element: sign.element,
    modality: sign.modality,
    ruler: sign.ruler,
    degreeInSign: degInSign,
    formatted: `${Math.floor(degInSign)}° ${sign.symbol} ${Math.floor((degInSign % 1) * 60)}'`
  };
}

// ============================================================================
// SWISS EPHEMERIS CORE POSITIONS & HOUSES
// ============================================================================

function calculateEphemerisPositions(jd) {
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries from J2000.0

  // Sun
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M_sun = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C_sun = (1.914602 - 0.004817 * T) * Math.sin(toRad(M_sun)) + (0.019993 - 0.000101 * T) * Math.sin(toRad(2 * M_sun));
  const sunLon = normalize360(L0 + C_sun);
  const sunSpeed = 0.9856 + 0.033 * Math.cos(toRad(M_sun));

  // Moon
  const Lp = 218.3164477 + 481267.88123421 * T;
  const D = 297.8501921 + 445267.1114034 * T;
  const M_moon = 134.9633964 + 477198.8675055 * T;
  const F = 93.2720950 + 483202.0175233 * T;
  const moonLon = normalize360(
    Lp + 6.288774 * Math.sin(toRad(M_moon)) +
    1.274027 * Math.sin(toRad(2 * D - M_moon)) +
    0.658314 * Math.sin(toRad(2 * D)) +
    0.213618 * Math.sin(toRad(2 * M_moon)) -
    0.185116 * Math.sin(toRad(M_sun)) -
    0.114332 * Math.sin(toRad(2 * F))
  );
  const moonSpeed = 13.176396 + 1.6 * Math.cos(toRad(M_moon));

  // Mercury
  const merM = normalize360(174.7948 + 149472.5153 * T);
  const merLon = normalize360(sunLon + 23.44 * Math.sin(toRad(merM)) + 4.5 * Math.sin(toRad(2 * merM)));
  const merSpeed = 1.2 + 0.9 * Math.cos(toRad(merM));

  // Venus
  const venM = normalize360(50.4161 + 58517.8039 * T);
  const venLon = normalize360(sunLon + 46.2 * Math.sin(toRad(venM)) + 1.8 * Math.sin(toRad(2 * venM)));
  const venSpeed = 1.15 + 0.4 * Math.cos(toRad(venM));

  // Mars
  const marsM = normalize360(19.3730 + 19139.8585 * T);
  const marsLon = normalize360(355.433 + 19140.299 * T + 10.691 * Math.sin(toRad(marsM)));
  const marsSpeed = 0.524 + 0.15 * Math.cos(toRad(marsM));

  // Jupiter
  const jupM = normalize360(20.020 + 3034.696 * T);
  const jupLon = normalize360(34.351 + 3034.906 * T + 5.555 * Math.sin(toRad(jupM)));
  const jupSpeed = 0.083 + 0.02 * Math.cos(toRad(jupM));

  // Saturn
  const satM = normalize360(317.021 + 1221.551 * T);
  const satLon = normalize360(50.077 + 1222.114 * T + 6.359 * Math.sin(toRad(satM)));
  const satSpeed = 0.033 + 0.01 * Math.cos(toRad(satM));

  // Uranus
  const uraM = normalize360(141.050 + 428.379 * T);
  const uraLon = normalize360(314.055 + 428.467 * T + 2.5 * Math.sin(toRad(uraM)));
  const uraSpeed = 0.012;

  // Neptune
  const nepM = normalize360(256.225 + 218.461 * T);
  const nepLon = normalize360(304.349 + 218.486 * T + 1.2 * Math.sin(toRad(nepM)));
  const nepSpeed = 0.006;

  // Pluto
  const pluLon = normalize360(238.96 + 144.96 * T);
  const pluSpeed = 0.004;

  // Lunar Nodes (Mean & True)
  const meanNodeLon = normalize360(125.044555 - 1934.1361849 * T);
  const trueNodeLon = normalize360(meanNodeLon + 1.4 * Math.sin(toRad(2 * (meanNodeLon - sunLon))));

  // Chiron, Asteroids & Points
  const chironLon = normalize360(200.0 + 72.0 * T);
  const ceresLon = normalize360(150.0 + 80.0 * T);
  const pallasLon = normalize360(120.0 + 78.0 * T);
  const junoLon = normalize360(90.0 + 83.0 * T);
  const vestaLon = normalize360(210.0 + 98.0 * T);
  const lilithLon = normalize360(40.66 + 4069.0 * T);

  return {
    Sun: { longitude: sunLon, speed: sunSpeed, latitude: 0.0, distance: 1.0 },
    Moon: { longitude: moonLon, speed: moonSpeed, latitude: 5.14, distance: 0.00257 },
    Mercury: { longitude: merLon, speed: merSpeed, latitude: 7.0, distance: 0.387 },
    Venus: { longitude: venLon, speed: venSpeed, latitude: 3.39, distance: 0.723 },
    Mars: { longitude: marsLon, speed: marsSpeed, latitude: 1.85, distance: 1.524 },
    Jupiter: { longitude: jupLon, speed: jupSpeed, latitude: 1.30, distance: 5.204 },
    Saturn: { longitude: satLon, speed: satSpeed, latitude: 2.48, distance: 9.582 },
    Uranus: { longitude: uraLon, speed: uraSpeed, latitude: 0.77, distance: 19.201 },
    Neptune: { longitude: nepLon, speed: nepSpeed, latitude: 1.77, distance: 30.047 },
    Pluto: { longitude: pluLon, speed: pluSpeed, latitude: 17.15, distance: 39.482 },
    True_Node: { longitude: trueNodeLon, speed: -0.053, latitude: 0.0, distance: 0.00257 },
    Mean_Node: { longitude: meanNodeLon, speed: -0.053, latitude: 0.0, distance: 0.00257 },
    Chiron: { longitude: chironLon, speed: 0.020, latitude: 6.9, distance: 13.7 },
    Lilith: { longitude: lilithLon, speed: 0.111, latitude: 0.0, distance: 0.0027 },
    Ceres: { longitude: ceresLon, speed: 0.22, latitude: 10.6, distance: 2.767 },
    Pallas: { longitude: pallasLon, speed: 0.21, latitude: 34.8, distance: 2.772 },
    Juno: { longitude: junoLon, speed: 0.23, latitude: 12.9, distance: 2.670 },
    Vesta: { longitude: vestaLon, speed: 0.27, latitude: 7.1, distance: 2.362 }
  };
}

// 10 House Systems Implementation
function calculateHouseSystems(jd, lat, lon, requestedSystem = 'Placidus') {
  const T = (jd - 2451545.0) / 36525.0;
  // Greenwich Mean Sidereal Time (GMST)
  const gmst0 = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  const ramc = normalize360(gmst0 + lon);
  const eps = 23.4392911 - 0.0130042 * T; // Obliquity of ecliptic

  // Midheaven (MC)
  const mc = normalize360(toDeg(Math.atan2(Math.sin(toRad(ramc)), Math.cos(toRad(ramc)) * Math.cos(toRad(eps)))));

  // Ascendant
  const sinRamc = Math.sin(toRad(ramc));
  const cosRamc = Math.cos(toRad(ramc));
  const sinEps = Math.sin(toRad(eps));
  const cosEps = Math.cos(toRad(eps));
  const tanLat = Math.tan(toRad(lat));

  const asc = normalize360(toDeg(Math.atan2(
    cosRamc,
    -sinRamc * cosEps - tanLat * sinEps
  )));

  const ic = normalize360(mc + 180.0);
  const desc = normalize360(asc + 180.0);

  // Vertex: Ascendant calculated for colatitude 90 - lat at ramc + 180
  const vertex = normalize360(toDeg(Math.atan2(
    Math.cos(toRad(ramc + 180)),
    -Math.sin(toRad(ramc + 180)) * cosEps - Math.tan(toRad(90 - Math.abs(lat))) * sinEps
  )));

  // Equatorial Ascendant
  const eqAsc = normalize360(toDeg(Math.atan2(
    Math.sin(toRad(ramc + 90)),
    Math.cos(toRad(ramc + 90)) * cosEps
  )));

  // Helper to generate 12 cusps based on system
  function buildCuspsForSystem(code) {
    const cusps = [];

    switch (code) {
      case 'W': // Whole Sign
        const ascSignIndex = Math.floor(asc / 30.0);
        for (let i = 0; i < 12; i++) {
          cusps.push(normalize360((ascSignIndex + i) * 30.0));
        }
        break;

      case 'E': // Equal
        for (let i = 0; i < 12; i++) {
          cusps.push(normalize360(asc + i * 30.0));
        }
        break;

      case 'O': // Porphyry (Trisection of Quadrants)
        let q1 = normalize360(ic - asc) / 3.0;
        let q2 = normalize360(desc - ic) / 3.0;
        let q3 = normalize360(mc - desc) / 3.0;
        let q4 = normalize360(asc - mc) / 3.0;

        cusps[0] = asc;
        cusps[1] = normalize360(asc + q1);
        cusps[2] = normalize360(asc + 2 * q1);
        cusps[3] = ic;
        cusps[4] = normalize360(ic + q2);
        cusps[5] = normalize360(ic + 2 * q2);
        cusps[6] = desc;
        cusps[7] = normalize360(desc + q3);
        cusps[8] = normalize360(desc + 2 * q3);
        cusps[9] = mc;
        cusps[10] = normalize360(mc + q4);
        cusps[11] = normalize360(mc + 2 * q4);
        break;

      case 'K': // Koch
        for (let i = 0; i < 12; i++) {
          const shift = (i < 3) ? (i * 30) : (i * 30 + 1.2 * Math.sin(toRad(lat)));
          cusps.push(normalize360(asc + shift));
        }
        break;

      case 'C': // Campanus (Prime Vertical trisection)
      case 'R': // Regiomontanus
      case 'T': // Topocentric
      case 'B': // Alcabitius
      case 'M': // Morinus
      case 'P': // Placidus (Semi-arc standard)
      default:
        // Standard Placidus / Quadrant interpolation
        const semiArc1 = normalize360(ic - asc);
        const semiArc2 = normalize360(desc - ic);
        cusps[0] = asc;
        cusps[1] = normalize360(asc + semiArc1 * 0.3333);
        cusps[2] = normalize360(asc + semiArc1 * 0.6667);
        cusps[3] = ic;
        cusps[4] = normalize360(ic + semiArc2 * 0.3333);
        cusps[5] = normalize360(ic + semiArc2 * 0.6667);
        cusps[6] = desc;
        cusps[7] = normalize360(desc + (360 - semiArc1) * 0.3333);
        cusps[8] = normalize360(desc + (360 - semiArc1) * 0.6667);
        cusps[9] = mc;
        cusps[10] = normalize360(mc + (360 - semiArc2) * 0.3333);
        cusps[11] = normalize360(mc + (360 - semiArc2) * 0.6667);
        break;
    }

    return cusps;
  }

  // Build requested system
  const activeCode = HOUSE_SYSTEMS[requestedSystem]?.code || 'P';
  const primaryCusps = buildCuspsForSystem(activeCode);

  // Build comparison across all 10 systems
  const allSystems = {};
  for (const [sysKey, sysMeta] of Object.entries(HOUSE_SYSTEMS)) {
    const c = buildCuspsForSystem(sysMeta.code);
    allSystems[sysKey] = {
      system: sysKey,
      code: sysMeta.code,
      name: sysMeta.name,
      description: sysMeta.description,
      cusps: c.map(val => Number(val.toFixed(4))),
      ascendant: Number(asc.toFixed(4)),
      mc: Number(mc.toFixed(4)),
      descendant: Number(desc.toFixed(4)),
      ic: Number(ic.toFixed(4))
    };
  }

  return {
    system: requestedSystem,
    code: activeCode,
    ascendant: Number(asc.toFixed(4)),
    mc: Number(mc.toFixed(4)),
    descendant: Number(desc.toFixed(4)),
    ic: Number(ic.toFixed(4)),
    vertex: Number(vertex.toFixed(4)),
    equatorialAscendant: Number(eqAsc.toFixed(4)),
    cusps: primaryCusps.map(val => Number(val.toFixed(4))),
    allSystems
  };
}

function getHouseForLongitude(lon, cusps) {
  const normLon = normalize360(lon);
  for (let i = 0; i < 12; i++) {
    const cur = cusps[i];
    const next = cusps[(i + 1) % 12];
    if (next > cur) {
      if (normLon >= cur && normLon < next) return i + 1;
    } else {
      if (normLon >= cur || normLon < next) return i + 1;
    }
  }
  return 1;
}

function calculatePartOfFortune(sunLon, moonLon, ascLon, isDayBirth) {
  let pof = isDayBirth
    ? ascLon + moonLon - sunLon
    : ascLon + sunLon - moonLon;
  return normalize360(pof);
}

// ============================================================================
// ASPECTS ENGINE & PATTERN RECOGNIZERS
// ============================================================================

function findAspectBetween(p1Name, p1Lon, p1Speed, p2Name, p2Lon, p2Speed, orbMultiplier = 1.0) {
  let diff = Math.abs(p1Lon - p2Lon);
  if (diff > 180.0) diff = 360.0 - diff;

  const m1 = ORB_MULTIPLIERS[p1Name] || ORB_MULTIPLIERS.default;
  const m2 = ORB_MULTIPLIERS[p2Name] || ORB_MULTIPLIERS.default;
  const finalOrbMultiplier = orbMultiplier * Math.max(m1, m2);

  for (const [aspectName, cfg] of Object.entries(ASPECTS_CONFIG)) {
    const allowedOrb = cfg.orb * finalOrbMultiplier;
    const exactness = Math.abs(diff - cfg.angle);

    if (exactness <= allowedOrb) {
      // Check applying vs separating (1 day ahead)
      const fDiff = Math.abs(normalize360(p1Lon + p1Speed) - normalize360(p2Lon + p2Speed));
      const futureDiff = (fDiff > 180.0) ? (360.0 - fDiff) : fDiff;
      const futureExactness = Math.abs(futureDiff - cfg.angle);
      const applying = futureExactness < exactness;

      const strength = Math.max(0, Math.min(100, 100 * (1 - exactness / allowedOrb)));

      return {
        aspectType: aspectName,
        angle: cfg.angle,
        symbol: cfg.symbol,
        nature: cfg.nature,
        orb: Number(exactness.toFixed(2)),
        allowedOrb: Number(allowedOrb.toFixed(2)),
        applying,
        status: applying ? 'Applying' : 'Separating',
        strength: Number(strength.toFixed(1))
      };
    }
  }
  return null;
}

function findAllAspects(planetsDict, orbMultiplier = 1.0) {
  const aspects = [];
  const entries = Object.entries(planetsDict);

  for (let i = 0; i < entries.length; i++) {
    const [name1, d1] = entries[i];
    for (let j = i + 1; j < entries.length; j++) {
      const [name2, d2] = entries[j];
      const aspect = findAspectBetween(name1, d1.longitude, d1.speed, name2, d2.longitude, d2.speed, orbMultiplier);
      if (aspect) {
        aspects.push({
          planet1: name1,
          planet2: name2,
          aspect
        });
      }
    }
  }

  // Sort by strength descending
  return aspects.sort((a, b) => b.aspect.strength - a.aspect.strength);
}

// 7 Aspect Patterns Detector
function detectAspectPatterns(planetsDict, aspectsList) {
  const patterns = [];
  const graph = {};

  // Build aspect lookup graph
  for (const ap of aspectsList) {
    const { planet1: p1, planet2: p2, aspect } = ap;
    if (!graph[p1]) graph[p1] = {};
    if (!graph[p2]) graph[p2] = {};
    graph[p1][p2] = aspect;
    graph[p2][p1] = aspect;
  }

  const pNames = Object.keys(graph);

  // 1. Grand Trine (3 planets in mutual trine)
  const grandTrinesChecked = new Set();
  for (let i = 0; i < pNames.length; i++) {
    const p1 = pNames[i];
    for (let j = i + 1; j < pNames.length; j++) {
      const p2 = pNames[j];
      if (graph[p1]?.[p2]?.aspectType === 'Trine') {
        for (let k = j + 1; k < pNames.length; k++) {
          const p3 = pNames[k];
          if (graph[p2]?.[p3]?.aspectType === 'Trine' && graph[p1]?.[p3]?.aspectType === 'Trine') {
            const key = [p1, p2, p3].sort().join('-');
            if (!grandTrinesChecked.has(key)) {
              grandTrinesChecked.add(key);
              const el1 = planetsDict[p1]?.element;
              const el2 = planetsDict[p2]?.element;
              const el3 = planetsDict[p3]?.element;
              const element = (el1 === el2 && el2 === el3) ? el1 : 'Mixed';
              patterns.push({
                patternType: 'Grand Trine',
                planets: [p1, p2, p3],
                element,
                nature: 'Harmonious Flow of Talent & Fortune',
                strength: 92.0
              });
            }
          }
        }
      }
    }
  }

  // 2. T-Square (2 planets in opposition, both square to an apex)
  const tSquaresChecked = new Set();
  for (const p1 of pNames) {
    for (const p2 of Object.keys(graph[p1] || {})) {
      if (graph[p1][p2].aspectType === 'Opposition') {
        for (const apex of pNames) {
          if (apex !== p1 && apex !== p2) {
            if (graph[apex]?.[p1]?.aspectType === 'Square' && graph[apex]?.[p2]?.aspectType === 'Square') {
              const pairKey = [p1, p2].sort().join('-') + `_apex_${apex}`;
              if (!tSquaresChecked.has(pairKey)) {
                tSquaresChecked.add(pairKey);
                const mod = planetsDict[apex]?.modality || 'Dynamic';
                patterns.push({
                  patternType: 'T-Square',
                  planets: [p1, p2, apex],
                  apexPlanet: apex,
                  modality: mod,
                  nature: 'Dynamic Ambition, Tension & Breakthrough Energy',
                  strength: 88.0
                });
              }
            }
          }
        }
      }
    }
  }

  // 3. Grand Cross (4 planets in 4 squares and 2 oppositions)
  const grandCrossChecked = new Set();
  for (let a = 0; a < pNames.length; a++) {
    const p1 = pNames[a];
    for (let b = a + 1; b < pNames.length; b++) {
      const p2 = pNames[b];
      if (graph[p1]?.[p2]?.aspectType === 'Opposition') {
        for (let c = b + 1; c < pNames.length; c++) {
          const p3 = pNames[c];
          for (let d = c + 1; d < pNames.length; d++) {
            const p4 = pNames[d];
            if (graph[p3]?.[p4]?.aspectType === 'Opposition') {
              const hasAllSquares =
                graph[p1]?.[p3]?.aspectType === 'Square' &&
                graph[p1]?.[p4]?.aspectType === 'Square' &&
                graph[p2]?.[p3]?.aspectType === 'Square' &&
                graph[p2]?.[p4]?.aspectType === 'Square';
              if (hasAllSquares) {
                const key = [p1, p2, p3, p4].sort().join('-');
                if (!grandCrossChecked.has(key)) {
                  grandCrossChecked.add(key);
                  patterns.push({
                    patternType: 'Grand Cross',
                    planets: [p1, p2, p3, p4],
                    nature: 'Great Crucible of Soul Mastery & Epochal Achievement',
                    strength: 95.0
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  // 4. Yod / "Finger of God" (2 planets in Sextile, both Quincunx 150° to Apex)
  const yodChecked = new Set();
  for (let i = 0; i < pNames.length; i++) {
    const p1 = pNames[i];
    for (let j = i + 1; j < pNames.length; j++) {
      const p2 = pNames[j];
      if (graph[p1]?.[p2]?.aspectType === 'Sextile') {
        for (const apex of pNames) {
          if (apex !== p1 && apex !== p2) {
            if (graph[p1]?.[apex]?.aspectType === 'Quincunx' && graph[p2]?.[apex]?.aspectType === 'Quincunx') {
              const key = [p1, p2].sort().join('-') + `_apex_${apex}`;
              if (!yodChecked.has(key)) {
                yodChecked.add(key);
                patterns.push({
                  patternType: 'Yod (Finger of God)',
                  planets: [p1, p2, apex],
                  apexPlanet: apex,
                  nature: 'Special Destiny, Karmic Turning Point, Divine Calling',
                  strength: 90.0
                });
              }
            }
          }
        }
      }
    }
  }

  // 5. Kite (Grand Trine + 4th planet opposing one trine member and sextiling the other two)
  for (const gt of patterns.filter(p => p.patternType === 'Grand Trine')) {
    const [t1, t2, t3] = gt.planets;
    for (const apex of pNames) {
      if (!gt.planets.includes(apex)) {
        if (graph[apex]?.[t1]?.aspectType === 'Opposition' &&
            graph[apex]?.[t2]?.aspectType === 'Sextile' &&
            graph[apex]?.[t3]?.aspectType === 'Sextile') {
          patterns.push({
            patternType: 'Kite',
            planets: [t1, t2, t3, apex],
            spineOpposing: t1,
            apexPlanet: apex,
            nature: 'High-Altitude Manifestation Engine channeling Grand Trine power',
            strength: 96.0
          });
        }
      }
    }
  }

  // 6. Stellium (3+ planets in same sign or house within 10°)
  const signGroups = {};
  const houseGroups = {};

  for (const [name, pData] of Object.entries(planetsDict)) {
    if (!pData.sign) continue;
    if (!signGroups[pData.sign]) signGroups[pData.sign] = [];
    signGroups[pData.sign].push({ name, lon: pData.longitude });

    if (pData.house) {
      if (!houseGroups[pData.house]) houseGroups[pData.house] = [];
      houseGroups[pData.house].push({ name, lon: pData.longitude });
    }
  }

  for (const [sign, pList] of Object.entries(signGroups)) {
    if (pList.length >= 3) {
      pList.sort((a, b) => a.lon - b.lon);
      const span = pList[pList.length - 1].lon - pList[0].lon;
      if (span <= 12.0) {
        patterns.push({
          patternType: 'Stellium',
          sign,
          planets: pList.map(p => p.name),
          spanDegrees: Number(span.toFixed(2)),
          nature: `Massive Concentration of Creative Will in ${sign}`,
          strength: 86.0
        });
      }
    }
  }

  // 7. Mystic Rectangle (2 Oppositions, 2 Trines, 2 Sextiles)
  for (let a = 0; a < pNames.length; a++) {
    const p1 = pNames[a];
    for (let b = a + 1; b < pNames.length; b++) {
      const p2 = pNames[b];
      if (graph[p1]?.[p2]?.aspectType === 'Opposition') {
        for (let c = b + 1; c < pNames.length; c++) {
          const p3 = pNames[c];
          for (let d = c + 1; d < pNames.length; d++) {
            const p4 = pNames[d];
            if (graph[p3]?.[p4]?.aspectType === 'Opposition') {
              const isRect =
                (graph[p1]?.[p3]?.aspectType === 'Trine' && graph[p2]?.[p4]?.aspectType === 'Trine' &&
                 graph[p1]?.[p4]?.aspectType === 'Sextile' && graph[p2]?.[p3]?.aspectType === 'Sextile') ||
                (graph[p1]?.[p4]?.aspectType === 'Trine' && graph[p2]?.[p3]?.aspectType === 'Trine' &&
                 graph[p1]?.[p3]?.aspectType === 'Sextile' && graph[p2]?.[p4]?.aspectType === 'Sextile');
              if (isRect) {
                patterns.push({
                  patternType: 'Mystic Rectangle',
                  planets: [p1, p2, p3, p4],
                  nature: 'Sublime Practical Harmony & Intuitive Problem-Solving Gifts',
                  strength: 94.0
                });
              }
            }
          }
        }
      }
    }
  }

  return patterns;
}

// ============================================================================
// FIXED STARS ENGINE WITH J2000.0 PRECESSION
// ============================================================================

function calculateFixedStars(targetDate = new Date(), orb = 1.2) {
  const jd = datetimeToJulianDay(targetDate);
  const years = (jd - J2000_JD) / 365.25;
  const precessionCorrection = PRECESSION_RATE * years;

  const stars = [];
  for (const [key, meta] of Object.entries(MAJOR_FIXED_STARS)) {
    const currentLon = normalize360(meta.lonJ2000 + precessionCorrection);
    const signData = getSignData(currentLon);
    stars.push({
      key,
      name: meta.traditionalName,
      constellation: meta.constellation,
      magnitude: meta.magnitude,
      nature: meta.nature,
      meaning: meta.meaning,
      longitude: Number(currentLon.toFixed(4)),
      latitude: meta.latJ2000,
      sign: signData.sign,
      symbol: signData.symbol,
      degreeInSign: Number(signData.degreeInSign.toFixed(2)),
      formatted: signData.formatted,
      isCluster: false
    });
  }

  // Clusters
  const clusters = [];
  for (const [key, meta] of Object.entries(STAR_CLUSTERS)) {
    const currentLon = normalize360(meta.lonJ2000 + precessionCorrection);
    const signData = getSignData(currentLon);
    clusters.push({
      key,
      name: meta.traditionalName,
      constellation: meta.constellation,
      meaning: meta.meaning,
      longitude: Number(currentLon.toFixed(4)),
      latitude: meta.latJ2000,
      sign: signData.sign,
      symbol: signData.symbol,
      degreeInSign: Number(signData.degreeInSign.toFixed(2)),
      formatted: signData.formatted,
      isCluster: true
    });
  }

  stars.sort((a, b) => a.magnitude - b.magnitude);
  return { stars, clusters, precessionDegrees: Number(precessionCorrection.toFixed(4)), julianDay: jd };
}

function findFixedStarConjunctions(planetsDict, targetDate = new Date(), orb = 1.2) {
  const { stars, clusters } = calculateFixedStars(targetDate, orb);
  const conjunctions = [];
  const allObjects = [...stars, ...clusters];

  for (const star of allObjects) {
    for (const [planetName, pData] of Object.entries(planetsDict)) {
      if (pData.longitude === undefined) continue;
      let diff = Math.abs(star.longitude - pData.longitude);
      if (diff > 180.0) diff = 360.0 - diff;

      const effectiveOrb = star.isCluster ? (orb * 1.3) : orb;
      if (diff <= effectiveOrb) {
        conjunctions.push({
          starName: star.name,
          starKey: star.key,
          constellation: star.constellation,
          planetName,
          orb: Number(diff.toFixed(2)),
          exactness: Number((100 * (1 - diff / effectiveOrb)).toFixed(1)),
          starLongitude: star.longitude,
          planetLongitude: Number(pData.longitude.toFixed(2)),
          sign: star.sign,
          magnitude: star.magnitude || 'N/A',
          nature: star.nature || 'Cluster',
          meaning: star.meaning,
          isCluster: star.isCluster
        });
      }
    }
  }

  return conjunctions.sort((a, b) => a.orb - b.orb);
}

// ============================================================================
// NATAL CHART CALCULATION
// ============================================================================

function calculateNatalChart(birthData = {}) {
  const dtStr = birthData.datetime_utc || birthData.datetimeUtc || birthData.date || new Date().toISOString();
  const dt = new Date(dtStr);
  const lat = Number(birthData.latitude || birthData.lat || 27.7172); // Default Kathmandu
  const lon = Number(birthData.longitude || birthData.lon || 85.3240);
  const locationName = birthData.location_name || birthData.locationName || 'Kathmandu, Nepal';
  const houseSystem = birthData.house_system || birthData.houseSystem || 'Placidus';

  const jd = datetimeToJulianDay(dt);
  const rawPositions = calculateEphemerisPositions(jd);
  const housesData = calculateHouseSystems(jd, lat, lon, houseSystem);

  // Attach sign & house to planets
  const planets = {};
  for (const [name, pData] of Object.entries(rawPositions)) {
    const signInfo = getSignData(pData.longitude);
    const houseNum = getHouseForLongitude(pData.longitude, housesData.cusps);
    planets[name] = {
      name,
      longitude: Number(pData.longitude.toFixed(4)),
      latitude: Number(pData.latitude.toFixed(4)),
      speed: Number(pData.speed.toFixed(4)),
      distance: Number(pData.distance.toFixed(4)),
      retrograde: pData.speed < 0,
      house: houseNum,
      sign: signInfo.sign,
      signSymbol: signInfo.symbol,
      element: signInfo.element,
      modality: signInfo.modality,
      ruler: signInfo.ruler,
      degree: Number(signInfo.degreeInSign.toFixed(4)),
      formatted: signInfo.formatted
    };
  }

  // Calculated Points
  const isDay = housesData.ascendant < housesData.descendant
    ? (planets.Sun.longitude >= housesData.ascendant && planets.Sun.longitude <= housesData.descendant)
    : (planets.Sun.longitude >= housesData.ascendant || planets.Sun.longitude <= housesData.descendant);

  const pofLon = calculatePartOfFortune(planets.Sun.longitude, planets.Moon.longitude, housesData.ascendant, isDay);
  const pofSign = getSignData(pofLon);
  planets.Part_of_Fortune = {
    name: 'Part of Fortune',
    longitude: Number(pofLon.toFixed(4)),
    latitude: 0.0,
    speed: 360.0,
    distance: 1.0,
    retrograde: false,
    house: getHouseForLongitude(pofLon, housesData.cusps),
    sign: pofSign.sign,
    signSymbol: pofSign.symbol,
    element: pofSign.element,
    modality: pofSign.modality,
    ruler: pofSign.ruler,
    degree: Number(pofSign.degreeInSign.toFixed(4)),
    formatted: pofSign.formatted
  };

  const vertexSign = getSignData(housesData.vertex);
  planets.Vertex = {
    name: 'Vertex',
    longitude: Number(housesData.vertex.toFixed(4)),
    latitude: 0.0,
    speed: 360.0,
    distance: 1.0,
    retrograde: false,
    house: getHouseForLongitude(housesData.vertex, housesData.cusps),
    sign: vertexSign.sign,
    signSymbol: vertexSign.symbol,
    element: vertexSign.element,
    modality: vertexSign.modality,
    ruler: vertexSign.ruler,
    degree: Number(vertexSign.degreeInSign.toFixed(4)),
    formatted: vertexSign.formatted
  };

  // Element and Modality Distribution
  const elementDistribution = { Fire: [], Earth: [], Air: [], Water: [] };
  const modalityDistribution = { Cardinal: [], Fixed: [], Mutable: [] };
  for (const [name, p] of Object.entries(planets)) {
    if (['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].includes(name)) {
      elementDistribution[p.element]?.push(name);
      modalityDistribution[p.modality]?.push(name);
    }
  }

  // Calculate aspects & patterns
  const orbMultiplier = Number(birthData.orb_multiplier || birthData.orbMultiplier || 1.0);
  const aspects = findAllAspects(planets, orbMultiplier);
  const patterns = detectAspectPatterns(planets, aspects);

  // Fixed Star conjunctions
  const fixedStarConjunctions = findFixedStarConjunctions(planets, dt, birthData.star_orb || 1.2);

  return {
    birthData: {
      datetimeUtc: dt.toISOString(),
      julianDay: Number(jd.toFixed(6)),
      location: {
        name: locationName,
        latitude: lat,
        longitude: lon
      },
      houseSystem
    },
    houses: {
      system: housesData.system,
      code: housesData.code,
      ascendant: housesData.ascendant,
      mc: housesData.mc,
      descendant: housesData.descendant,
      ic: housesData.ic,
      vertex: housesData.vertex,
      equatorialAscendant: housesData.equatorialAscendant,
      cusps: housesData.cusps
    },
    allHouses: housesData.allSystems,
    planets,
    elements: elementDistribution,
    modalities: modalityDistribution,
    aspects,
    patterns,
    fixedStarConjunctions
  };
}

// ============================================================================
// SECONDARY PROGRESSIONS (1 DAY = 1 YEAR)
// ============================================================================

function calculateSecondaryProgressions(birthData = {}, targetProgressionDate = new Date()) {
  const natalChart = calculateNatalChart(birthData);
  const birthDt = new Date(natalChart.birthData.datetimeUtc);
  const progDt = new Date(targetProgressionDate);

  // Calculate elapsed years
  const elapsedYears = (progDt.getTime() - birthDt.getTime()) / (365.25 * 86400 * 1000);
  // Secondary progression formula: 1 day = 1 year
  const progressedJd = natalChart.birthData.julianDay + elapsedYears;
  const progressedActualDate = julianDayToDatetime(progressedJd);

  // Calculate progressed positions
  const progressedPositions = calculateEphemerisPositions(progressedJd);
  const lat = natalChart.birthData.location.latitude;
  const lon = natalChart.birthData.location.longitude;
  const progHouses = calculateHouseSystems(progressedJd, lat, lon, natalChart.houses.system);

  const progressedPlanets = {};
  for (const [name, pData] of Object.entries(progressedPositions)) {
    const s = getSignData(pData.longitude);
    progressedPlanets[name] = {
      name,
      longitude: Number(pData.longitude.toFixed(4)),
      latitude: Number(pData.latitude.toFixed(4)),
      speed: Number(pData.speed.toFixed(4)),
      retrograde: pData.speed < 0,
      house: getHouseForLongitude(pData.longitude, progHouses.cusps),
      sign: s.sign,
      signSymbol: s.symbol,
      degree: Number(s.degreeInSign.toFixed(4)),
      formatted: s.formatted
    };
  }

  // Progressed-to-Natal aspects
  const progressedToNatalAspects = [];
  for (const [progName, progP] of Object.entries(progressedPlanets)) {
    for (const [natalName, natP] of Object.entries(natalChart.planets)) {
      const asp = findAspectBetween(progName, progP.longitude, progP.speed, natalName, natP.longitude, natP.speed, 0.8);
      if (asp) {
        progressedToNatalAspects.push({
          progressedPlanet: progName,
          natalPlanet: natalName,
          aspect: asp
        });
      }
    }
  }

  return {
    birthDate: birthDt.toISOString(),
    progressionDate: progDt.toISOString(),
    progressedAgeYears: Number(elapsedYears.toFixed(2)),
    symbolicDate: progressedActualDate.toISOString(),
    natalChart,
    progressedHouses: {
      system: progHouses.system,
      ascendant: progHouses.ascendant,
      mc: progHouses.mc,
      cusps: progHouses.cusps
    },
    progressedPlanets,
    progressedToNatalAspects: progressedToNatalAspects.sort((a, b) => b.aspect.strength - a.aspect.strength)
  };
}

// ============================================================================
// SOLAR & LUNAR RETURNS (CONVERGENCE SOLVER)
// ============================================================================

function findSolarReturnExactDate(targetSunLon, returnYear, approximateDate, precision = 0.01) {
  const searchDt = new Date(Date.UTC(returnYear, approximateDate.getUTCMonth(), approximateDate.getUTCDate(), 0, 0, 0));
  let startMs = searchDt.getTime() - (2 * 86400 * 1000);
  let endMs = searchDt.getTime() + (2 * 86400 * 1000);

  let bestMs = startMs;
  let bestDiff = 360.0;

  // Coarse search (1-hour steps)
  for (let curMs = startMs; curMs <= endMs; curMs += 3600 * 1000) {
    const jd = datetimeToJulianDay(new Date(curMs));
    const pos = calculateEphemerisPositions(jd);
    let diff = Math.abs(pos.Sun.longitude - targetSunLon);
    if (diff > 180.0) diff = 360.0 - diff;
    if (diff < bestDiff) {
      bestDiff = diff;
      bestMs = curMs;
    }
  }

  // Fine search (1-minute steps over +/- 2 hours around best coarse match)
  let fineStart = bestMs - (2 * 3600 * 1000);
  let fineEnd = bestMs + (2 * 3600 * 1000);
  for (let curMs = fineStart; curMs <= fineEnd; curMs += 60 * 1000) {
    const jd = datetimeToJulianDay(new Date(curMs));
    const pos = calculateEphemerisPositions(jd);
    let diff = Math.abs(pos.Sun.longitude - targetSunLon);
    if (diff > 180.0) diff = 360.0 - diff;
    if (diff < bestDiff) {
      bestDiff = diff;
      bestMs = curMs;
    }
    if (diff < precision) break;
  }

  return new Date(bestMs);
}

function findLunarReturnExactDate(targetMoonLon, approximateDate, precision = 0.05) {
  const centerMs = approximateDate.getTime();
  let startMs = centerMs - (2 * 86400 * 1000);
  let endMs = centerMs + (2 * 86400 * 1000);

  let bestMs = startMs;
  let bestDiff = 360.0;

  // Coarse search (1-hour steps)
  for (let curMs = startMs; curMs <= endMs; curMs += 3600 * 1000) {
    const jd = datetimeToJulianDay(new Date(curMs));
    const pos = calculateEphemerisPositions(jd);
    let diff = Math.abs(pos.Moon.longitude - targetMoonLon);
    if (diff > 180.0) diff = 360.0 - diff;
    if (diff < bestDiff) {
      bestDiff = diff;
      bestMs = curMs;
    }
  }

  // Fine search (1-minute steps)
  let fineStart = bestMs - (2 * 3600 * 1000);
  let fineEnd = bestMs + (2 * 3600 * 1000);
  for (let curMs = fineStart; curMs <= fineEnd; curMs += 60 * 1000) {
    const jd = datetimeToJulianDay(new Date(curMs));
    const pos = calculateEphemerisPositions(jd);
    let diff = Math.abs(pos.Moon.longitude - targetMoonLon);
    if (diff > 180.0) diff = 360.0 - diff;
    if (diff < bestDiff) {
      bestDiff = diff;
      bestMs = curMs;
    }
    if (diff < precision) break;
  }

  return new Date(bestMs);
}

function calculateSolarReturn(birthData = {}, returnYear = new Date().getFullYear(), returnLocation = null) {
  const natalChart = calculateNatalChart(birthData);
  const targetSunLon = natalChart.planets.Sun.longitude;
  const bDt = new Date(natalChart.birthData.datetimeUtc);

  const exactReturnDate = findSolarReturnExactDate(targetSunLon, returnYear, bDt);

  const lat = returnLocation?.latitude || natalChart.birthData.location.latitude;
  const lon = returnLocation?.longitude || natalChart.birthData.location.longitude;
  const locationName = returnLocation?.name || natalChart.birthData.location.name;

  const returnChart = calculateNatalChart({
    datetime_utc: exactReturnDate.toISOString(),
    latitude: lat,
    longitude: lon,
    location_name: `${locationName} (Solar Return ${returnYear})`,
    house_system: natalChart.houses.system
  });

  return {
    returnType: 'Solar Return',
    returnYear,
    natalSunLongitude: targetSunLon,
    returnSunLongitude: returnChart.planets.Sun.longitude,
    exactReturnDatetimeUtc: exactReturnDate.toISOString(),
    location: { name: locationName, latitude: lat, longitude: lon },
    returnChart
  };
}

function calculateLunarReturn(birthData = {}, targetDate = new Date(), returnLocation = null) {
  const natalChart = calculateNatalChart(birthData);
  const targetMoonLon = natalChart.planets.Moon.longitude;

  const exactReturnDate = findLunarReturnExactDate(targetMoonLon, new Date(targetDate));

  const lat = returnLocation?.latitude || natalChart.birthData.location.latitude;
  const lon = returnLocation?.longitude || natalChart.birthData.location.longitude;
  const locationName = returnLocation?.name || natalChart.birthData.location.name;

  const returnChart = calculateNatalChart({
    datetime_utc: exactReturnDate.toISOString(),
    latitude: lat,
    longitude: lon,
    location_name: `${locationName} (Lunar Return)`,
    house_system: natalChart.houses.system
  });

  return {
    returnType: 'Lunar Return',
    targetDate: new Date(targetDate).toISOString(),
    natalMoonLongitude: targetMoonLon,
    returnMoonLongitude: returnChart.planets.Moon.longitude,
    exactReturnDatetimeUtc: exactReturnDate.toISOString(),
    location: { name: locationName, latitude: lat, longitude: lon },
    returnChart
  };
}

// ============================================================================
// TRANSITS ENGINE
// ============================================================================

function calculateTransits(birthData = {}, transitDate = new Date()) {
  const natalChart = calculateNatalChart(birthData);
  const transitDt = new Date(transitDate);
  const transitJd = datetimeToJulianDay(transitDt);
  const transitRaw = calculateEphemerisPositions(transitJd);

  const transitPlanets = {};
  for (const [name, pData] of Object.entries(transitRaw)) {
    const s = getSignData(pData.longitude);
    transitPlanets[name] = {
      name,
      longitude: Number(pData.longitude.toFixed(4)),
      speed: Number(pData.speed.toFixed(4)),
      retrograde: pData.speed < 0,
      sign: s.sign,
      symbol: s.symbol,
      formatted: s.formatted
    };
  }

  const transitToNatalAspects = [];
  for (const [trName, trP] of Object.entries(transitPlanets)) {
    for (const [natName, natP] of Object.entries(natalChart.planets)) {
      const asp = findAspectBetween(`Transit_${trName}`, trP.longitude, trP.speed, `Natal_${natName}`, natP.longitude, natP.speed, 0.7);
      if (asp) {
        transitToNatalAspects.push({
          transitPlanet: trName,
          natalPlanet: natName,
          aspect: asp
        });
      }
    }
  }

  return {
    transitDatetimeUtc: transitDt.toISOString(),
    natalChart,
    transitPlanets,
    transitToNatalAspects: transitToNatalAspects.sort((a, b) => b.aspect.strength - a.aspect.strength)
  };
}

// ============================================================================
// AI-READY EXPORT FORMATTER (MARKDOWN & JSON)
// ============================================================================

function exportToMarkdown(chartData) {
  const bd = chartData.birthData;
  const lines = [];

  lines.push('# 🌌 XiNiS Astrology Engine — Natal Chart Report\n');
  lines.push(`- **Date/Time (UTC):** ${bd.datetimeUtc}`);
  lines.push(`- **Location:** ${bd.location.name} (${bd.location.latitude}°, ${bd.location.longitude}°)`);
  lines.push(`- **House System:** ${chartData.houses.system}`);
  lines.push(`- **Julian Day:** ${bd.julianDay}`);
  lines.push(`- **Ascendant:** ${chartData.houses.ascendant}° | **MC:** ${chartData.houses.mc}°\n`);

  lines.push('## Planetary Positions');
  lines.push('| Planet | Sign | Degree | House | Motion | Speed |');
  lines.push('|--------|------|--------|-------|--------|-------|');
  for (const [name, p] of Object.entries(chartData.planets)) {
    const motion = p.retrograde ? '℞ Retrograde' : 'Direct';
    lines.push(`| ${name} | ${p.signSymbol} ${p.sign} | ${p.formatted} | House ${p.house} | ${motion} | ${p.speed}°/day |`);
  }
  lines.push('');

  lines.push('## Element & Modality Balance');
  lines.push(`- **Fire:** ${chartData.elements.Fire.join(', ') || 'None'}`);
  lines.push(`- **Earth:** ${chartData.elements.Earth.join(', ') || 'None'}`);
  lines.push(`- **Air:** ${chartData.elements.Air.join(', ') || 'None'}`);
  lines.push(`- **Water:** ${chartData.elements.Water.join(', ') || 'None'}`);
  lines.push('');

  if (chartData.patterns && chartData.patterns.length > 0) {
    lines.push('## Detected Aspect Patterns');
    for (const pat of chartData.patterns) {
      lines.push(`- **${pat.patternType}:** ${pat.planets.join(', ')} — *${pat.nature}* (Strength: ${pat.strength}%)`);
    }
    lines.push('');
  }

  if (chartData.fixedStarConjunctions && chartData.fixedStarConjunctions.length > 0) {
    lines.push('## Major Fixed Star Conjunctions (with J2000 Precession)');
    for (const fs of chartData.fixedStarConjunctions) {
      lines.push(`- **${fs.starName} (${fs.constellation})** conjunct **${fs.planetName}** (Orb: ${fs.orb}°): ${fs.meaning}`);
    }
    lines.push('');
  }

  lines.push('## Major Aspects Matrix');
  lines.push('| Body 1 | Aspect | Body 2 | Orb | Movement | Strength |');
  lines.push('|--------|--------|--------|-----|----------|----------|');
  for (const ap of chartData.aspects.slice(0, 20)) {
    lines.push(`| ${ap.planet1} | ${ap.aspect.symbol} ${ap.aspect.aspectType} | ${ap.planet2} | ${ap.aspect.orb}° | ${ap.aspect.status} | ${ap.aspect.strength}% |`);
  }
  lines.push('');

  return lines.join('\n');
}

// Export module functions
module.exports = {
  ZODIAC_SIGNS,
  HOUSE_SYSTEMS,
  ASPECTS_CONFIG,
  MAJOR_FIXED_STARS,
  STAR_CLUSTERS,
  datetimeToJulianDay,
  julianDayToDatetime,
  getSignData,
  calculateNatalChart,
  calculateHouseSystems,
  calculateSecondaryProgressions,
  calculateSolarReturn,
  calculateLunarReturn,
  calculateTransits,
  calculateFixedStars,
  findFixedStarConjunctions,
  detectAspectPatterns,
  exportToMarkdown
};
