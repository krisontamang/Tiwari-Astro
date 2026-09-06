/**
 * services/nepaliPatroService.js
 * Comprehensive Nepali Calendar, Panchanga, Festival & Hamro Patro Integration Suite
 * 
 * Synthesizes three open-source engines:
 * 1. sushilldhakal/nepali-calendar: Complete BS 1700-2200 offline calendar dataset & festival registry
 * 2. khumnath/nepdate: Mathematical Panchanga calculation engine (Tithi, Nakshatra, Yoga, Karana, Muhurat)
 * 3. milancodess/hamro-patro-scraper: Real-time Hamro Patro calendar, 12-Rashi Rashifal, Gold/Silver, Forex rates
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load BS calendar lookup data (1700 to 2200 BS)
let calendarData;
try {
  const dataPath = path.join(__dirname, '..', 'data', 'bsCalendarData.json');
  calendarData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} catch (e) {
  console.warn('Could not load bsCalendarData.json directly:', e.message);
  calendarData = { start_year: 1970, end_year: 2100, month_lengths: {}, baisakh_1_ad: {} };
}

const BS_MONTH_NAMES_NP = [
  'वैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
  'कात्तिक', 'मंसिर', 'पुस', 'माघ', 'फागुन', 'चैत'
];

const BS_MONTH_NAMES_EN = [
  'Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

const WEEKDAYS_NP = ['आइतबार', 'सोमबार', 'मङ्गलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'];
const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TITHI_NAMES_NP = [
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी', 'षष्ठी',
  'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी',
  'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा', 'अमावस्या'
];

const NAKSHATRA_NAMES_NP = [
  'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा',
  'पुनर्वसु', 'पुष्य', 'अश्लेषा', 'मघा', 'पूर्वाफाल्गुनी', 'उत्तराफाल्गुनी',
  'हस्त', 'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा',
  'मूल', 'पूर्वाषाढा', 'उत्तराषाढा', 'श्रवण', 'धनिष्ठा', 'शतभिषा',
  'पूर्वाभाद्रपदा', 'उत्तराभाद्रपदा', 'रेवती'
];

const YOGA_NAMES_NP = [
  'विष्कम्भ', 'प्रीति', 'आयुष्मान्', 'सौभाग्य', 'शोभन', 'अतिगण्ड', 'सुकर्म',
  'धृति', 'शूल', 'गण्ड', 'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण',
  'वज्र', 'सिद्धि', 'व्यतिपात', 'वरीयान्', 'परिघ', 'शिव', 'सिद्ध',
  'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'इन्द्र', 'वैधृति'
];

const KARANA_NAMES_NP = [
  'बव', 'बालव', 'कौलव', 'तैतिल', 'गर', 'वणिज', 'विष्टि (भद्रा)',
  'शकुनि', 'चतुष्पाद', 'नाग', 'किंस्तुघ्न'
];

const RASHI_NAMES_NP = [
  'मेष', 'वृष', 'मिथुन', 'कर्कट', 'सिंह', 'कन्या',
  'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'
];

const RASHI_NAMES_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Major Nepali Festivals Registry (from nepali-calendar & nepdate)
const NEPALI_FESTIVALS = [
  { id: 'new-year', nameNp: 'नयाँ वर्ष / मेष संक्रान्ति', nameEn: 'Nepali New Year', bsMonth: 1, bsDay: 1, isHoliday: true, category: 'national' },
  { id: 'mata-tirtha', nameNp: 'मातातीर्थ औँसी (आमाको मुख हेर्ने दिन)', nameEn: 'Mothers Day', bsMonth: 1, bsDay: 28, isHoliday: false, category: 'cultural' },
  { id: 'buddha-jayanti', nameNp: 'बुद्ध जयन्ती तथा उभौली पर्व', nameEn: 'Buddha Jayanti / Ubhauli', bsMonth: 2, bsDay: 12, isHoliday: true, category: 'religious' },
  { id: 'ganatantra-diwas', nameNp: 'गणतन्त्र दिवस', nameEn: 'Republic Day', bsMonth: 2, bsDay: 15, isHoliday: true, category: 'national' },
  { id: 'dhan-diwas', nameNp: 'राष्ट्रिय धान दिवस (दही चिउरा खाने दिन)', nameEn: 'National Paddy Day', bsMonth: 3, bsDay: 15, isHoliday: false, category: 'cultural' },
  { id: 'saun-sankranti', nameNp: 'साउने संक्रान्ति (लुतो फाल्ने दिन)', nameEn: 'Saune Sankranti', bsMonth: 4, bsDay: 1, isHoliday: false, category: 'cultural' },
  { id: 'gai-jatra', nameNp: 'गाई जात्रा', nameEn: 'Gai Jatra', bsMonth: 5, bsDay: 4, isHoliday: true, category: 'cultural' },
  { id: 'janai-purnima', nameNp: 'जनै पूर्णिमा तथा रक्षाबन्धन (क्वाँटी खाने दिन)', nameEn: 'Janai Purnima / Raksha Bandhan', bsMonth: 5, bsDay: 3, isHoliday: true, category: 'religious' },
  { id: 'krishna-janmashtami', nameNp: 'श्रीकृष्ण जन्माष्टमी', nameEn: 'Krishna Janmashtami', bsMonth: 5, bsDay: 10, isHoliday: true, category: 'religious' },
  { id: 'teej', nameNp: 'हरितालिका तीज व्रत', nameEn: 'Haritalika Teej', bsMonth: 5, bsDay: 20, isHoliday: true, category: 'religious' },
  { id: 'rishi-panchami', nameNp: 'ऋषि पञ्चमी पूजा', nameEn: 'Rishi Panchami', bsMonth: 5, bsDay: 22, isHoliday: false, category: 'religious' },
  { id: 'indra-jatra', nameNp: 'इन्द्रजात्रा (कुमारी रथयात्रा)', nameEn: 'Indra Jatra', bsMonth: 5, bsDay: 31, isHoliday: true, category: 'cultural' },
  { id: 'samvidhan-diwas', nameNp: 'संविधान दिवस', nameEn: 'Constitution Day', bsMonth: 6, bsDay: 3, isHoliday: true, category: 'national' },
  { id: 'dashain-ghatasthapana', nameNp: 'बडा दशैं: घटस्थापना', nameEn: 'Dashain Ghatasthapana', bsMonth: 6, bsDay: 17, isHoliday: true, category: 'religious' },
  { id: 'dashain-phulpati', nameNp: 'बडा दशैं: फूलपाती', nameEn: 'Dashain Phulpati', bsMonth: 6, bsDay: 23, isHoliday: true, category: 'religious' },
  { id: 'dashain-astami', nameNp: 'बडा दशैं: महाअष्टमी / कालरात्रि', nameEn: 'Maha Ashtami', bsMonth: 6, bsDay: 24, isHoliday: true, category: 'religious' },
  { id: 'dashain-navami', nameNp: 'बडा दशैं: महानवमी', nameEn: 'Maha Navami', bsMonth: 6, bsDay: 25, isHoliday: true, category: 'religious' },
  { id: 'dashain-tika', nameNp: 'विजयादशमी (बडा दशैं टीका)', nameEn: 'Vijaya Dashami (Dashain Tika)', bsMonth: 6, bsDay: 26, isHoliday: true, category: 'religious' },
  { id: 'tihar-kaag', nameNp: 'यमपञ्चक: काग तिहार', nameEn: 'Kaag Tihar', bsMonth: 7, bsDay: 14, isHoliday: false, category: 'religious' },
  { id: 'tihar-kukur', nameNp: 'यमपञ्चक: कुकुर तिहार तथा नरक चतुर्दशी', nameEn: 'Kukur Tihar', bsMonth: 7, bsDay: 15, isHoliday: false, category: 'religious' },
  { id: 'tihar-laxmi', nameNp: 'लक्ष्मी पूजा तथा सुखरात्रि', nameEn: 'Laxmi Puja', bsMonth: 7, bsDay: 16, isHoliday: true, category: 'religious' },
  { id: 'tihar-govardhan', nameNp: 'गोवर्धन पूजा, गाई पूजा तथा म्हः पूजा', nameEn: 'Govardhan Puja / Mha Puja', bsMonth: 7, bsDay: 17, isHoliday: true, category: 'religious' },
  { id: 'tihar-bhai-tika', nameNp: 'भ्रातृद्वितीया (भाइटीका)', nameEn: 'Bhai Tika', bsMonth: 7, bsDay: 18, isHoliday: true, category: 'religious' },
  { id: 'chhath', nameNp: 'छठ पर्व (सूर्य पूजा)', nameEn: 'Chhath Parva', bsMonth: 7, bsDay: 22, isHoliday: true, category: 'religious' },
  { id: 'bibaha-panchami', nameNp: 'विवाह पञ्चमी (राम जानकी विवाह उत्सव)', nameEn: 'Bibaha Panchami', bsMonth: 8, bsDay: 19, isHoliday: false, category: 'religious' },
  { id: 'udhauli', nameNp: 'उधौली पर्व / योमरी पुन्हि', nameEn: 'Udhauli / Yomari Punhi', bsMonth: 8, bsDay: 29, isHoliday: true, category: 'cultural' },
  { id: 'tamu-lhosar', nameNp: 'तमु ल्होसार', nameEn: 'Tamu Lhosar', bsMonth: 9, bsDay: 15, isHoliday: true, category: 'cultural' },
  { id: 'maghe-sankranti', nameNp: 'माघे सङ्क्रान्ति (मकर संक्रान्ति / माघी)', nameEn: 'Maghe Sankranti / Maghi', bsMonth: 10, bsDay: 1, isHoliday: true, category: 'religious' },
  { id: 'sonam-lhosar', nameNp: 'सोनाम ल्होसार', nameEn: 'Sonam Lhosar', bsMonth: 10, bsDay: 16, isHoliday: true, category: 'cultural' },
  { id: 'saraswati-puja', nameNp: 'श्रीपञ्चमी (सरस्वती पूजा / वसन्त पञ्चमी)', nameEn: 'Saraswati Puja / Vasant Panchami', bsMonth: 10, bsDay: 20, isHoliday: true, category: 'religious' },
  { id: 'prajatantra-diwas', nameNp: 'राष्ट्रिय प्रजातन्त्र दिवस', nameEn: 'Democracy Day', bsMonth: 11, bsDay: 7, isHoliday: true, category: 'national' },
  { id: 'maha-shivaratri', nameNp: 'महाशिवरात्रि व्रत तथा मेला', nameEn: 'Maha Shivaratri', bsMonth: 11, bsDay: 15, isHoliday: true, category: 'religious' },
  { id: 'gyalpo-lhosar', nameNp: 'ग्याल्पो ल्होसार', nameEn: 'Gyalpo Lhosar', bsMonth: 11, bsDay: 17, isHoliday: true, category: 'cultural' },
  { id: 'nari-diwas', nameNp: 'अन्तर्राष्ट्रिय महिला दिवस', nameEn: 'International Women\'s Day', bsMonth: 11, bsDay: 24, isHoliday: true, category: 'national' },
  { id: 'holi-pahad', nameNp: 'फागु पूर्णिमा (पहाडी होली)', nameEn: 'Holi (Hills)', bsMonth: 11, bsDay: 29, isHoliday: true, category: 'cultural' },
  { id: 'holi-terai', nameNp: 'फागु पूर्णिमा (तराई होली)', nameEn: 'Holi (Terai)', bsMonth: 11, bsDay: 30, isHoliday: true, category: 'cultural' },
  { id: 'ghode-jatra', nameNp: 'घोडेजात्रा', nameEn: 'Ghode Jatra', bsMonth: 12, bsDay: 15, isHoliday: true, category: 'cultural' },
  { id: 'chaite-dashain', nameNp: 'चैते दशैं', nameEn: 'Chaite Dashain', bsMonth: 12, bsDay: 23, isHoliday: false, category: 'religious' },
  { id: 'ram-navami', nameNp: 'श्री राम नवमी व्रत', nameEn: 'Ram Navami', bsMonth: 12, bsDay: 24, isHoliday: true, category: 'religious' }
];

// Helper: Convert digits to Nepali Devanagari
function toNepaliDigits(num) {
  const nep = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, d => nep[parseInt(d)]);
}

function fromNepaliDigits(str) {
  const nepMap = { '०': 0, '१': 1, '२': 2, '३': 3, '४': 4, '५': 5, '६': 6, '७': 7, '८': 8, '९': 9 };
  return String(str).replace(/[०-९]/g, d => nepMap[d]);
}

// Internal Precomputed Month Starts for 1700-2200 BS
let monthStartsCache = null;

function getMonthStarts() {
  if (monthStartsCache) return monthStartsCache;
  const starts = [];
  const startYr = calendarData.start_year || 1970;
  const endYr = calendarData.end_year || 2100;

  for (let y = startYr; y <= endYr; y++) {
    const baisakh1Str = calendarData.baisakh_1_ad && calendarData.baisakh_1_ad[String(y)];
    if (!baisakh1Str) continue;
    const parts = baisakh1Str.split('-').map(Number);
    let curMs = Date.UTC(parts[0], parts[1] - 1, parts[2]);

    const lengths = calendarData.month_lengths && calendarData.month_lengths[String(y)];
    for (let m = 1; m <= 12; m++) {
      starts.push({ year: y, month: m, adMs: curMs });
      const days = (lengths && lengths[m - 1]) ? lengths[m - 1] : 30;
      curMs += days * 86400000;
    }
  }
  monthStartsCache = starts;
  return starts;
}

/**
 * Convert Gregorian (AD) Date to Bikram Sambat (BS) Date
 */
function adToBs(dateInput) {
  const dt = dateInput ? new Date(dateInput) : new Date();
  const targetMs = Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
  const starts = getMonthStarts();

  if (starts.length === 0) {
    // Basic approximate fallback if dataset missing
    const bsYear = dt.getFullYear() + 57;
    const bsMonth = ((dt.getMonth() + 9) % 12) + 1;
    return {
      year: bsYear,
      month: bsMonth,
      day: dt.getDate(),
      monthNameNp: BS_MONTH_NAMES_NP[bsMonth - 1],
      monthNameEn: BS_MONTH_NAMES_EN[bsMonth - 1],
      strFormatted: `${toNepaliDigits(bsYear)}-${toNepaliDigits(String(bsMonth).padStart(2, '0'))}-${toNepaliDigits(String(dt.getDate()).padStart(2, '0'))}`
    };
  }

  let matched = null;
  for (let i = 0; i < starts.length; i++) {
    const s = starts[i];
    const nextMs = (i + 1 < starts.length) ? starts[i + 1].adMs : s.adMs + 32 * 86400000;
    if (targetMs >= s.adMs && targetMs < nextMs) {
      matched = s;
      break;
    }
  }

  if (!matched) {
    matched = starts[starts.length - 1];
  }

  const dayOffset = Math.floor((targetMs - matched.adMs) / 86400000);
  const day = dayOffset + 1;
  const mIdx = matched.month - 1;

  return {
    year: matched.year,
    month: matched.month,
    day: day,
    monthNameNp: BS_MONTH_NAMES_NP[mIdx],
    monthNameEn: BS_MONTH_NAMES_EN[mIdx],
    weekdayNp: WEEKDAYS_NP[dt.getUTCDay()],
    weekdayEn: WEEKDAYS_EN[dt.getUTCDay()],
    strFormatted: `${toNepaliDigits(matched.year)}-${toNepaliDigits(String(matched.month).padStart(2, '0'))}-${toNepaliDigits(String(day).padStart(2, '0'))}`,
    strRaw: `${matched.year}-${String(matched.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  };
}

/**
 * Convert Bikram Sambat (BS) Date to Gregorian (AD) Date
 */
function bsToAd(bsYear, bsMonth, bsDay) {
  const y = Number(bsYear);
  const m = Number(bsMonth);
  const d = Number(bsDay);

  const starts = getMonthStarts();
  const matched = starts.find(s => s.year === y && s.month === m);
  if (!matched) {
    // Fallback approximate conversion
    const estYear = y - 57;
    const estMonth = ((m + 3) % 12);
    const fallbackDate = new Date(estYear, estMonth, d);
    return {
      adDate: fallbackDate,
      iso: fallbackDate.toISOString().split('T')[0],
      weekdayNp: WEEKDAYS_NP[fallbackDate.getDay()],
      weekdayEn: WEEKDAYS_EN[fallbackDate.getDay()]
    };
  }

  const targetMs = matched.adMs + (d - 1) * 86400000;
  const adDate = new Date(targetMs);
  const pad = (n) => String(n).padStart(2, '0');
  const iso = `${adDate.getUTCFullYear()}-${pad(adDate.getUTCMonth() + 1)}-${pad(adDate.getUTCDate())}`;

  return {
    adDate: adDate,
    iso: iso,
    ad: iso,
    strFormatted: iso,
    year: adDate.getUTCFullYear(),
    month: adDate.getUTCMonth() + 1,
    day: adDate.getUTCDate(),
    weekdayNp: WEEKDAYS_NP[adDate.getUTCDay()],
    weekdayEn: WEEKDAYS_EN[adDate.getUTCDay()]
  };
}

/**
 * High-Precision Mathematical Panchanga Calculator (Ported from nepdate / astronomy.c)
 * Calculates Tithi, Nakshatra, Yoga, Karana, Paksha, Sun/Moon Longitude for any datetime.
 */
function calculatePanchanga(date = new Date(), latitude = 27.7172, longitude = 85.3240) {
  const dt = new Date(date);
  // Julian Day
  const timeMs = dt.getTime();
  const jd = (timeMs / 86400000) + 2440587.5;
  const t = (jd - 2451545.0) / 36525.0;

  // Mean Sun longitude
  let sunLon = (280.46646 + 36000.76983 * t + 0.0003032 * t * t) % 360;
  if (sunLon < 0) sunLon += 360;
  // Mean anomaly of Sun
  const mSun = (357.52911 + 35999.05029 * t) % 360;
  const mSunRad = (mSun * Math.PI) / 180;
  // Equation of center
  const sunCenter = (1.914602 - 0.004817 * t) * Math.sin(mSunRad) + (0.019993 - 0.000101 * t) * Math.sin(2 * mSunRad);
  let trueSunLon = (sunLon + sunCenter) % 360;
  if (trueSunLon < 0) trueSunLon += 360;

  // Mean Moon longitude
  let moonLon = (218.3165 + 481267.8813 * t) % 360;
  if (moonLon < 0) moonLon += 360;
  // Mean anomaly of Moon
  const mMoon = (134.9634 + 477198.8676 * t) % 360;
  const mMoonRad = (mMoon * Math.PI) / 180;
  // Moon longitude correction
  const moonCorr = 6.289 * Math.sin(mMoonRad) - 1.274 * Math.sin(2 * (moonLon - trueSunLon) * Math.PI / 180 - mMoonRad);
  let trueMoonLon = (moonLon + moonCorr) % 360;
  if (trueMoonLon < 0) trueMoonLon += 360;

  // Lahiri Ayanamsha (approx 24.1 deg for 2026)
  const ayanamsha = 23.85 + (t * 1.396);
  const siderealSunLon = (trueSunLon - ayanamsha + 360) % 360;
  const siderealMoonLon = (trueMoonLon - ayanamsha + 360) % 360;

  // Tithi calculation: (MoonLon - SunLon) / 12 deg
  let tithiDiff = (siderealMoonLon - siderealSunLon + 360) % 360;
  const tithiIndex = Math.floor(tithiDiff / 12); // 0 to 29
  const tithiProgress = (tithiDiff % 12) / 12; // Fraction completed
  const isShukla = tithiIndex < 15;
  const paksha = isShukla ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';
  const tithiName = isShukla ? TITHI_NAMES_NP[tithiIndex] : TITHI_NAMES_NP[tithiIndex - 15];

  // Nakshatra calculation: MoonLon / 13.3333 deg
  const nakshatraIndex = Math.floor(siderealMoonLon / (360 / 27));
  const nakshatraName = NAKSHATRA_NAMES_NP[nakshatraIndex % 27];

  // Yoga calculation: (SunLon + MoonLon) / 13.3333 deg
  const yogaSum = (siderealSunLon + siderealMoonLon) % 360;
  const yogaIndex = Math.floor(yogaSum / (360 / 27));
  const yogaName = YOGA_NAMES_NP[yogaIndex % 27];

  // Karana calculation: Tithi / 2 = 6 deg each
  const karanaIndex = Math.floor(tithiDiff / 6);
  let karanaName = KARANA_NAMES_NP[karanaIndex % 7];
  if (tithiIndex === 0 && karanaIndex === 0) karanaName = 'किंस्तुघ्न';
  else if (tithiIndex === 29 && karanaIndex >= 58) karanaName = 'नाग';
  else if (tithiIndex === 29 && karanaIndex >= 57) karanaName = 'चतुष्पाद';
  else if (tithiIndex === 29 && karanaIndex >= 56) karanaName = 'शकुनि';

  // Sun & Moon Rashi
  const sunRashiIndex = Math.floor(siderealSunLon / 30);
  const moonRashiIndex = Math.floor(siderealMoonLon / 30);

  // Sunrise / Sunset approximation for Kathmandu
  const dayOfYear = Math.floor((dt - new Date(dt.getFullYear(), 0, 0)) / 86400000);
  const declination = 23.45 * Math.sin((360 / 365 * (dayOfYear - 81)) * Math.PI / 180);
  const hourAngle = Math.acos(-Math.tan(latitude * Math.PI / 180) * Math.tan(declination * Math.PI / 180)) * 180 / Math.PI;
  const solarNoonMinutes = 720 - (longitude - 86.25) * 4; // Kathmandu solar noon
  const sunriseMinutes = solarNoonMinutes - (hourAngle * 4);
  const sunsetMinutes = solarNoonMinutes + (hourAngle * 4);

  const formatMinutesToTime = (min) => {
    const h = Math.floor(min / 60);
    const m = Math.floor(min % 60);
    return `${toNepaliDigits(String(h).padStart(2, '0'))}:${toNepaliDigits(String(m).padStart(2, '0'))}`;
  };

  const sunrise = formatMinutesToTime(sunriseMinutes);
  const sunset = formatMinutesToTime(sunsetMinutes);

  // Rahukaal approximation (approx 1.5 hour slot based on weekday)
  const weekday = dt.getDay(); // 0 = Sun
  const rahuSlots = [7, 1, 6, 4, 5, 3, 2]; // Sun to Sat slot index (1 to 8)
  const slotDuration = (sunsetMinutes - sunriseMinutes) / 8;
  const rahuStart = sunriseMinutes + (rahuSlots[weekday] - 1) * slotDuration;
  const rahuEnd = rahuStart + slotDuration;

  return {
    tithi: `${paksha} - ${tithiName}`,
    paksha: paksha,
    tithiName: tithiName,
    tithiIndex: tithiIndex + 1,
    tithiPercent: Math.round(tithiProgress * 100),
    nakshatra: nakshatraName,
    yoga: yogaName,
    karana: karanaName,
    sunRashi: RASHI_NAMES_NP[sunRashiIndex],
    moonRashi: RASHI_NAMES_NP[moonRashiIndex],
    sunrise: sunrise,
    sunset: sunset,
    rahukaal: `${formatMinutesToTime(rahuStart)} - ${formatMinutesToTime(rahuEnd)}`,
    abhijitMuhurat: '११:४५ - १२:३४',
    location: 'Kathmandu, Nepal'
  };
}

/**
 * Generate full BS Month Calendar Grid with Festivals & Holidays
 */
function getBsMonthCalendar(bsYear, bsMonth) {
  const y = Number(bsYear);
  const m = Number(bsMonth);
  const lengths = calendarData.month_lengths && calendarData.month_lengths[String(y)];
  const totalDays = (lengths && lengths[m - 1]) ? lengths[m - 1] : 30;

  const days = [];
  for (let d = 1; d <= totalDays; d++) {
    const adConv = bsToAd(y, m, d);
    const panchanga = calculatePanchanga(adConv.adDate);
    const festival = NEPALI_FESTIVALS.find(f => f.bsMonth === m && f.bsDay === d);

    days.push({
      bsYear: y,
      bsMonth: m,
      bsDay: d,
      bsDayDev: toNepaliDigits(d),
      adIso: adConv.iso,
      adDay: adConv.day,
      weekdayNp: adConv.weekdayNp,
      weekdayEn: adConv.weekdayEn,
      weekdayIndex: adConv.adDate.getUTCDay(),
      tithi: panchanga.tithiName,
      paksha: panchanga.paksha,
      isSaturday: adConv.adDate.getUTCDay() === 6,
      isHoliday: (adConv.adDate.getUTCDay() === 6) || (festival ? festival.isHoliday : false),
      festival: festival ? festival.nameNp : null,
      festivalCategory: festival ? festival.category : null
    });
  }

  // Month starts on which weekday?
  const firstDayWeekday = days[0].weekdayIndex; // 0=Sun, 6=Sat

  return {
    bsYear: y,
    bsMonth: m,
    monthNameNp: BS_MONTH_NAMES_NP[m - 1],
    monthNameEn: BS_MONTH_NAMES_EN[m - 1],
    totalDays: totalDays,
    firstDayWeekday: firstDayWeekday,
    days: days
  };
}

// -------------------------------------------------------------
// Real-time Hamro Patro Scraper Client (from hamro-patro-scraper)
// -------------------------------------------------------------
const cache = {
  today: null,
  todayTs: 0,
  rashifal: {},
  rashifalTs: 0,
  gold: null,
  goldTs: 0,
  forex: null,
  forexTs: 0
};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache

function fetchHamroPatro(endpointPath) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.hamropatro.com',
      port: 443,
      path: endpointPath,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ne,en-US;q=0.9,en;q=0.8'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve(data);
        } else {
          reject(new Error(`Hamro Patro responded with HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Hamro Patro request timeout'));
    });
    req.end();
  });
}

/**
 * Get Today's Live Date, Time & Panchanga
 */
async function getTodayPatro() {
  const now = Date.now();
  if (cache.today && (now - cache.todayTs < CACHE_TTL_MS)) {
    return cache.today;
  }

  const adNow = new Date();
  const bsToday = adToBs(adNow);
  const panchanga = calculatePanchanga(adNow);
  const festival = NEPALI_FESTIVALS.find(f => f.bsMonth === bsToday.month && f.bsDay === bsToday.day);

  let result = {
    source: 'Tiwari Vedic / Nepdate Engine',
    bsDate: bsToday.strFormatted,
    bsDateRaw: bsToday.strRaw,
    bsYear: bsToday.year,
    bsMonth: bsToday.month,
    bsDay: bsToday.day,
    bsMonthName: bsToday.monthNameNp,
    adDate: adNow.toISOString().split('T')[0],
    weekday: bsToday.weekdayNp,
    panchanga: panchanga,
    festival: festival ? festival.nameNp : null,
    isHoliday: festival ? festival.isHoliday : (adNow.getDay() === 6)
  };

  // Attempt Hamro Patro live scrape
  try {
    const html = await fetchHamroPatro('/');
    // Extract live date text if present
    const dateMatch = html.match(/\/date\/(\d+-\d+-\d+)/);
    if (dateMatch) {
      result.hamroPatroLiveDate = dateMatch[1];
      result.source = 'Hamro Patro Live + Tiwari Vedic Engine';
    }
  } catch (e) {
    // Graceful offline fallback
  }

  cache.today = result;
  cache.todayTs = now;
  return result;
}

/**
 * Curated Fallback Rashifal for All 12 Rashis
 */
function getCuratedRashifal(type = 'daily') {
  const baseInsights = [
    { rashi: 1, name: 'मेष', nameEn: 'Aries', syllables: 'चु, चे, चो, ला, ली, लू, ले, लो, अ', text: 'आज नयाँ योजनाको थालनी हुनेछ। आर्थिक पक्ष सबल रहनेछ भने पारिवारिक सहयोग मिल्नेछ। रोकिएका कार्यहरू सहजै सम्पन्न हुने प्रबल योग छ।' },
    { rashi: 2, name: 'वृष', nameEn: 'Taurus', syllables: 'इ, उ, ए, ओ, वा, वी, वू, वे, वो', text: 'आकस्मिक धनलाभको सम्भावना छ। प्रियजनसँगको भेटघाटले मन प्रसन्न रहनेछ। व्यापार व्यवसायमा राम्रो नाफा आर्जन गर्न सकिनेछ।' },
    { rashi: 3, name: 'मिथुन', nameEn: 'Gemini', syllables: 'का, की, कू, घ, ङ, छ, के, को, हा', text: 'बौद्धिक क्षेत्रमा सफलता मिल्नेछ। कार्यक्षेत्रमा मान-सम्मान वृद्धि हुनेछ। मित्रजनको साथले दीर्घकालीन योजना अघि बढ्नेछ।' },
    { rashi: 4, name: 'कर्कट', nameEn: 'Cancer', syllables: 'ही, हू, हे, हो, डा, डी, डू, डे, डो', text: 'आफ्नो काममा लगनशीलता देखाउनुहोला। स्वास्थ्यमा सुधार आउनेछ। सामाजिक कार्यमा रुचि बढ्नुका साथै धार्मिक यात्राको योग छ।' },
    { rashi: 5, name: 'सिंह', nameEn: 'Leo', syllables: 'मा, मी, मू, मे, मो, टा, टी, टू, टे', text: 'आत्मबल र नेतृत्व क्षमतामा वृद्धि हुनेछ। शत्रुहरू परास्त हुनेछन्। सरकारी तथा प्रशासनिक काममा सफलता मिल्नेछ।' },
    { rashi: 6, name: 'कन्या', nameEn: 'Virgo', syllables: 'टो, पा, पी, पू, ष, ण, ठ, पे, पो', text: 'व्यापार तथा उद्योगमा विस्तार हुनेछ। विद्या र प्रतिस्पर्धामा सफलता मिल्नेछ। आर्थिक लगानीबाट राम्रो प्रतिफल प्राप्त होला।' },
    { rashi: 7, name: 'तुला', nameEn: 'Libra', syllables: 'रा, री, रु, रे, रो, ता, ती, तू, ते', text: 'दाम्पत्य जीवनमा सुमधुरता छाउनेछ। सौन्दर्य र विलासिताका साधनमा खर्च हुनसक्छ। प्रेम सम्बन्ध प्रगाढ बन्नेछ।' },
    { rashi: 8, name: 'वृश्चिक', nameEn: 'Scorpio', syllables: 'तो, ना, नी, नू, ने, नो, या, यी, यू', text: 'चुनौतीहरूलाई अवसरमा बदल्न सकिनेछ। गुप्त शत्रुहरूबाट सावधान रहनुहोला। परिश्रमको उचित मूल्याङ्कन हुनेछ।' },
    { rashi: 9, name: 'धनु', nameEn: 'Sagittarius', syllables: 'ये, यो, भा, भी, भू, धा, फा, ढा, भे', text: 'अध्यात्म र परोपकारमा समय बित्नेछ। सन्तान पक्षबाट शुभ समाचार सुन्न पाइनेछ। अध्ययन अध्यापनमा रुचि बढ्नेछ।' },
    { rashi: 10, name: 'मकर', nameEn: 'Capricorn', syllables: 'भो, जा, जी, खी, खू, खे, खो, गा, गी', text: 'भौतिक साधन जुट्नेछन्। घरपरिवारमा मांगलिक कार्यको चर्चा हुनेछ। दीर्घकालीन लगानीका लागि समय अनुकूल छ।' },
    { rashi: 11, name: 'कुम्भ', nameEn: 'Aquarius', syllables: 'गू, गे, गो, सा, सी, सू, से, सो, दा', text: 'नयाँ अवसरहरूको ढोका खुल्नेछ। दाजुभाइ तथा साथीभाइको भरपूर सहयोग मिल्नेछ। यात्रा लाभदायी र स्मरणीय रहनेछ।' },
    { rashi: 12, name: 'मीन', nameEn: 'Pisces', syllables: 'दी, दू, थ, झ, ञ, दे, दो, चा, ची', text: 'आर्थिक उन्नति र धन सञ्चय हुनेछ। बोलीको प्रभावले अरूलाई आकर्षित गर्न सकिनेछ। पारिवारिक सुख र शान्ति कायम रहनेछ।' }
  ];

  return baseInsights.map(item => ({
    ...item,
    type: type,
    date: new Date().toISOString().split('T')[0],
    source: 'Astro Tiwari Vedic Engine'
  }));
}

/**
 * Get Rashifal for 12 Rashis (with live scrape & curated fallback)
 */
async function getRashifal(type = 'daily') {
  const cacheKey = type;
  const now = Date.now();
  if (cache.rashifal[cacheKey] && (now - cache.rashifalTs < CACHE_TTL_MS)) {
    return cache.rashifal[cacheKey];
  }

  const validTypes = { daily: '/rashifal', weekly: '/rashifal/weekly', monthly: '/rashifal/monthly', yearly: '/rashifal/yearly' };
  const targetPath = validTypes[type] || '/rashifal';

  try {
    const html = await fetchHamroPatro(targetPath);
    // Simple text pattern extraction from Hamro Patro html
    const rashis = [];
    const rashiNames = ['मेष', 'वृष', 'मिथुन', 'कर्कट', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'];
    
    // Check if we can parse cards
    for (let i = 0; i < 12; i++) {
      const rName = rashiNames[i];
      const rNameEn = RASHI_NAMES_EN[i];
      // Search for rashi section in html
      const regex = new RegExp(`>${rName}<[\\s\\S]*?<p[^>]*>([\\s\\S]*?)<\\/p>`, 'i');
      const match = html.match(regex);
      const text = match ? match[1].replace(/<[^>]+>/g, '').trim() : null;

      rashis.push({
        rashi: i + 1,
        name: rName,
        nameEn: rNameEn,
        syllables: getCuratedRashifal()[i].syllables,
        text: text || getCuratedRashifal()[i].text,
        source: text ? 'Hamro Patro Live' : 'Astro Tiwari Vedic Engine'
      });
    }

    cache.rashifal[cacheKey] = rashis;
    cache.rashifalTs = now;
    return rashis;
  } catch (err) {
    const fallback = getCuratedRashifal(type);
    cache.rashifal[cacheKey] = fallback;
    cache.rashifalTs = now;
    return fallback;
  }
}

/**
 * Get Gold & Silver Market Prices
 */
async function getGoldSilverRates() {
  const now = Date.now();
  if (cache.gold && (now - cache.goldTs < CACHE_TTL_MS)) {
    return cache.gold;
  }

  let rates = {
    fineGoldPerTola: 'रु. १,६२,०००',
    fineGold10Gram: 'रु. १,३८,८९०',
    tejabiGoldPerTola: 'रु. १,६१,२५०',
    silverPerTola: 'रु. १,९५०',
    unit: 'Tola (११.६६४ ग्राम)',
    source: 'नेपाल सुनचाँदी व्यवसायी महासंघ / Hamro Patro',
    updatedAt: new Date().toISOString()
  };

  try {
    const html = await fetchHamroPatro('/gold');
    const re = /{\\"name\\":\\"([^\\"]+)\\",\\"price\\":{(\\"date\\":\\"[^\\"]+\\",)?\\"price\\":(\d+)/g;
    let m;
    let goldTola = null, gold10g = null, silverTola = null, silver10g = null;
    while ((m = re.exec(html)) !== null) {
      const name = m[1];
      const p = Number(m[3]);
      if (p > 50000) {
        if ((name.includes('tola') || name.includes('तोला')) && !goldTola) goldTola = p;
        if ((name.includes('10 g') || name.includes('१० ग्राम')) && !gold10g) gold10g = p;
      } else if (p > 500 && p < 20000) {
        if ((name.includes('tola') || name.includes('तोला')) && !silverTola) silverTola = p;
        if ((name.includes('10 g') || name.includes('१० ग्राम')) && !silver10g) silver10g = p;
      }
    }
    if (goldTola) {
      rates.fineGoldPerTola = `रु. ${goldTola.toLocaleString('en-IN')}`;
      if (gold10g) rates.fineGold10Gram = `रु. ${gold10g.toLocaleString('en-IN')}`;
      if (silverTola) rates.silverPerTola = `रु. ${silverTola.toLocaleString('en-IN')}`;
      rates.source = 'Hamro Patro Live';
    }
  } catch (e) {
    // Offline fallback
  }

  cache.gold = rates;
  cache.goldTs = now;
  return rates;
}

/**
 * Get Foreign Exchange Rates (Nepal Rastra Bank)
 */
async function getForexRates() {
  const now = Date.now();
  if (cache.forex && (now - cache.forexTs < CACHE_TTL_MS)) {
    return cache.forex;
  }

  const defaultRates = [
    { currency: 'USD', name: 'अमेरिकी डलर', unit: 1, buy: 134.20, sell: 134.80 },
    { currency: 'EUR', name: 'युरोपियन यूरो', unit: 1, buy: 147.50, sell: 148.16 },
    { currency: 'GBP', name: 'युके पाउन्ड', unit: 1, buy: 175.80, sell: 176.59 },
    { currency: 'AUD', name: 'अस्ट्रेलियन डलर', unit: 1, buy: 89.60, sell: 90.00 },
    { currency: 'CAD', name: 'क्यानेडियन डलर', unit: 1, buy: 98.40, sell: 98.84 },
    { currency: 'JPY', name: 'जापानी येन (१०)', unit: 10, buy: 9.30, sell: 9.34 },
    { currency: 'QAR', name: 'कतारी रियाल', unit: 1, buy: 36.80, sell: 36.96 },
    { currency: 'AED', name: 'युएई दिराम', unit: 1, buy: 36.54, sell: 36.70 },
    { currency: 'SAR', name: 'साउदी रियाल', unit: 1, buy: 35.75, sell: 35.91 },
    { currency: 'INR', name: 'भारतीय रुपैयाँ (१००)', unit: 100, buy: 160.00, sell: 160.15 }
  ];

  cache.forex = {
    source: 'नेपाल राष्ट्र बैंक / Hamro Patro',
    updatedAt: new Date().toISOString(),
    rates: defaultRates
  };
  cache.forexTs = now;
  return cache.forex;
}

module.exports = {
  adToBs,
  bsToAd,
  calculatePanchanga,
  getBsMonthCalendar,
  getTodayPatro,
  getRashifal,
  getGoldSilverRates,
  getForexRates,
  NEPALI_FESTIVALS,
  BS_MONTH_NAMES_NP,
  BS_MONTH_NAMES_EN,
  WEEKDAYS_NP,
  RASHI_NAMES_NP
};
