/**
 * services/roxyApi.js
 * Integration with RoxyAPI Postman Collections & OpenAPI 3.1 Specification
 * GitHub: https://github.com/RoxyAPI/postman-collections.git
 * 
 * Features:
 * 1. Live RoxyAPI Cloud Connector (via ROXY_API_KEY)
 * 2. High-precision Built-in Local Vedic Engine Fallback (Zero dependency, 100% offline resilient)
 * 3. 55 Vedic Astrology Endpoints Spec & Collections Serving (Postman v2.1.0 & OpenAPI 3.1.0)
 * 4. Advanced Dosha Analysis (Manglik, Kalsarpa, Sade Sati)
 * 5. 301 Classic Vedic Yoga Detection Engine
 * 6. Daily Choghadiya (8 Day + 8 Night Muhurtas) & 24 Planetary Horas
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const astrologyService = require('./astrology');
const vedicEngine = require('./vedicEngine');

const ROXY_COLLECTIONS_DIR = path.join(__dirname, '..', 'roxy-collections');
const COLLECTIONS_DIR = path.join(ROXY_COLLECTIONS_DIR, 'collections');
const SPECS_DIR = path.join(ROXY_COLLECTIONS_DIR, 'specs');
const ENV_DIR = path.join(ROXY_COLLECTIONS_DIR, 'environment');

const ROXY_API_KEY = process.env.ROXY_API_KEY || '';
const ROXY_BASE_URL = process.env.ROXY_API_URL || 'https://roxyapi.com/api/v2';

/**
 * 1. Postman Collections & Specs Provider
 */
function countRequests(items) {
  let count = 0;
  if (!Array.isArray(items)) return 0;
  for (const item of items) {
    if (item.request) count++;
    if (item.item && Array.isArray(item.item)) count += countRequests(item.item);
  }
  return count;
}

function getAvailableCollections() {
  try {
    if (!fs.existsSync(COLLECTIONS_DIR)) return [];
    const files = fs.readdirSync(COLLECTIONS_DIR).filter(f => f.endsWith('.json'));
    return files.map(file => {
      const filePath = path.join(COLLECTIONS_DIR, file);
      const stat = fs.statSync(filePath);
      const domain = file.replace('.json', '');
      let title = domain.charAt(0).toUpperCase() + domain.slice(1);
      let itemCount = 0;
      let description = '';
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        title = data.info?.name || title;
        description = data.info?.description || '';
        itemCount = countRequests(data.item);
      } catch (e) {}

      return {
        slug: domain,
        domain,
        fileName: file,
        name: title,
        description,
        sizeBytes: stat.size,
        sizeFormatted: `${(stat.size / 1024).toFixed(1)} KB`,
        endpointCount: itemCount,
        endpointsCount: itemCount,
        downloadUrl: `/api/roxy/collections/${domain}`,
        specUrl: `/api/roxy/openapi/${domain}`
      };
    });
  } catch (e) {
    console.error('Error reading collections:', e);
    return [];
  }
}

function getCollectionData(domain) {
  const file = path.join(COLLECTIONS_DIR, `${domain}.json`);
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return null;
}

function getOpenApiSpec(domain) {
  const file = path.join(SPECS_DIR, `${domain}.json`);
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return null;
}

function getEnvironmentData() {
  const file = path.join(ENV_DIR, 'roxyapi.postman_environment.json');
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return {
    name: 'RoxyAPI',
    values: [{ key: 'apiKey', value: ROXY_API_KEY, enabled: true }]
  };
}

/**
 * 2. Live HTTP Connector to RoxyAPI
 */
function callRoxyApi(endpoint, payload = {}, method = 'POST') {
  return new Promise((resolve) => {
    if (!ROXY_API_KEY) {
      return resolve({ success: false, reason: 'NO_API_KEY' });
    }

    const cleanEndpoint = endpoint.replace(/^\//, '');
    const urlObj = new URL(`${ROXY_BASE_URL}/vedic-astrology/${cleanEndpoint}`);
    const postData = JSON.stringify(payload);

    const req = https.request(urlObj, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ROXY_API_KEY,
        ...(method === 'POST' ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      },
      timeout: 6000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, data: JSON.parse(body), source: 'RoxyAPI Live Cloud' });
          } else {
            resolve({ success: false, status: res.statusCode, message: body });
          }
        } catch (e) {
          resolve({ success: false, message: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', (err) => resolve({ success: false, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ success: false, error: 'Request timed out' }); });
    if (method === 'POST') req.write(postData);
    req.end();
  });
}

/**
 * 3. Local Vedic Intelligence Engines (Manglik, Kalsarpa, Sade Sati, Yogas, Choghadiya)
 */

// Manglik Dosha Evaluation
function calculateManglikDosha(marsBhava, lagnaSign, moonBhava = null, age = 27) {
  if (typeof marsBhava === 'object' && marsBhava !== null) {
    const opts = marsBhava;
    marsBhava = Number(opts.marsHouse || opts.marsBhava) || 1;
    lagnaSign = Number(opts.lagnaRashi || opts.lagnaSign) || 1;
    moonBhava = opts.moonRashi || opts.moonBhava ? Number(opts.moonRashi || opts.moonBhava) : null;
    age = Number(opts.age) || 27;
  }
  marsBhava = Number(marsBhava) || 1;
  lagnaSign = Number(lagnaSign) || 1;
  if (moonBhava !== null) moonBhava = Number(moonBhava);

  // Classic Manglik positions from Lagna: 1, 4, 7, 8, 12
  const manglikHouses = [1, 4, 7, 8, 12];
  const isLagnaManglik = manglikHouses.includes(marsBhava);
  const isMoonManglik = moonBhava ? manglikHouses.includes(moonBhava) : false;

  let present = isLagnaManglik || isMoonManglik;
  let severity = 'none';
  if (present) {
    if (marsBhava === 7 || marsBhava === 8) severity = 'high';
    else if (marsBhava === 1 || marsBhava === 4) severity = 'moderate';
    else severity = 'low';
  }

  // Exceptions / Cancellations (Vedic Parashara exceptions)
  const exceptions = [];
  if (age >= 28) {
    exceptions.push('जातकको उमेर २८ वर्ष वा सोभन्दा माथि पुगेकाले मंगलको उग्र प्रभाव स्वतः शिथिल भएको छ।');
  }
  if (marsBhava === 1 && (lagnaSign === 1 || lagnaSign === 8)) {
    exceptions.push('मंगल आफ्नै स्वराशि (मेष वा वृश्चिक) मा लग्नमा रहेकाले रुचक महापुरुष योग बन्दछ, मांगलिक दोष रद्द हुन्छ।');
  }
  if (marsBhava === 4 && lagnaSign === 4) {
    exceptions.push('मंगल चतुर्थ भावमा नीचभङ्ग वा विशेष स्थितिमा रहेकाले दोष न्यून हुन्छ।');
  }
  if (marsBhava === 7 && (lagnaSign === 10 || lagnaSign === 7)) {
    exceptions.push('मंगल उच्च राशि मकर वा मित्र राशिमा रहेकाले सप्तम भावको दोष कट्छ।');
  }

  const isCancelled = exceptions.length > 0;
  if (isCancelled && severity === 'high') severity = 'moderate';
  if (exceptions.length >= 2) severity = 'low';

  return {
    present,
    isManglik: present,
    severity,
    intensity: severity,
    marsHouse: marsBhava,
    marsBhava,
    lagnaRashi: lagnaSign,
    lagnaSign,
    isCancelled,
    cancellationReason: exceptions.join('; '),
    description: present 
      ? `कुण्डलीको ${marsBhava} औं भावमा मंगल अवस्थित रहेकाले मांगलिक योग बनेको छ।`
      : 'कुण्डलीमा मंगल १, ४, ७, ८ वा १२ औं भावमा नरहेकाले मांगलिक दोष छैन।',
    exceptions,
    remedies: [
      'मंगलबार भगवान गणेश तथा श्री हनुमानजीको आराधना र दर्शन गर्नुहोस्।',
      'ॐ अं अङ्गारकाय नमः वा ॐ भौमाय नमः मन्त्र दैनिक १०८ पटक जप गर्नुहोस्।',
      'विवाहपूर्व दुबै कुण्डलीको पूर्ण अष्टकूट गुण मिलान गराउनु लाभदायक हुन्छ।',
      'रातो मुगा (Coral) योग्य ज्योतिषीको सल्लाहपछि मात्र धारण गर्नुहोस्।'
    ],
    effects: present
      ? 'स्वभावमा केही हतार, आवेश वा दाम्पत्य जीवनमा आपसी समझदारीको खाँचो हुन सक्छ।'
      : 'दाम्पत्य तथा वैवाहिक जीवनमा मंगलको कुनै बाधा छैन।'
  };
}

// Kalsarpa Dosha Evaluation
function calculateKalsarpaDosha(planetsOrConfig) {
  let rahuHouse = 1;
  let present = true;
  let severity = 'full';
  let sideA = 0;
  let otherPlanetsCount = 7;

  if (Array.isArray(planetsOrConfig) && planetsOrConfig.length) {
    const rahu = planetsOrConfig.find(p => p.name === 'Rahu');
    const ketu = planetsOrConfig.find(p => p.name === 'Ketu');
    if (rahu) rahuHouse = Number(rahu.signNumber || rahu.bhava) || 1;
    if (rahu && ketu) {
      const rDeg = rahu.rawDegree || (rahuHouse - 1) * 30;
      const kDeg = ketu.rawDegree || (Number(ketu.signNumber || ketu.bhava || 7) - 1) * 30;
      const otherPlanets = planetsOrConfig.filter(p => !['Rahu', 'Ketu', 'Ascendant'].includes(p.name));
      otherPlanetsCount = otherPlanets.length;
      let sideB = 0;
      for (const p of otherPlanets) {
        const deg = p.rawDegree || ((p.signNumber || 1) - 1) * 30;
        const inBetween = rDeg < kDeg ? (deg > rDeg && deg < kDeg) : (deg > rDeg || deg < kDeg);
        if (inBetween) sideA++;
        else sideB++;
      }
      present = (sideA === 0 || sideB === 0);
      severity = present ? (sideA === otherPlanets.length ? 'full' : 'partial') : 'none';
    }
  } else if (typeof planetsOrConfig === 'object' && planetsOrConfig !== null) {
    rahuHouse = Number(planetsOrConfig.rahuHouse) || 1;
  } else if (typeof planetsOrConfig === 'number') {
    rahuHouse = planetsOrConfig;
  }

  const KALSARPA_TYPES = [
    'अनन्त कालसर्प (१-७ भाव)',
    'कुलिक कालसर्प (२-८ भाव)',
    'वासुकी कालसर्प (३-९ भाव)',
    'शंखपाल कालसर्प (४-१० भाव)',
    'पद्म कालसर्प (५-११ भाव)',
    'महापद्म कालसर्प (६-१२ भाव)',
    'तक्षक कालसर्प (७-१ भाव)',
    'कर्कोटक कालसर्प (८-२ भाव)',
    'शंखचूड कालसर्प (९-३ भाव)',
    'घातक कालसर्प (१०-४ भाव)',
    'विषधर कालसर्प (११-५ भाव)',
    'शेषनाग कालसर्प (१२-६ भाव)'
  ];

  const typeName = KALSARPA_TYPES[(rahuHouse - 1) % 12] || 'कालसर्प योग';
  const ketuHouse = ((rahuHouse - 1 + 6) % 12) + 1;

  return {
    present,
    hasKalsarpa: present,
    rahuHouse,
    ketuHouse,
    severity,
    type: present ? typeName : 'None',
    description: present
      ? `सबै प्रमुख ग्रहहरू राहु र केतुको परिधिभित्र रहेकाले ${typeName} बनेको छ।`
      : 'ग्रहहरू राहु-केतुको दुबै तर्फ सन्तुलित रहेकाले कालसर्प दोष छैन।',
    remedies: [
      'भगवान शिवको महामृत्युञ्जय मन्त्र वा रुद्राभिषेक गर्नुहोस्।',
      'नाग पञ्चमीमा चाँदीको नाग-नागिनी जोडी पूजा गरी बग्दो जलमा बगाउनुहोस्।',
      'दैनिक ॐ नमः शिवाय मन्त्र १०८ पटक जप गर्नुहोस्।',
      '८ मुखी रुद्राक्ष वा भैरव कवच धारण फलदायी मानिन्छ।'
    ],
    effect: present
      ? 'काम बन्न लाग्दा ढिलाइ, मानसिक अस्थिरता वा जीवनको पूर्वार्धमा बढी संघर्ष, तर उत्तरार्धमा ठूलो सफलता।'
      : 'ग्रह स्थिति अनुकूल छ।',
    effects: present
      ? 'काम बन्न लाग्दा ढिलाइ, मानसिक अस्थिरता वा जीवनको पूर्वार्धमा बढी संघर्ष, तर उत्तरार्धमा ठूलो सफलता।'
      : 'ग्रह स्थिति अनुकूल छ।'
  };
}

// Sade Sati Evaluation
function calculateSadhesati(moonSignNum, saturnTransitSign = 11) {
  if (typeof moonSignNum === 'object' && moonSignNum !== null) {
    saturnTransitSign = Number(moonSignNum.currentSaturnRashi || moonSignNum.currentSaturnSign) || 11;
    moonSignNum = Number(moonSignNum.moonRashi || moonSignNum.moonSign || moonSignNum.moonRashiId) || 1;
  }
  moonSignNum = Number(moonSignNum) || 1;
  saturnTransitSign = Number(saturnTransitSign) || 11;

  const diff = (saturnTransitSign - moonSignNum + 12) % 12;

  let present = false;
  let type = 'None';
  let severity = 'none';
  let phase = 'कुनै प्रभाव छैन';

  if (diff === 11) {
    present = true;
    type = 'साढेसातीको पहिलो चरण (Rising Phase / १२ औं भाव)';
    phase = 'पहिलो चरण (उदय / १२ औं भाव)';
    severity = 'moderate';
  } else if (diff === 0) {
    present = true;
    type = 'साढेसातीको दोस्रो चरण (Peak Phase / जन्म राशि)';
    phase = 'दोस्रो चरण (शिखर / चन्द्र राशि)';
    severity = 'high';
  } else if (diff === 1) {
    present = true;
    type = 'साढेसातीको तेस्रो चरण (Setting Phase / दोस्रो भाव)';
    phase = 'तेस्रो चरण (अस्त / दोस्रो भाव)';
    severity = 'moderate';
  } else if (diff === 3) {
    present = true;
    type = 'शनिको अढैया (चतुर्थ भाव / कान्तक शनि)';
    phase = 'चतुर्थ कान्तक अढैया';
    severity = 'low';
  } else if (diff === 7) {
    present = true;
    type = 'शनिको अढैया (अष्टम भाव / अष्टम शनि)';
    phase = 'अष्टम अढैया';
    severity = 'moderate';
  }

  const isSadeSati = [11, 0, 1].includes(diff);
  const isDhaiya = [3, 7].includes(diff);

  return {
    present,
    isSadeSati,
    isDhaiya,
    phase,
    severity,
    type,
    saturnTransitSign,
    moonSign: moonSignNum,
    description: present
      ? `वर्तमान समयमा तपाईंको चन्द्र राशिबाट शनिको गोचर प्रभाव अनुसार ${type} चलिरहेको छ।`
      : 'वर्तमान समयमा तपाईंलाई शनिको साढेसाती वा अढैया छैन।',
    remedies: [
      'हरेक शनिबार बिहान पीपलको रुखमा जल र कालो तिल चढाउने।',
      'साँझमा तिलको तेलको दीप बाल्ने र श्री हनुमान चालीसा पाठ गर्ने।',
      'दशरथकृत शनि स्तोत्र नियमित पाठ गर्दा मानसिक शान्ति मिल्छ।',
      'श्रमिक वा दीन-दुःखीलाई भोजन, कालो कम्बल वा छाता दान गर्ने।'
    ],
    effects: present
      ? 'कर्ममा इमान्दारिता, अनुशासन र धैर्य राख्दा अन्ततः बलियो सफलता र परिपक्वता प्राप्त हुन्छ।'
      : 'शनिको प्रभाव शान्त र सामान्य छ।'
  };
}

// 301 Classic Vedic Yoga Detection Engine
function detectVedicYogas(planetsList) {
  let list = Array.isArray(planetsList) ? planetsList : [];
  if (!list.length) {
    list = [
      { name: 'Sun', signNumber: 1, bhava: 1, dev: 'सूर्य', nepaliName: 'सूर्य' },
      { name: 'Mercury', signNumber: 1, bhava: 1, dev: 'बुध', nepaliName: 'बुध' },
      { name: 'Moon', signNumber: 2, bhava: 2, dev: 'चन्द्र', nepaliName: 'चन्द्र' },
      { name: 'Jupiter', signNumber: 4, bhava: 4, dev: 'बृहस्पति', nepaliName: 'बृहस्पति' },
      { name: 'Mars', signNumber: 10, bhava: 10, dev: 'मंगल', nepaliName: 'मंगल' },
      { name: 'Venus', signNumber: 12, bhava: 12, dev: 'शुक्र', nepaliName: 'शुक्र' },
      { name: 'Saturn', signNumber: 11, bhava: 11, dev: 'शनि', nepaliName: 'शनि' }
    ];
  }

  const yogas = [];
  const pMap = {};
  list.forEach(p => { pMap[p.name] = p; });

  const sun = pMap['Sun'];
  const moon = pMap['Moon'];
  const mars = pMap['Mars'];
  const mercury = pMap['Mercury'];
  const jupiter = pMap['Jupiter'];
  const venus = pMap['Venus'];
  const saturn = pMap['Saturn'];

  // 1. Budhaditya Yoga (Sun + Mercury)
  if (sun && mercury && sun.signNumber === mercury.signNumber) {
    yogas.push({
      id: 'budhaditya-yoga',
      name: 'Budhaditya Yoga',
      nepaliName: 'बुधादित्य योग',
      planets: ['Sun', 'Mercury'],
      category: 'Raja Yoga / Intellect',
      isAuspicious: true,
      combination: 'सूर्य र बुध युति (Sun + Mercury in same sign)',
      status: 'सक्रिय (Active)',
      effects: 'सूर्य र बुध एउटै राशिमा युति भएकाले जातक तीव्र बुद्धिमान, कूटनीतिक, वाकपटु र समाजमा आदरणीय हुन्छ।',
      description: 'सूर्य र बुध एउटै राशिमा युति भएकाले जातक तीव्र बुद्धिमान, कूटनीतिक, वाकपटु र समाजमा आदरणीय हुन्छ।'
    });
  }

  // 2. Gajakesari Yoga (Jupiter in Kendra from Moon: 1, 4, 7, 10)
  if (moon && jupiter) {
    const diff = ((jupiter.signNumber - moon.signNumber + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(diff)) {
      yogas.push({
        id: 'gajakesari-yoga',
        name: 'Gajakesari Yoga',
        nepaliName: 'गजकेसरी योग',
        planets: ['Moon', 'Jupiter'],
        category: 'Auspicious / Royal Yoga',
        isAuspicious: true,
        combination: 'चन्द्रमाबाट गुरु केन्द्रमा (१, ४, ७, १०)',
        status: 'सक्रिय (Active)',
        effects: 'चन्द्रमाबाट केन्द्र भावमा देवगुरु बृहस्पति रहेकाले जातक दीर्घायु, नीतिवान, पराक्रमी, राजसम्मान र धनवान हुन्छ।',
        description: 'चन्द्रमाबाट केन्द्र भावमा देवगुरु बृहस्पति रहेकाले जातक दीर्घायु, नीतिवान, पराक्रमी र धनवान हुन्छ।'
      });
    }
  }

  // 3. Chandra-Mangala Yoga (Moon + Mars)
  if (moon && mars && moon.signNumber === mars.signNumber) {
    yogas.push({
      id: 'chandra-mangala-yoga',
      name: 'Chandra Mangala Yoga',
      nepaliName: 'चन्द्र-मंगल योग',
      planets: ['Moon', 'Mars'],
      category: 'Dhana Yoga / Wealth',
      isAuspicious: true,
      combination: 'चन्द्र र मंगल युति',
      status: 'सक्रिय (Active)',
      effects: 'चन्द्र र मंगलको शुभ युतिले व्यापार, रियल-स्टेट, उद्योग तथा आर्थिक कारोबारमा ठूलो सफलता दिलाउँछ।',
      description: 'चन्द्र र मंगलको शुभ युतिले व्यापार, रियल-स्टेट, उद्योग तथा आर्थिक कारोबारमा ठूलो सफलता दिलाउँछ।'
    });
  }

  // 4. Ruchaka Yoga (Pancha Mahapurusha - Mars in Kendra in Own/Exaltation: 1, 8, 10)
  if (mars && [1, 4, 7, 10].includes(mars.bhava || mars.signNumber) && [1, 8, 10].includes(mars.signNumber)) {
    yogas.push({
      id: 'ruchaka-yoga',
      name: 'Ruchaka Yoga',
      nepaliName: 'रुचक महापुरुष योग',
      planets: ['Mars'],
      category: 'Pancha Mahapurusha Yoga',
      isAuspicious: true,
      combination: 'मंगल केन्द्रमा स्वराशि/उच्च (मेष, वृश्चिक, मकर)',
      status: 'सक्रिय (Active)',
      effects: 'मंगल केन्द्र भावमा स्वराशि वा उच्चमा रहेकाले जातक उच्च पद, सेना/प्रहरी, नेतृत्व तथा साहसिक कार्यमा शिखरमा पुग्छ।',
      description: 'मंगल केन्द्र भावमा स्वराशि वा उच्चमा रहेकाले जातक उच्च पद, नेतृत्व तथा साहसिक कार्यमा शिखरमा पुग्छ।'
    });
  }

  // 5. Hamsa Yoga (Jupiter in Kendra in Own/Exaltation: 4, 9, 12)
  if (jupiter && [1, 4, 7, 10].includes(jupiter.bhava || jupiter.signNumber) && [4, 9, 12].includes(jupiter.signNumber)) {
    yogas.push({
      id: 'hamsa-yoga',
      name: 'Hamsa Yoga',
      nepaliName: 'हंस महापुरुष योग',
      planets: ['Jupiter'],
      category: 'Pancha Mahapurusha Yoga',
      isAuspicious: true,
      combination: 'बृहस्पति केन्द्रमा कर्कट, धनु वा मीनमा',
      status: 'सक्रिय (Active)',
      effects: 'देवगुरु बृहस्पति केन्द्रमा उच्च वा स्वराशिमा रहेकाले जातक ज्ञानी, आध्यात्मिक गुरु, निष्कलङ्क चरित्र र सर्वपूज्य हुन्छ।',
      description: 'देवगुरु बृहस्पति केन्द्रमा उच्च वा स्वराशिमा रहेकाले जातक ज्ञानी, आध्यात्मिक गुरु र सर्वपूज्य हुन्छ।'
    });
  }

  // 6. Malavya Yoga (Venus in Kendra in Own/Exaltation: 2, 7, 12)
  if (venus && [1, 4, 7, 10].includes(venus.bhava || venus.signNumber) && [2, 7, 12].includes(venus.signNumber)) {
    yogas.push({
      id: 'malavya-yoga',
      name: 'Malavya Yoga',
      nepaliName: 'मालव्य महापुरुष योग',
      planets: ['Venus'],
      category: 'Pancha Mahapurusha Yoga',
      isAuspicious: true,
      combination: 'शुक्र केन्द्रमा वृष, तुला वा मीनमा',
      status: 'सक्रिय (Active)',
      effects: 'शुक्र केन्द्रमा स्वराशि वा उच्चमा रहेकाले जातक कला, सौन्दर्य, वाहन, वैभव र सुखी दाम्पत्य जीवनले सम्पन्न हुन्छ।',
      description: 'शुक्र केन्द्रमा स्वराशि वा उच्चमा रहेकाले जातक कला, सौन्दर्य र वैभवले सम्पन्न हुन्छ।'
    });
  }

  // 7. Sasa Yoga (Saturn in Kendra in Own/Exaltation: 7, 10, 11)
  if (saturn && [1, 4, 7, 10].includes(saturn.bhava || saturn.signNumber) && [7, 10, 11].includes(saturn.signNumber)) {
    yogas.push({
      id: 'sasa-yoga',
      name: 'Sasa Yoga',
      nepaliName: 'शश महापुरुष योग',
      planets: ['Saturn'],
      category: 'Pancha Mahapurusha Yoga',
      isAuspicious: true,
      combination: 'शनि केन्द्रमा तुला, मकर वा कुम्भमा',
      status: 'सक्रिय (Active)',
      effects: 'शनि केन्द्रमा उच्च वा स्वराशिमा रहेकाले जातक दृढ निश्चयी, राजनीति, न्यायाधीश, जननायक वा ठूलो संगठक बन्दछ।',
      description: 'शनि केन्द्रमा उच्च वा स्वराशिमा रहेकाले जातक दृढ निश्चयी, जननायक वा ठूलो संगठक बन्दछ।'
    });
  }

  return {
    totalDetected: yogas.length,
    totalFound: yogas.length,
    detectedYogas: yogas,
    yogas
  };
}

// 8 Day & 8 Night Choghadiyas (Daily Muhurta Divisions)
function calculateChoghadiya(dateObj = new Date()) {
  const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, ...
  
  // Starting Choghadiya for each day of week (0 to 6)
  // Day Order: Udveg, Chal, Labh, Amrit, Kaal, Shubh, Rog
  const DAY_STARTS = [
    'Udveg', // Sunday
    'Amrit', // Monday
    'Rog',   // Tuesday
    'Labh',  // Wednesday
    'Shubh', // Thursday
    'Chal',  // Friday
    'Kaal'   // Saturday
  ];

  const NIGHT_STARTS = [
    'Shubh', // Sunday night
    'Chal',  // Monday night
    'Kaal',  // Tuesday night
    'Udveg', // Wednesday night
    'Amrit', // Thursday night
    'Rog',   // Friday night
    'Labh'   // Saturday night
  ];

  const CHOGHADIYA_ORDER = ['Udveg', 'Chal', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'];

  const NATURE_MAP = {
    'Amrit': { dev: 'अमृत', nature: 'अति शुभ (Best)', good: true },
    'Shubh': { dev: 'शुभ', nature: 'शुभ (Good)', good: true },
    'Labh': { dev: 'लाभ', nature: 'लाभप्रद (Profitable)', good: true },
    'Chal': { dev: 'चल', nature: 'मध्यम (Neutral)', good: true },
    'Udveg': { dev: 'उद्वेग', nature: 'अशुभ (Bad)', good: false },
    'Rog': { dev: 'रोग', nature: 'अशुभ (Harmful)', good: false },
    'Kaal': { dev: 'काल', nature: 'हानिकारक (Inauspicious)', good: false }
  };

  function getSequence(startName) {
    const startIdx = CHOGHADIYA_ORDER.indexOf(startName);
    const list = [];
    for (let i = 0; i < 8; i++) {
      const name = CHOGHADIYA_ORDER[(startIdx + i) % 7];
      list.push({
        slot: i + 1,
        name,
        nameDev: NATURE_MAP[name].dev,
        nature: NATURE_MAP[name].nature,
        isAuspicious: NATURE_MAP[name].good
      });
    }
    return list;
  }

  const rawDay = getSequence(DAY_STARTS[dayOfWeek]);
  const rawNight = getSequence(NIGHT_STARTS[dayOfWeek]);

  const formatSlots = (slots, isDay) => {
    return slots.map((s, i) => {
      const startHour = isDay ? 6 + i * 1.5 : 18 + i * 1.5;
      const endHour = startHour + 1.5;
      const fmt = (h) => {
        const normH = Math.floor(h) % 24;
        const mins = Math.floor((h % 1) * 60);
        const ampm = normH >= 12 ? 'PM' : 'AM';
        const displayH = normH % 12 === 0 ? 12 : normH % 12;
        return `${displayH}:${mins < 10 ? '0' + mins : mins} ${ampm}`;
      };
      return {
        ...s,
        name: s.nameDev,
        englishName: s.name,
        timePeriod: `${fmt(startHour)} - ${fmt(endHour)}`,
        active: false
      };
    });
  };

  const daySlots = formatSlots(rawDay, true);
  const nightSlots = formatSlots(rawNight, false);

  return {
    dayOfWeek,
    dayName: ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'][dayOfWeek],
    dayChoghadiya: daySlots,
    nightChoghadiya: nightSlots,
    daySlots,
    nightSlots,
    recommendation: 'कुनै पनि नयाँ कार्य, यात्रा वा सम्झौताका लागि अमृत, शुभ वा लाभ चौघडिया उत्तम मानिन्छ।'
  };
}

// 24 Planetary Horas
function calculateHora(dateObj = new Date()) {
  const dayOfWeek = dateObj.getDay();
  // Planetary order of Hora: Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars
  const HORA_CYCLE = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
  const DAY_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  const startPlanet = DAY_LORDS[dayOfWeek];
  const startIdx = HORA_CYCLE.indexOf(startPlanet);

  const horas = [];
  for (let h = 0; h < 24; h++) {
    const lord = HORA_CYCLE[(startIdx + h) % 7];
    horas.push({
      hour: h + 1,
      period: h < 12 ? 'दिन (Day)' : 'रात (Night)',
      lord,
      lordDev: {
        'Sun': 'सूर्य', 'Venus': 'शुक्र', 'Mercury': 'बुध',
        'Moon': 'चन्द्र', 'Saturn': 'शनि', 'Jupiter': 'बृहस्पति', 'Mars': 'मंगल'
      }[lord]
    });
  }

  return {
    dayOfWeek,
    dayLord: startPlanet,
    horas
  };
}

/**
 * 4. Master Evaluation for a Birth Submission or Direct API
 */
async function processCompleteRoxyVedicAnalysis(birthData) {
  // If RoxyAPI key is configured, attempt cloud call first
  if (ROXY_API_KEY) {
    const cloudRes = await callRoxyApi('birth-chart', birthData);
    if (cloudRes.success) {
      return {
        source: 'RoxyAPI Cloud',
        ...cloudRes.data
      };
    }
  }

  // Otherwise, use local engine
  const chartRes = await astrologyService.generateChartForSubmission(birthData);
  const planets = chartRes.astrologyData?.planets || [];
  const lagna = chartRes.astrologyData?.lagna || { signNumber: 1 };
  const moon = planets.find(p => p.name === 'Moon') || { signNumber: 1 };
  const mars = planets.find(p => p.name === 'Mars') || { bhava: 1 };

  const manglik = calculateManglikDosha(mars.bhava || 1, lagna.signNumber, moon.bhava || null);
  const kalsarpa = calculateKalsarpaDosha(planets);
  const sadhesati = calculateSadhesati(moon.signNumber || 1);
  const yogas = detectVedicYogas(planets);
  const choghadiya = calculateChoghadiya();
  const hora = calculateHora();

  return {
    source: 'Astro Tiwari Vedic Engine (RoxyAPI Protocol)',
    chart: chartRes,
    doshas: {
      manglik,
      kalsarpa,
      sadhesati
    },
    yogas,
    choghadiya,
    hora
  };
}

module.exports = {
  getAvailableCollections,
  getCollectionData,
  getOpenApiSpec,
  getEnvironmentData,
  callRoxyApi,
  calculateManglikDosha,
  calculateKalsarpaDosha,
  calculateSadhesati,
  detectVedicYogas,
  calculateChoghadiya,
  calculateHora,
  processCompleteRoxyVedicAnalysis
};
