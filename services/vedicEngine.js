/**
 * services/vedicEngine.js
 * Comprehensive Vedic Astrology Engine inspired by:
 * - svarbhanu/grahan (Astrological computations, Panchang, Dasha)
 * - mrigankad/Nakshatra (36 Guna Ashtakoot Milan, Dasha balance, Nakshatra characteristics)
 * - siddhant7482/astrocircle & RoxyAPI/ui (Astrocircle Celestial Wheel SVG)
 * - RoxyAPI/jyotish-vedic-astrology-app (D9 Navamsha calculation)
 */

// 27 Nakshatras with Lords, Gana, Yoni, and Nadi
const NAKSHATRA_DATA = [
  { id: 1, name: 'अश्विनी (Ashwini)', lord: 'Ketu', gana: 'Deva', yoni: 'Horse', nadi: 'Adi', varna: 'Vaishya' },
  { id: 2, name: 'भरणी (Bharani)', lord: 'Venus', gana: 'Manushya', yoni: 'Elephant', nadi: 'Madhya', varna: 'Shudra' },
  { id: 3, name: 'कृत्तिका (Krittika)', lord: 'Sun', gana: 'Rakshasa', yoni: 'Sheep', nadi: 'Antya', varna: 'Brahmin' },
  { id: 4, name: 'रोहिणी (Rohini)', lord: 'Moon', gana: 'Manushya', yoni: 'Serpent', nadi: 'Antya', varna: 'Shudra' },
  { id: 5, name: 'मृगशिरा (Mrigashira)', lord: 'Mars', gana: 'Deva', yoni: 'Serpent', nadi: 'Madhya', varna: 'Vaishya' },
  { id: 6, name: 'आर्द्रा (Ardra)', lord: 'Rahu', gana: 'Manushya', yoni: 'Dog', nadi: 'Adi', varna: 'Shudra' },
  { id: 7, name: 'पुनर्वसु (Punarvasu)', lord: 'Jupiter', gana: 'Deva', yoni: 'Cat', nadi: 'Adi', varna: 'Brahmin' },
  { id: 8, name: 'पुष्य (Pushya)', lord: 'Saturn', gana: 'Deva', yoni: 'Sheep', nadi: 'Madhya', varna: 'Kshatriya' },
  { id: 9, name: 'आश्लेषा (Ashlesha)', lord: 'Mercury', gana: 'Rakshasa', yoni: 'Cat', nadi: 'Antya', varna: 'Shudra' },
  { id: 10, name: 'मघा (Magha)', lord: 'Ketu', gana: 'Rakshasa', yoni: 'Rat', nadi: 'Antya', varna: 'Shudra' },
  { id: 11, name: 'पूर्वाफाल्गुनी (Purva Phalguni)', lord: 'Venus', gana: 'Manushya', yoni: 'Rat', nadi: 'Madhya', varna: 'Brahmin' },
  { id: 12, name: 'उत्तराफाल्गुनी (Uttara Phalguni)', lord: 'Sun', gana: 'Manushya', yoni: 'Cow', nadi: 'Adi', varna: 'Kshatriya' },
  { id: 13, name: 'हस्त (Hasta)', lord: 'Moon', gana: 'Deva', yoni: 'Buffalo', nadi: 'Adi', varna: 'Vaishya' },
  { id: 14, name: 'चित्रा (Chitra)', lord: 'Mars', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Madhya', varna: 'Shudra' },
  { id: 15, name: 'स्वाती (Swati)', lord: 'Rahu', gana: 'Deva', yoni: 'Buffalo', nadi: 'Antya', varna: 'Shudra' },
  { id: 16, name: 'विशाखा (Vishakha)', lord: 'Jupiter', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Antya', varna: 'Brahmin' },
  { id: 17, name: 'अनुराधा (Anuradha)', lord: 'Saturn', gana: 'Deva', yoni: 'Deer', nadi: 'Madhya', varna: 'Shudra' },
  { id: 18, name: 'ज्येष्ठा (Jyeshtha)', lord: 'Mercury', gana: 'Rakshasa', yoni: 'Deer', nadi: 'Adi', varna: 'Shudra' },
  { id: 19, name: 'मूल (Mula)', lord: 'Ketu', gana: 'Rakshasa', yoni: 'Dog', nadi: 'Adi', varna: 'Shudra' },
  { id: 20, name: 'पूर्वाषाढा (Purva Ashadha)', lord: 'Venus', gana: 'Manushya', yoni: 'Monkey', nadi: 'Madhya', varna: 'Brahmin' },
  { id: 21, name: 'उत्तराषाढा (Uttara Ashadha)', lord: 'Sun', gana: 'Manushya', yoni: 'Mongoose', nadi: 'Antya', varna: 'Kshatriya' },
  { id: 22, name: 'श्रवण (Shravana)', lord: 'Moon', gana: 'Deva', yoni: 'Monkey', nadi: 'Antya', varna: 'Shudra' },
  { id: 23, name: 'धनिष्ठा (Dhanishta)', lord: 'Mars', gana: 'Rakshasa', yoni: 'Lion', nadi: 'Madhya', varna: 'Vaishya' },
  { id: 24, name: 'शतभिषा (Shatabhisha)', lord: 'Rahu', gana: 'Rakshasa', yoni: 'Horse', nadi: 'Adi', varna: 'Shudra' },
  { id: 25, name: 'पूर्वाभाद्रपदा (Purva Bhadrapada)', lord: 'Jupiter', gana: 'Manushya', yoni: 'Lion', nadi: 'Adi', varna: 'Brahmin' },
  { id: 26, name: 'उत्तराभाद्रपदा (Uttara Bhadrapada)', lord: 'Saturn', gana: 'Manushya', yoni: 'Cow', nadi: 'Madhya', varna: 'Kshatriya' },
  { id: 27, name: 'रेवती (Revati)', lord: 'Mercury', gana: 'Deva', yoni: 'Elephant', nadi: 'Antya', varna: 'Shudra' }
];

// Vimshottari Dasha planetary periods in years
const DASHA_YEARS = {
  'Ketu': 7,
  'Venus': 20,
  'Sun': 6,
  'Moon': 10,
  'Mars': 7,
  'Rahu': 18,
  'Jupiter': 16,
  'Saturn': 19,
  'Mercury': 17
};

const DASHA_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

const RASHI_LORDS = {
  1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon', 5: 'Sun', 6: 'Mercury',
  7: 'Venus', 8: 'Mars', 9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter'
};

const RASHI_NAMES = {
  1: 'मेष (Aries)', 2: 'वृष (Taurus)', 3: 'मिथुन (Gemini)', 4: 'कर्क (Cancer)',
  5: 'सिंह (Leo)', 6: 'कन्या (Virgo)', 7: 'तुला (Libra)', 8: 'वृश्चिक (Scorpio)',
  9: 'धनु (Sagittarius)', 10: 'मकर (Capricorn)', 11: 'कुम्भ (Aquarius)', 12: 'मीन (Pisces)'
};

// Animal Yoni Enemy Matrix for Yoni Kuta (0 to 4 points)
const YONI_COMPATIBILITY = {
  'Horse': { 'Horse': 4, 'Elephant': 3, 'Sheep': 2, 'Serpent': 2, 'Dog': 2, 'Cat': 2, 'Rat': 2, 'Cow': 2, 'Buffalo': 0, 'Tiger': 1, 'Deer': 3, 'Monkey': 2, 'Mongoose': 2, 'Lion': 1 },
  'Elephant': { 'Horse': 3, 'Elephant': 4, 'Sheep': 3, 'Serpent': 2, 'Dog': 2, 'Cat': 2, 'Rat': 2, 'Cow': 2, 'Buffalo': 3, 'Tiger': 1, 'Deer': 2, 'Monkey': 2, 'Mongoose': 2, 'Lion': 0 },
  'Sheep': { 'Horse': 2, 'Elephant': 3, 'Sheep': 4, 'Serpent': 2, 'Dog': 2, 'Cat': 2, 'Rat': 2, 'Cow': 3, 'Buffalo': 2, 'Tiger': 2, 'Deer': 2, 'Monkey': 0, 'Mongoose': 2, 'Lion': 2 },
  'Serpent': { 'Horse': 2, 'Elephant': 2, 'Sheep': 2, 'Serpent': 4, 'Dog': 2, 'Cat': 2, 'Rat': 2, 'Cow': 2, 'Buffalo': 2, 'Tiger': 2, 'Deer': 2, 'Monkey': 2, 'Mongoose': 0, 'Lion': 2 },
  'Dog': { 'Horse': 2, 'Elephant': 2, 'Sheep': 2, 'Serpent': 2, 'Dog': 4, 'Cat': 2, 'Rat': 2, 'Cow': 2, 'Buffalo': 2, 'Tiger': 2, 'Deer': 0, 'Monkey': 2, 'Mongoose': 2, 'Lion': 2 },
  'Cat': { 'Horse': 2, 'Elephant': 2, 'Sheep': 2, 'Serpent': 2, 'Dog': 2, 'Cat': 4, 'Rat': 0, 'Cow': 2, 'Buffalo': 2, 'Tiger': 2, 'Deer': 2, 'Monkey': 2, 'Mongoose': 2, 'Lion': 2 },
  'Rat': { 'Horse': 2, 'Elephant': 2, 'Sheep': 2, 'Serpent': 2, 'Dog': 2, 'Cat': 0, 'Rat': 4, 'Cow': 2, 'Buffalo': 2, 'Tiger': 2, 'Deer': 2, 'Monkey': 2, 'Mongoose': 2, 'Lion': 2 },
  'Cow': { 'Horse': 2, 'Elephant': 2, 'Sheep': 3, 'Serpent': 2, 'Dog': 2, 'Cat': 2, 'Rat': 2, 'Cow': 4, 'Buffalo': 3, 'Tiger': 0, 'Deer': 2, 'Monkey': 2, 'Mongoose': 2, 'Lion': 2 },
  'Buffalo': { 'Horse': 0, 'Elephant': 3, 'Sheep': 2, 'Serpent': 2, 'Dog': 2, 'Cat': 2, 'Rat': 2, 'Cow': 3, 'Buffalo': 4, 'Tiger': 1, 'Deer': 2, 'Monkey': 2, 'Mongoose': 2, 'Lion': 2 },
  'Tiger': { 'Horse': 1, 'Elephant': 1, 'Sheep': 2, 'Serpent': 2, 'Dog': 2, 'Cat': 2, 'Rat': 2, 'Cow': 0, 'Buffalo': 1, 'Tiger': 4, 'Deer': 1, 'Monkey': 2, 'Mongoose': 2, 'Lion': 2 },
  'Deer': { 'Horse': 3, 'Elephant': 2, 'Sheep': 2, 'Serpent': 2, 'Dog': 0, 'Cat': 2, 'Rat': 2, 'Cow': 2, 'Buffalo': 2, 'Tiger': 1, 'Deer': 4, 'Monkey': 2, 'Mongoose': 2, 'Lion': 2 },
  'Monkey': { 'Horse': 2, 'Elephant': 2, 'Sheep': 0, 'Serpent': 2, 'Dog': 2, 'Cat': 2, 'Rat': 2, 'Cow': 2, 'Buffalo': 2, 'Tiger': 2, 'Deer': 2, 'Monkey': 4, 'Mongoose': 2, 'Lion': 2 },
  'Mongoose': { 'Horse': 2, 'Elephant': 2, 'Sheep': 2, 'Serpent': 0, 'Dog': 2, 'Cat': 2, 'Rat': 2, 'Cow': 2, 'Buffalo': 2, 'Tiger': 2, 'Deer': 2, 'Monkey': 2, 'Mongoose': 4, 'Lion': 2 },
  'Lion': { 'Horse': 1, 'Elephant': 0, 'Sheep': 2, 'Serpent': 2, 'Dog': 2, 'Cat': 2, 'Rat': 2, 'Cow': 2, 'Buffalo': 2, 'Tiger': 2, 'Deer': 2, 'Monkey': 2, 'Mongoose': 2, 'Lion': 4 }
};

/**
 * 1. Vimshottari Dasha Calculator
 */
function calculateVimshottariDasha(birthYear, birthMonth, birthDay, moonLongitude) {
  // Moon longitude (0-360)
  const nakshatraSpan = 360 / 27; // 13.3333 degrees
  const nakIndex = Math.floor(moonLongitude / nakshatraSpan);
  const nak = NAKSHATRA_DATA[nakIndex % 27];
  const passedDeg = moonLongitude % nakshatraSpan;
  const remainingFraction = 1 - (passedDeg / nakshatraSpan);

  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
  const dashaLord = nak.lord;
  const dashaDuration = DASHA_YEARS[dashaLord];
  const balanceYears = dashaDuration * remainingFraction;

  let currentDate = new Date(birthDate);
  const dashaTimeline = [];

  // 1st Dasha (Birth Dasha Balance)
  const firstEnd = new Date(currentDate.getTime() + balanceYears * 365.25 * 24 * 3600 * 1000);
  dashaTimeline.push({
    lord: dashaLord,
    years: Number(balanceYears.toFixed(2)),
    start: currentDate.toISOString().split('T')[0],
    end: firstEnd.toISOString().split('T')[0],
    isCurrent: false
  });
  currentDate = new Date(firstEnd);

  // Subsequent 8 Dashas
  let lordIdx = (DASHA_ORDER.indexOf(dashaLord) + 1) % DASHA_ORDER.length;
  for (let i = 0; i < 8; i++) {
    const nextLord = DASHA_ORDER[lordIdx];
    const duration = DASHA_YEARS[nextLord];
    const endDate = new Date(currentDate.getTime() + duration * 365.25 * 24 * 3600 * 1000);
    dashaTimeline.push({
      lord: nextLord,
      years: duration,
      start: currentDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      isCurrent: false
    });
    currentDate = new Date(endDate);
    lordIdx = (lordIdx + 1) % DASHA_ORDER.length;
  }

  // Mark current dasha
  const now = new Date();
  let currentDasha = null;
  for (const d of dashaTimeline) {
    const s = new Date(d.start);
    const e = new Date(d.end);
    if (now >= s && now <= e) {
      d.isCurrent = true;
      currentDasha = d;
      break;
    }
  }

  return {
    birthNakshatra: nak.name,
    startingDasha: dashaLord,
    balanceYears: balanceYears.toFixed(2),
    currentDasha: currentDasha ? currentDasha.lord : (dashaTimeline[0] ? dashaTimeline[0].lord : 'Ketu'),
    timeline: dashaTimeline
  };
}

/**
 * 2. Ashtakoot 36 Guna Milan (Kundali Matching) Engine
 */
function calculateAshtakootMilan(boyData, girlData) {
  // boyData: { nakshatraId (1-27), rashiId (1-12) }
  // girlData: { nakshatraId (1-27), rashiId (1-12) }
  const bNak = NAKSHATRA_DATA[(boyData.nakshatraId - 1) % 27];
  const gNak = NAKSHATRA_DATA[(girlData.nakshatraId - 1) % 27];
  const bRashi = boyData.rashiId;
  const gRashi = girlData.rashiId;

  const result = {
    varna: { max: 1, score: 0, title: 'वर्ण (Varna - कार्य/स्वभाव सामंजस्य)', desc: '' },
    vashya: { max: 2, score: 0, title: 'वश्य (Vashya - आकर्षण र नियन्त्रण)', desc: '' },
    tara: { max: 3, score: 0, title: 'तारा (Tara - भाग्य र स्वास्थ्य)', desc: '' },
    yoni: { max: 4, score: 0, title: 'योनि (Yoni - जैविक तथा शारीरिक सम्बन्ध)', desc: '' },
    grahaMaitri: { max: 5, score: 0, title: 'ग्रह मैत्री (Graha Maitri - मानसिक अनुकूलता)', desc: '' },
    gana: { max: 6, score: 0, title: 'गण (Gana - स्वभाव र चरित्र)', desc: '' },
    bhakoot: { max: 7, score: 0, title: 'भकूट (Bhakoot - वंश वृद्धि र समृद्धि)', desc: '' },
    nadi: { max: 8, score: 0, title: 'नाडी (Nadi - सन्तान सुख र आनुवंशिक स्वास्थ्य)', desc: '' },
    total: 0,
    status: '',
    doshas: [],
    remedies: []
  };

  // 1. Varna (1 Point)
  const varnaOrder = { 'Brahmin': 4, 'Kshatriya': 3, 'Vaishya': 2, 'Shudra': 1 };
  if ((varnaOrder[bNak.varna] || 1) >= (varnaOrder[gNak.varna] || 1)) {
    result.varna.score = 1;
    result.varna.desc = 'वरको वर्ण वधू समान वा उच्च रहेकोले पूर्ण अनुकूल।';
  } else {
    result.varna.score = 0;
    result.varna.desc = 'वर्ण सामान्य भिन्नता, मित्र राशि भएमा दोष हट्छ।';
  }

  // 2. Vashya (2 Points)
  if (bRashi === gRashi) {
    result.vashya.score = 2;
    result.vashya.desc = 'एकै राशि भएकोले पूर्ण वश्य अनुकूलता।';
  } else {
    const diff = Math.abs(bRashi - gRashi);
    result.vashya.score = (diff === 4 || diff === 8) ? 2 : (diff === 6 ? 0.5 : 1);
    result.vashya.desc = `वश्य अनुकूलता: ${result.vashya.score}/2 प्राप्त।`;
  }

  // 3. Tara (3 Points)
  const taraCountBoyToGirl = (gNak.id - bNak.id + 27) % 9;
  const taraCountGirlToBoy = (bNak.id - gNak.id + 27) % 9;
  const auspiciousTaras = [1, 2, 4, 6, 8]; // Sampat, Kshema, Sadhaka, Mitra, Paramamitra
  const boyGood = auspiciousTaras.includes(taraCountBoyToGirl);
  const girlGood = auspiciousTaras.includes(taraCountGirlToBoy);

  if (boyGood && girlGood) {
    result.tara.score = 3;
    result.tara.desc = 'दुबैको तारा शुभ छ, भाग्य र दीर्घायु वृद्धि।';
  } else if (boyGood || girlGood) {
    result.tara.score = 1.5;
    result.tara.desc = 'एकतर्फी तारा शुभ, मध्यम अनुकूलता।';
  } else {
    result.tara.score = 0;
    result.tara.desc = 'तारा प्रतिकूल, तारा शुद्धि पूजा आवश्यक।';
  }

  // 4. Yoni (4 Points)
  const yScore = (YONI_COMPATIBILITY[bNak.yoni] && YONI_COMPATIBILITY[bNak.yoni][gNak.yoni] !== undefined)
    ? YONI_COMPATIBILITY[bNak.yoni][gNak.yoni]
    : 2;
  result.yoni.score = yScore;
  result.yoni.desc = `वर: ${bNak.yoni}, वधू: ${gNak.yoni}। आपसी सन्तुष्टि अंक: ${yScore}/4।`;

  // 5. Graha Maitri (5 Points)
  const bLord = RASHI_LORDS[bRashi];
  const gLord = RASHI_LORDS[gRashi];
  if (bLord === gLord) {
    result.grahaMaitri.score = 5;
    result.grahaMaitri.desc = 'एकै राशीश भएकाले पूर्ण मानसिक र वैचारिक एकता।';
  } else {
    // Standard friendships in Vedic
    const friends = {
      'Sun': ['Moon', 'Mars', 'Jupiter'],
      'Moon': ['Sun', 'Mercury'],
      'Mars': ['Sun', 'Moon', 'Jupiter'],
      'Mercury': ['Sun', 'Venus'],
      'Jupiter': ['Sun', 'Moon', 'Mars'],
      'Venus': ['Mercury', 'Saturn'],
      'Saturn': ['Mercury', 'Venus']
    };
    const bFriend = (friends[bLord] || []).includes(gLord);
    const gFriend = (friends[gLord] || []).includes(bLord);
    if (bFriend && gFriend) {
      result.grahaMaitri.score = 5;
      result.grahaMaitri.desc = 'राशीश आपसमा परम मित्र हुन्, सुखद गृहस्थ।';
    } else if (bFriend || gFriend) {
      result.grahaMaitri.score = 3;
      result.grahaMaitri.desc = 'राशीशमा समभाव, सामान्य समझदारी।';
    } else {
      result.grahaMaitri.score = 1;
      result.grahaMaitri.desc = 'राशीश भिन्न, संवादमा धैर्यता आवश्यक।';
    }
  }

  // 6. Gana (6 Points)
  if (bNak.gana === gNak.gana) {
    result.gana.score = 6;
    result.gana.desc = `दुबैको ${bNak.gana} गण भएकोले स्वभाव र विचारमा पूर्ण तालमेल।`;
  } else if ((bNak.gana === 'Deva' && gNak.gana === 'Manushya') || (bNak.gana === 'Manushya' && gNak.gana === 'Deva')) {
    result.gana.score = 5;
    result.gana.desc = 'देव र मनुष्य गणको उत्तम संगम।';
  } else {
    result.gana.score = 0;
    result.gana.desc = 'गण दोष: एक राक्षस र अर्को देव/मनुष्य गण।';
    result.doshas.push('गण दोष (Gana Dosha)');
    result.remedies.push('गण दोष शान्ति: महामृत्युञ्जय जप वा गणेश आराधना उपयुक्त।');
  }

  // 7. Bhakoot (7 Points)
  const rel = (gRashi - bRashi + 12) % 12;
  // 6/8 (Shadashtaka), 9/5 (Navapanchama), 2/12 (Dwidwadasha)
  const isBadRel = (rel === 5 || rel === 7 || rel === 8 || rel === 4 || rel === 1 || rel === 11);
  if (!isBadRel || bLord === gLord) {
    result.bhakoot.score = 7;
    result.bhakoot.desc = 'भकूट दोष मुक्त, आर्थिक र पारिवारिक सुख समृद्धि।';
  } else {
    result.bhakoot.score = 0;
    result.bhakoot.desc = 'भकूट दोष (षडाष्टक/द्विर्द्वादश)।';
    result.doshas.push('भकूट दोष (Bhakoot Dosha)');
    result.remedies.push('भकूट शान्ति: भगवान शिवको पूजा तथा रुद्राभिषेक लाभदायक।');
  }

  // 8. Nadi (8 Points)
  if (bNak.nadi !== gNak.nadi) {
    result.nadi.score = 8;
    result.nadi.desc = `वर: ${bNak.nadi}, वधू: ${gNak.nadi} (नाडी दोष मुक्त, निरोगी सन्तान)।`;
  } else {
    // Check if cancellation applies (same rashi but different nakshatra, or same nakshatra different pada)
    const isCancelled = (bRashi === gRashi && bNak.id !== gNak.id);
    if (isCancelled) {
      result.nadi.score = 8;
      result.nadi.desc = `नाडी एकै (${bNak.nadi}) भए पनि नक्षत्र भिन्न भएकोले नाडी दोष परिहार भयो।`;
    } else {
      result.nadi.score = 0;
      result.nadi.desc = `नाडी दोष: दुबैको ${bNak.nadi} नाडी छ।`;
      result.doshas.push('नाडी दोष (Nadi Dosha)');
      result.remedies.push('नाडी दोष शान्ति: स्वर्ण दान, गौदान वा महामृत्युञ्जय अनुष्ठान।');
    }
  }

  // Calculate Total Score
  result.total = Number((
    result.varna.score +
    result.vashya.score +
    result.tara.score +
    result.yoni.score +
    result.grahaMaitri.score +
    result.gana.score +
    result.bhakoot.score +
    result.nadi.score
  ).toFixed(1));

  if (result.total >= 28) {
    result.status = 'अति उत्तम मिलान (Excellent Match - ३६ मा ' + result.total + ')';
  } else if (result.total >= 18) {
    result.status = 'शुभ एवं मध्यम मिलान (Good Match - ३६ मा ' + result.total + ')';
  } else {
    result.status = 'अशुभ / दोषयुक्त मिलान (Below Average - ३६ मा ' + result.total + ')';
  }

  return result;
}

/**
 * 3. D9 Navamsha Chart Calculator
 */
function calculateNavamsha(planetsData, lagnaSign, lagnaDeg) {
  // Navamsha rule: each sign has 9 padas of 3°20' (3.3333°)
  function getNavamshaSign(signNum, degInSign) {
    const pada = Math.floor(degInSign / (30 / 9)) % 9; // 0 to 8
    let startSign = 1;
    // Fire signs (1, 5, 9) start at Aries (1)
    if ([1, 5, 9].includes(signNum)) startSign = 1;
    // Earth signs (2, 6, 10) start at Capricorn (10)
    else if ([2, 6, 10].includes(signNum)) startSign = 10;
    // Air signs (3, 7, 11) start at Libra (7)
    else if ([3, 7, 11].includes(signNum)) startSign = 7;
    // Water signs (4, 8, 12) start at Cancer (4)
    else if ([4, 8, 12].includes(signNum)) startSign = 4;

    let navSign = (startSign + pada) % 12;
    if (navSign === 0) navSign = 12;
    return navSign;
  }

  const d9LagnaSign = getNavamshaSign(lagnaSign, lagnaDeg % 30);
  const d9Planets = (planetsData || []).map(p => {
    const rawDeg = p.rawDegree || 0;
    const degInSign = rawDeg % 30;
    const navSign = getNavamshaSign(p.signNumber, degInSign);
    return {
      key: p.key || p.name,
      nepaliName: p.nepaliName,
      dev: p.dev,
      d1Sign: p.signNumber,
      d9Sign: navSign,
      d9RashiName: RASHI_NAMES[navSign] || '—',
      d9Lord: RASHI_LORDS[navSign]
    };
  });

  return {
    navamshaLagna: {
      signNumber: d9LagnaSign,
      rashiName: RASHI_NAMES[d9LagnaSign] || '—'
    },
    planets: d9Planets
  };
}

/**
 * 4. Daily Panchang & Rahu Kaal Calculator for Nepal
 */
function calculateDailyPanchang(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  // Day of week (0: Sun to 6: Sat)
  const vaars = ['आइतबार (Sunday)', 'सोमबार (Monday)', 'मंगलबार (Tuesday)', 'बुधबार (Wednesday)', 'बिहीबार (Thursday)', 'शुक्रबार (Friday)', 'शनिबार (Saturday)'];
  const vaarName = vaars[d.getDay()];

  // Approximate Tithi
  const refNewMoon = new Date('2024-01-11T11:57:00Z');
  const daysDiff = (d - refNewMoon) / (1000 * 60 * 60 * 24);
  const lunarCycle = 29.53058867;
  const cycleFraction = ((daysDiff % lunarCycle) + lunarCycle) % lunarCycle;
  const tithiNum = Math.floor((cycleFraction / lunarCycle) * 30) + 1;

  const paksha = tithiNum <= 15 ? 'शुक्ल पक्ष (Shukla Paksha)' : 'कृष्ण पक्ष (Krishna Paksha)';
  const tithiNames = [
    'प्रतिपदा (Pratipada)', 'द्वितीया (Dwitiya)', 'तृतीया (Tritiya)', 'चतुर्थी (Chaturthi)',
    'पञ्चमी (Panchami)', 'षष्ठी (Shashthi)', 'सप्तमी (Saptami)', 'अष्टमी (Ashtami)',
    'नवमी (Navami)', 'दशमी (Dashami)', 'एकादशी (Ekadashi)', 'द्वादशी (Dwadashi)',
    'त्रयोदशी (Trayodashi)', 'चतुर्दशी (Chaturdashi)', 'पूर्णिमा / औंसी (Purnima/Amavasya)'
  ];
  const tithiIndex = (tithiNum <= 15 ? tithiNum : tithiNum - 15) - 1;
  const tithiName = `${paksha} - ${tithiNames[Math.max(0, Math.min(14, tithiIndex))]}`;

  // Approximate Nakshatra
  const nakIndex = Math.floor(((daysDiff * 1.03) % 27 + 27) % 27);
  const nakName = NAKSHATRA_DATA[nakIndex].name;

  // Rahu Kaal for Nepal (Sunrise ~6:00 AM)
  const rahuPeriods = {
    0: '04:30 PM - 06:00 PM (साँझ)',
    1: '07:30 AM - 09:00 AM (बिहान)',
    2: '03:00 PM - 04:30 PM (दिउँसो)',
    3: '12:00 PM - 01:30 PM (मध्याह्न)',
    4: '01:30 PM - 03:00 PM (दिउँसो)',
    5: '10:30 AM - 12:00 PM (पूर्वाह्न)',
    6: '09:00 AM - 10:30 AM (बिहान)'
  };
  const rahuKaal = rahuPeriods[d.getDay()] || '12:00 PM - 01:30 PM';

  return {
    date: d.toISOString().split('T')[0],
    vaar: vaarName,
    tithi: tithiName,
    nakshatra: nakName,
    rahuKaal: rahuKaal,
    location: 'काठमाडौं, नेपाल (Nepal Time +05:45)',
    abhijitMuhurta: '११:४५ AM - १२:३५ PM (अति शुभ मुहूर्त)'
  };
}

/**
 * 5. Astrocircle Celestial Wheel SVG Generator (Circular Chart)
 */
function generateAstrocircleSvg(astrologyData, name, birthStr) {
  const { lagna, planets } = astrologyData;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 660" width="100%" height="100%" style="background-color: #0b0816; border-radius: 16px; box-shadow: 0 15px 35px rgba(0,0,0,0.7);">
  <defs>
    <radialGradient id="circleGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#21173d" stop-opacity="0.8"/>
      <stop offset="70%" stop-color="#100b21" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#090614" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f4d38c"/>
      <stop offset="50%" stop-color="#d8b06a"/>
      <stop offset="100%" stop-color="#a8794f"/>
    </linearGradient>
  </defs>

  <rect width="600" height="660" fill="url(#circleGlow)" />

  <!-- Title Header -->
  <g transform="translate(300, 32)">
    <text x="0" y="0" text-anchor="middle" fill="#d8b06a" font-family="'Cormorant Garamond', serif" font-size="20" font-weight="700" letter-spacing="1">
      अन्तरिक्ष कुण्डली चक्र (ASTROCIRCLE WHEEL)
    </text>
    <text x="0" y="18" text-anchor="middle" fill="#ad9eb2" font-family="'DM Sans', sans-serif" font-size="11.5">
      जातक: ${name || 'यजमान'} | ${birthStr || ''}
    </text>
  </g>

  <!-- Celestial Wheel Center (300, 340) Radius 230 -->
  <g transform="translate(300, 340)">
    <!-- Outer Decorative Ring -->
    <circle cx="0" cy="0" r="230" fill="none" stroke="url(#goldRing)" stroke-width="2.5" />
    <circle cx="0" cy="0" r="215" fill="rgba(216,176,106,0.03)" stroke="rgba(216,176,106,0.3)" stroke-width="1" />
    <circle cx="0" cy="0" r="145" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
    <circle cx="0" cy="0" r="55" fill="#140f28" stroke="url(#goldRing)" stroke-width="1.8" />

    <!-- Center Om Symbol -->
    <text x="0" y="8" text-anchor="middle" fill="#f4d38c" font-size="26" font-family="'Noto Serif Devanagari', serif" font-weight="bold">
      🕉️
    </text>

    <!-- 12 Radiating House Segments (30 deg each) -->
    ${[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
      const angle = i * 30;
      const rad = (angle - 90) * (Math.PI / 180);
      const x = Math.cos(rad) * 230;
      const y = Math.sin(rad) * 230;
      const signNum = ((i + (lagna.signNumber || 1) - 1) % 12) + 1;
      const signLabelX = Math.cos(rad + 0.26) * 180;
      const signLabelY = Math.sin(rad + 0.26) * 180;

      return `
        <line x1="0" y1="0" x2="${x}" y2="${y}" stroke="rgba(216,176,106,0.25)" stroke-width="1.2" />
        <text x="${signLabelX}" y="${signLabelY}" fill="#d8b06a" font-size="11.5" font-weight="600" text-anchor="middle" font-family="'DM Sans', sans-serif">
          ${RASHI_NAMES[signNum] ? RASHI_NAMES[signNum].split(' ')[0] : signNum}
        </text>
      `;
    }).join('')}

    <!-- Planets Plotted Around Circle -->
    ${(planets || []).map((p, idx) => {
      const bhava = p.bhava || 1;
      const baseAngle = (bhava - 1) * 30 + 15;
      const rad = (baseAngle - 90) * (Math.PI / 180);
      const radius = 95 + (idx % 3) * 22;
      const px = Math.cos(rad) * radius;
      const py = Math.sin(rad) * radius;

      return `
        <g transform="translate(${px}, ${py})">
          <circle cx="0" cy="0" r="11" fill="#18112e" stroke="#d8b06a" stroke-width="1" />
          <text x="0" y="4" text-anchor="middle" fill="#f4d38c" font-size="11" font-weight="bold" font-family="'Noto Serif Devanagari', sans-serif">
            ${p.dev || p.name.slice(0,2)}
          </text>
        </g>
      `;
    }).join('')}
  </g>

  <!-- Bottom Details -->
  <g transform="translate(300, 615)">
    <rect x="-260" y="-12" width="520" height="42" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(216,176,106,0.2)" stroke-width="1"/>
    <text x="0" y="8" text-anchor="middle" fill="#f4d38c" font-size="11.5" font-family="'DM Sans', sans-serif" font-weight="600">
      लग्न: ${lagna.rashiName || '—'} (${lagna.degreeFormatted || ''}) | चन्द्र राशि: ${astrologyData.moonSign.rashiName || '—'} | नक्षत्र: ${astrologyData.nakshatra.name || '—'}
    </text>
    <text x="0" y="24" text-anchor="middle" fill="#796c80" font-size="9.5" font-family="'DM Sans', sans-serif">
      Astrocircle Interactive Engine | Astro Tiwari
    </text>
  </g>
</svg>`;

  return svg;
}

module.exports = {
  NAKSHATRA_DATA,
  DASHA_YEARS,
  DASHA_ORDER,
  RASHI_NAMES,
  RASHI_LORDS,
  calculateVimshottariDasha,
  calculateAshtakootMilan,
  calculateNavamsha,
  calculateDailyPanchang,
  generateAstrocircleSvg
};
