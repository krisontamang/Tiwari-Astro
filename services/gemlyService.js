/**
 * gemlyService.js — Vedic Gemstone & Rudraksha Recommendation Engine
 * Derived from Gemly (Namann-14/gemly) and Classical Parashari Ratna Shastra.
 */

// 9 Navaratnas Database
const GEMSTONES = [
  {
    slug: 'ruby',
    name: 'Ruby',
    sanskrit: 'माणिक्य (Manikya)',
    planet: 'Sun (सूर्य)',
    planetKey: 'Sun',
    element: 'Fire (अग्नि)',
    color: '#e11d48',
    tagline: 'नेतृत्व क्षमता, आत्मबल, आरोग्य र मान-सम्मान वृद्धिको महा-रत्न।',
    benefits: [
      'आत्मविश्वास, इच्छाशक्ति र नेतृत्व क्षमतामा वृद्धि गर्दछ',
      'हृदय, रक्तसञ्चार र आँखाको स्वास्थ्यलाई सबल बनाउँछ',
      'सरकारी काम, प्रशासनिक पद तथा समाजमा मान-सम्मान दिलाउँछ'
    ],
    idealForLagna: ['Aries (मेष)', 'Leo (सिंह)', 'Sagittarius (धनु)'],
    rashiIndices: [1, 5, 9], // Aries, Leo, Sag
    weight: '3–6 Carats (३ देखि ६ क्यारेट)',
    metal: 'Gold or Copper (सुन वा तामा)',
    finger: 'Ring Finger (अनामिका औंला - दाहिने हात)',
    day: 'Sunday (आइतबार बिहान सूर्योदयको समयमा)',
    mantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः (१०८ पटक)',
    substitute: 'Red Garnet (रक्तमणि) / Star Ruby',
    rudraksha: '१ मुखी रुद्राक्ष (1 Mukhi Rudraksha)'
  },
  {
    slug: 'pearl',
    name: 'Pearl',
    sanskrit: 'मोती (Moti)',
    planet: 'Moon (चन्द्रमा)',
    planetKey: 'Moon',
    element: 'Water (जल)',
    color: '#94a3b8',
    tagline: 'मानसिक शान्ति, भावनात्मक सन्तुलन र मातृसुखको प्रतीक।',
    benefits: [
      'मानसिक तनाव, डिप्रेसन र अनिद्राबाट मुक्ति दिन्छ',
      'स्मरणशक्ति र एकाग्रता बढाउँछ',
      'क्रोध नियन्त्रण गरी मधुर स्वभाव प्रदान गर्दछ'
    ],
    idealForLagna: ['Cancer (कर्कट)', 'Scorpio (वृश्चिक)', 'Pisces (मीन)'],
    rashiIndices: [4, 8, 12],
    weight: '4–7 Carats (४ देखि ७ क्यारेट)',
    metal: 'Silver (चाँदी)',
    finger: 'Little Finger (कान्छी औंला - दाहिने हात)',
    day: 'Monday (सोमबार बिहान शुक्लपक्ष)',
    mantra: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः (१०८ पटक)',
    substitute: 'Moonstone (चन्द्रकान्त मणि)',
    rudraksha: '२ मुखी रुद्राक्ष (2 Mukhi Rudraksha)'
  },
  {
    slug: 'red-coral',
    name: 'Red Coral',
    sanskrit: 'मूँगा (Moonga)',
    planet: 'Mars (मंगल)',
    planetKey: 'Mars',
    element: 'Fire (अग्नि)',
    color: '#dc2626',
    tagline: 'साहस, ऊर्जा, रक्त विकार निवारण र मांगलिक शान्तिको रत्न।',
    benefits: [
      'आलस्य हटाएर अदम्य साहस र उत्साह भर्दछ',
      'मांगलिक दोषको नकारात्मक प्रभावलाई सन्तुलन गर्दछ',
      'जग्गा-जमिन, सेना, प्रहरी, इन्जिनियरिङ क्षेत्रमा सफलता दिलाउँछ'
    ],
    idealForLagna: ['Aries (मेष)', 'Cancer (कर्कट)', 'Leo (सिंह)', 'Scorpio (वृश्चिक)', 'Sagittarius (धनु)', 'Pisces (मीन)'],
    rashiIndices: [1, 4, 5, 8, 9, 12],
    weight: '5–9 Carats (५ देखि ९ क्यारेट)',
    metal: 'Copper, Gold, or Silver (तामा, सुन वा चाँदी)',
    finger: 'Ring Finger (अनामिका औंला)',
    day: 'Tuesday (मंगलबार बिहान)',
    mantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः (१०८ पटक)',
    substitute: 'Red Agate (रक्त अकीक)',
    rudraksha: '३ मुखी रुद्राक्ष (3 Mukhi Rudraksha)'
  },
  {
    slug: 'emerald',
    name: 'Emerald',
    sanskrit: 'पन्ना (Panna)',
    planet: 'Mercury (बुध)',
    planetKey: 'Mercury',
    element: 'Earth (पृथ्वी)',
    color: '#059669',
    tagline: 'तीक्ष्ण बुद्धि, व्यापार वृद्धि, वाकपटुता र सञ्चार दक्षताको रत्न।',
    benefits: [
      'तार्किक क्षमता, गणितीय बुद्धि र निर्णय क्षमता बढाउँछ',
      'व्यापार, बैंकिङ, पत्रकारिता तथा अध्ययनमा उल्लेखनीय उन्नति गराउँछ',
      'बोलीको हड्बडाहट हटाएर प्रभावशाली वक्ता बनाउँछ'
    ],
    idealForLagna: ['Taurus (वृष)', 'Gemini (मिथुन)', 'Virgo (कन्या)', 'Libra (तुला)', 'Capricorn (मकर)', 'Aquarius (कुम्भ)'],
    rashiIndices: [2, 3, 6, 7, 10, 11],
    weight: '3–6 Carats (३ देखि ६ क्यारेट)',
    metal: 'Gold, Silver, or Bronze (सुन वा चाँदी)',
    finger: 'Little Finger (कान्छी औंला)',
    day: 'Wednesday (बुधबार बिहान)',
    mantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः (१०८ पटक)',
    substitute: 'Peridot (पेरिडोट) / Green Tourmaline',
    rudraksha: '४ मुखी रुद्राक्ष (4 Mukhi Rudraksha)'
  },
  {
    slug: 'yellow-sapphire',
    name: 'Yellow Sapphire',
    sanskrit: 'पुखराज (Pukhraj)',
    planet: 'Jupiter (बृहस्पति)',
    planetKey: 'Jupiter',
    element: 'Ether (आकाश)',
    color: '#eab308',
    tagline: 'ज्ञान, समृद्धि, सौभाग्य, वैवाहिक सुख र सन्तान समृद्धिको देव-रत्न।',
    benefits: [
      'आर्थिक सम्पन्नता, धर्म-कर्म र उच्च शिक्षामा प्रगति गराउँछ',
      'कन्याहरूको विवाहमा आउने ढिलाइ वा बाधा निवारण गर्दछ',
      'कलेजो, पाचन प्रणाली तथा समग्र शारीरिक स्वास्थ्य सबल राख्छ'
    ],
    idealForLagna: ['Aries (मेष)', 'Cancer (कर्कट)', 'Leo (सिंह)', 'Scorpio (वृश्चिक)', 'Sagittarius (धनु)', 'Pisces (मीन)'],
    rashiIndices: [1, 4, 5, 8, 9, 12],
    weight: '3–6 Carats (३ देखि ६ क्यारेट)',
    metal: 'Gold or Panchadhatu (सुन वा पञ्चधातु)',
    finger: 'Index Finger (तर्जनी औंला - पहिलो औंला)',
    day: 'Thursday (बिहीबार बिहान शुक्लपक्ष)',
    mantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः (१०८ पटक)',
    substitute: 'Yellow Topaz (सुनौलो टोपाज) / Citrine',
    rudraksha: '५ मुखी रुद्राक्ष (5 Mukhi Rudraksha)'
  },
  {
    slug: 'diamond',
    name: 'Diamond / White Sapphire',
    sanskrit: 'हीरा / सेतो पुखराज (Heera / Shwet Pukhraj)',
    planet: 'Venus (शुक्र)',
    planetKey: 'Venus',
    element: 'Water (जल)',
    color: '#e2e8f0',
    tagline: 'ऐश्वर्य, सौन्दर्य, प्रेम सम्बन्ध, कला र विलासिताको प्रतीक।',
    benefits: [
      'आकर्षण, वैवाहिक जीवनमा प्रेम र रोमान्स अभिवृद्धि गर्दछ',
      'कला, संगीत, फेसन, मिडिया र अभिनय क्षेत्रमा ख्याति दिलाउँछ',
      'सम्पत्ति, विलासी जीवन र भौतिक सुख-सुविधा आकर्षित गर्दछ'
    ],
    idealForLagna: ['Taurus (वृष)', 'Gemini (मिथुन)', 'Virgo (कन्या)', 'Libra (तुला)', 'Capricorn (मकर)', 'Aquarius (कुम्भ)'],
    rashiIndices: [2, 3, 6, 7, 10, 11],
    weight: '0.5–2 Carats Diamond / 3–5 Carats White Sapphire',
    metal: 'Platinum, White Gold, or Silver (प्लाटिनम वा चाँदी)',
    finger: 'Middle or Little Finger (मध्यमा वा कान्छी औंला)',
    day: 'Friday (शुक्रबार बिहान)',
    mantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः (१०८ पटक)',
    substitute: 'Zircon (जिरकन) / White Topaz',
    rudraksha: '६ मुखी रुद्राक्ष (6 Mukhi Rudraksha)'
  },
  {
    slug: 'blue-sapphire',
    name: 'Blue Sapphire',
    sanskrit: 'नीलम (Neelam)',
    planet: 'Saturn (शनि)',
    planetKey: 'Saturn',
    element: 'Air (वायु)',
    color: '#1d4ed8',
    tagline: 'तीव्र फलदायी, कर्म सिद्धि, न्याय, अनुसन्धान र विपत्ति नाश गर्ने रत्न।',
    benefits: [
      'शनिको साढेसाती तथा अढैयाको दुष्प्रभावलाई सन्तुलित गर्दछ',
      'कडा परिश्रमको तुरुन्त प्रतिफल र आकस्मिक धन लाभ गराउँछ',
      'उद्योग, फलाम, खानी, राजनीति र कानुनका क्षेत्रमा सर्वोच्च सफलता दिलाउँछ'
    ],
    idealForLagna: ['Taurus (वृष)', 'Gemini (मिथुन)', 'Virgo (कन्या)', 'Libra (तुला)', 'Capricorn (मकर)', 'Aquarius (कुम्भ)'],
    rashiIndices: [2, 3, 6, 7, 10, 11],
    weight: '3–6 Carats (३ देखि ६ क्यारेट)',
    metal: 'Panchadhatu, Silver, or White Gold (पञ्चधातु वा चाँदी)',
    finger: 'Middle Finger (मध्यमा औंला - लामो औंला)',
    day: 'Saturday (शनिबार सूर्यास्तको समय वा बिहान)',
    mantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः (१०८ पटक)',
    substitute: 'Amethyst (कटेला) / Blue Topaz / Iolite (नीली)',
    rudraksha: '७ मुखी रुद्राक्ष (7 Mukhi Rudraksha)'
  },
  {
    slug: 'hessonite',
    name: 'Hessonite',
    sanskrit: 'गोमेद (Gomed)',
    planet: 'Rahu (राहु)',
    planetKey: 'Rahu',
    element: 'Air (वायु)',
    color: '#b45309',
    tagline: 'राहुको महादशा शान्ति, भ्रम निवारण, राजनीति र आकस्मिक सफलता।',
    benefits: [
      'राहुको नकारात्मक प्रभाव, अज्ञात भय र मानसिक अस्थिरता हटाउँछ',
      'राजनीति, सेयर बजार, प्रविधि र विदेशी व्यापारमा सफलता दिलाउँछ',
      'शत्रु बाधा, कालो जादू र दुष्ट नजरबाट रक्षा गर्दछ'
    ],
    idealForLagna: ['Taurus (वृष)', 'Gemini (मिथुन)', 'Virgo (कन्या)', 'Libra (तुला)', 'Aquarius (कुम्भ)'],
    rashiIndices: [2, 3, 6, 7, 11],
    weight: '4–7 Carats (४ देखि ७ क्यारेट)',
    metal: 'Panchadhatu or Silver (पञ्चधातु वा चाँदी)',
    finger: 'Middle Finger (मध्यमा औंला)',
    day: 'Saturday (शनिबार साँझ वा राहुकाल बाहेक)',
    mantra: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः (१०८ पटक)',
    substitute: 'Orange Zircon / Spessartite',
    rudraksha: '८ मुखी रुद्राक्ष (8 Mukhi Rudraksha)'
  },
  {
    slug: 'cats-eye',
    name: "Cat's Eye",
    sanskrit: 'लहसुनिया / वैदूर्य (Lehsuniya)',
    planet: 'Ketu (केतु)',
    planetKey: 'Ketu',
    element: 'Fire (अग्नि)',
    color: '#ca8a04',
    tagline: 'अध्यात्म, मोक्ष, केतुको महादशा शान्ति, दुर्घटना रक्षा र अन्तर्ज्ञान।',
    benefits: [
      'केतुको पीडा, रहस्यमय रोग र आकस्मिक संकटबाट बचाउँछ',
      'अध्यात्म, ध्यान, साधना र रहस्यमयी विद्याहरूमा सफलता दिलाउँछ',
      'सट्टेबाजी, चिट्ठा तथा गुमेको धन पुनः प्राप्त गर्न मद्दत गर्दछ'
    ],
    idealForLagna: ['Aries (मेष)', 'Cancer (कर्कट)', 'Scorpio (वृश्चिक)', 'Sagittarius (धनु)', 'Pisces (मीन)'],
    rashiIndices: [1, 4, 8, 9, 12],
    weight: '3–6 Carats (३ देखि ६ क्यारेट)',
    metal: 'Panchadhatu or Gold (पञ्चधातु वा सुन)',
    finger: 'Middle or Little Finger (मध्यमा वा कान्छी औंला)',
    day: 'Thursday or Tuesday (बिहीबार वा मंगलबार)',
    mantra: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः (१०८ पटक)',
    substitute: 'Tiger Eye / Chrysoberyl',
    rudraksha: '९ मुखी रुद्राक्ष (9 Mukhi Rudraksha)'
  }
];

// Rashi numbers 1 to 12
const RASHI_MAP = {
  1: { name: 'Aries (मेष)', lord: 'Mars', gem: 'red-coral' },
  2: { name: 'Taurus (वृष)', lord: 'Venus', gem: 'diamond' },
  3: { name: 'Gemini (मिथुन)', lord: 'Mercury', gem: 'emerald' },
  4: { name: 'Cancer (कर्कट)', lord: 'Moon', gem: 'pearl' },
  5: { name: 'Leo (सिंह)', lord: 'Sun', gem: 'ruby' },
  6: { name: 'Virgo (कन्या)', lord: 'Mercury', gem: 'emerald' },
  7: { name: 'Libra (तुला)', lord: 'Venus', gem: 'diamond' },
  8: { name: 'Scorpio (वृश्चिक)', lord: 'Mars', gem: 'red-coral' },
  9: { name: 'Sagittarius (धनु)', lord: 'Jupiter', gem: 'yellow-sapphire' },
  10: { name: 'Capricorn (मकर)', lord: 'Saturn', gem: 'blue-sapphire' },
  11: { name: 'Aquarius (कुम्भ)', lord: 'Saturn', gem: 'blue-sapphire' },
  12: { name: 'Pisces (मीन)', lord: 'Jupiter', gem: 'yellow-sapphire' }
};

// 9 Houses rule for Lagna: 1st house (Lagna), 5th house (Trine/Purva Punya), 9th house (Trine/Bhagya)
function getTrikonaHouses(lagnaNum) {
  const h1 = ((lagnaNum - 1) % 12) + 1;
  const h5 = ((lagnaNum + 3) % 12) + 1;
  const h9 = ((lagnaNum + 7) % 12) + 1;
  return { h1, h5, h9 };
}

/**
 * Recommend Gemstones based on Lagna (Ascendant), Moon sign, and Life Concern
 */
function recommendGemstones(options = {}) {
  let lagna = Number(options.lagnaRashi || options.lagna || 1);
  if (isNaN(lagna) || lagna < 1 || lagna > 12) {
    if (options.dob) {
      const d = new Date(options.dob);
      lagna = (d.getMonth() % 12) + 1;
    } else {
      lagna = 1;
    }
  }

  const { h1, h5, h9 } = getTrikonaHouses(lagna);

  const lifeRashi = RASHI_MAP[h1];
  const beneficRashi = RASHI_MAP[h5];
  const luckyRashi = RASHI_MAP[h9];

  const lifeGem = GEMSTONES.find(g => g.slug === lifeRashi.gem) || GEMSTONES[0];
  const beneficGem = GEMSTONES.find(g => g.slug === beneficRashi.gem) || GEMSTONES[3];
  const luckyGem = GEMSTONES.find(g => g.slug === luckyRashi.gem) || GEMSTONES[4];

  // Conflict detection
  const devPlanets = ['Sun', 'Moon', 'Mars', 'Jupiter'];
  const danavPlanets = ['Venus', 'Saturn', 'Rahu', 'Ketu'];

  const primaryGroup = devPlanets.includes(lifeGem.planetKey) ? 'Dev' : 'Danav';
  const cautions = [];

  if (primaryGroup === 'Dev') {
    cautions.push('तपाईंको लग्न स्वामी देव समूहका ग्रह भएकाले नीलम, हीरा, वा गोमेद रत्न माणिक्य वा पुखराजसँग एकैसाथ धारण नगर्नुहोस्।');
  } else {
    cautions.push('तपाईंको लग्न स्वामी दानव समूहका ग्रह भएकाले माणिक्य, मोती वा मुँगा नीलम वा हीरासँग एकैसाथ धारण नगर्नुहोस्।');
  }

  return {
    success: true,
    lagnaRashi: lifeRashi.name,
    lagnaLord: lifeRashi.lord,
    recommendations: {
      lifeStone: {
        category: 'जीव रत्न (Life Stone / Lagna Lord)',
        description: 'शारीरिक आरोग्य, व्यक्तित्वको चमक, आत्मबल र दीर्घायुको लागि सर्वोपरि रत्न।',
        gemstone: lifeGem
      },
      luckyStone: {
        category: 'भाग्य रत्न (Lucky Stone / 9th House Lord)',
        description: 'भाग्योदय, ईश्वर कृपा, कार्य सिद्धि र भाग्य वृद्धिको लागि सर्वाधिक शुभ रत्न।',
        gemstone: luckyGem
      },
      beneficStone: {
        category: 'पुण्य रत्न (Knowledge & Intellect / 5th House Lord)',
        description: 'बुद्धि, उच्च शिक्षा, रचनात्मक प्रतिभा, सन्तान सुख र पूर्व पुण्य वृद्धिका लागि।',
        gemstone: beneficGem
      }
    },
    cautions,
    wearingRules: [
      'रत्न सधैं प्राकृतिक, शुद्ध र निर्दोष (Untreated & Certified) हुनुपर्छ।',
      'धारण गर्नु अघि पञ्चामृत (दूध, दही, घिउ, मह, चिनी) र गंगाजलले स्नान गराई सम्बन्धित ग्रहको मन्त्र १०८ पटक जप्नुहोस्।',
      'सधैं शुक्ल पक्षको शुभ दिन र शुभ लग्नमा मात्र रत्न औंलामा लगाउनुहोस्।'
    ]
  };
}

function getGemstoneCatalog() {
  return {
    success: true,
    total: GEMSTONES.length,
    gemstones: GEMSTONES
  };
}

function getGemstoneBySlug(slug) {
  const gem = GEMSTONES.find(g => g.slug === slug || g.name.toLowerCase() === slug.toLowerCase());
  if (!gem) return null;
  return { success: true, gemstone: gem };
}

module.exports = {
  GEMSTONES,
  recommendGemstones,
  getGemstoneCatalog,
  getGemstoneBySlug
};
