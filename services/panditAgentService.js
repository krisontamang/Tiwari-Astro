/**
 * panditAgentService.js — Autonomous Multi-Agent Vedic Pandit Consultation Engine
 * Derived from Agentic AI Pandit (ashoksainiengineer/agentic-ai-pandit) and FutureSeer (AndyOliverR/FutureSeer).
 */

const { getCurrentDasha } = require('./dashaService');
const { recommendGemstones } = require('./gemlyService');

/**
 * Detect domain from user question
 */
function detectDomain(query = '') {
  const q = query.toLowerCase();

  if (q.includes('जागिर') || q.includes('job') || q.includes('career') || q.includes('काम') || q.includes('ब्यापार') || q.includes('business') || q.includes('प्रमोशन') || q.includes('promotion') || q.includes('विदेश') || q.includes('foreign')) {
    return 'career';
  }
  if (q.includes('विवाह') || q.includes('marriage') || q.includes('प्रेम') || q.includes('love') || q.includes('सम्बन्ध') || q.includes('relationship') || q.includes('केटी') || q.includes('केटा') || q.includes('साझेदार')) {
    return 'marriage';
  }
  if (q.includes('धन') || q.includes('money') || q.includes('wealth') || q.includes('ऋण') || q.includes('कर्जा') || q.includes('loan') || q.includes('आर्थिक') || q.includes('finance')) {
    return 'finance';
  }
  if (q.includes('स्वास्थ्य') || q.includes('health') || q.includes('रोग') || q.includes('बिरामी') || q.includes('तनाव') || q.includes('stress') || q.includes('mental')) {
    return 'health';
  }
  if (q.includes('पढाइ') || q.includes('education') || q.includes('परीक्षा') || q.includes('exam') || q.includes('सन्तान') || q.includes('children') || q.includes('baby')) {
    return 'education_progeny';
  }
  return 'general';
}

/**
 * Autonomous Multi-Agent Jyotish Consultation
 */
async function consultAgenticPandit(payload = {}) {
  const question = payload.question || payload.query || 'मेरो जागिर र भविष्य कस्तो रहनेछ?';
  const name = payload.name || payload.clientName || 'जिज्ञासु';
  const dob = payload.dob || payload.birthDate || payload.birthDetails?.date || '1995-05-15';
  const birthTime = payload.birthTime || payload.birthDetails?.time || '08:30';
  const birthPlace = payload.birthPlace || payload.birthDetails?.place || 'काठमाडौं, नेपाल';
  const lagnaRashi = payload.lagnaRashi || payload.birthDetails?.lagna || 1;
  const moonLongitude = Number(payload.moonLongitude || payload.birthDetails?.moonLongitude || 45.5);

  const domain = detectDomain(question);
  const dashaInfo = getCurrentDasha(dob, moonLongitude);
  const gemstoneInfo = recommendGemstones({ lagnaRashi, dob });

  const activeMaha = dashaInfo.currentMahadasha?.planet || 'Jupiter';
  const activeAntar = dashaInfo.currentAntardasha?.planet || 'Mars';

  // Agent 1: Lagna & Constitution Expert
  const lagnaVerdicts = {
    career: `लग्न र दशम भावको विश्लेषण अनुसार तपाईंमा कर्मशीलता र नेतृत्व क्षमता विद्यमान छ। लग्न बलियो भएकाले धैर्य र अनुशासनले सफलता दिलाउनेछ।`,
    marriage: `सप्तम भाव र शुक्र/बृहस्पतिको स्थिति अनुसार तपाईंको वैवाहिक जीवनमा आपसी समझदारी र भावनात्मक तालमेलको विशेष भूमिका रहन्छ।`,
    finance: `द्वितीय र एकादश भावको धन योगले आर्थिक समृद्धि र आम्दानीका बहुआयामिक स्रोतहरूको सम्भावना देखाउँछ।`,
    health: `षष्ठ भाव र लग्नको सन्तुलन अनुसार खानपान, योग र नियमित दिनचर्यामा ध्यान दिनु आवश्यक छ।`,
    education_progeny: `पञ्चम भाव विद्या र बुद्धिको स्थान भएकाले उच्च शिक्षा तथा बौद्धिक कार्यमा उल्लेखनीय प्रगति हुनेछ।`,
    general: `तपाईंको लग्न कुण्डलीमा आत्मबल र सकारात्मक ऊर्जाको राम्रो संयोजन छ।`
  };

  // Agent 2: Dasha & Timing Expert
  const dashaVerdict = `वर्तमानमा तपाईंको ${activeMaha} को महादशामा ${activeAntar} को अन्तर्दशा चलिरहेको छ (बाँकी समय: ${dashaInfo.remainingInMahadasha.formatted})। यो समय ${domain === 'career' ? 'कार्यक्षेत्रमा नयाँ अवसर खोज्न' : domain === 'marriage' ? 'सम्बन्धलाई परिपक्व बनाउन र कुराकानी अघि बढाउन' : 'धैर्यपूर्वक योजनाबद्ध रूपमा अघि बढ्न'} निकै महत्वपूर्ण संक्रमणकालीन चरण हो।`;

  // Agent 3: Domain Specialist
  let domainAnalysis = '';
  let favorableTiming = '';
  let keyInfluences = [];

  switch (domain) {
    case 'career':
      domainAnalysis = `कुण्डलीको दशमेश (कर्मेश) र वर्तमान दशा अनुकूल बन्दै गएकाले आउने ६ देखि १२ महिनाभित्र कार्यक्षेत्रमा पदोन्नति वा नयाँ रोजगारीको प्रबल सम्भावना छ। व्यापार भन्दा सेवा/जागिर वा प्राविधिक क्षेत्र अधिक लाभदायक देखिन्छ।`;
      favorableTiming = 'आगामी बैशाख देखि कात्तिक महिना (६-१२ महिना भित्र)';
      keyInfluences = ['सूर्य र दशमेशको सकारात्मक दृष्टि', 'दशानाथको अनुकूल गोचर', 'राहु/शनिको कर्म भावमा दबाब (परिश्रम बढी माग्ने)'];
      break;
    case 'marriage':
      domainAnalysis = `सप्तम भावमा शुभ ग्रहको प्रभाव र दशा अनुसार विवाह वार्ताका लागि अनुकूल समय सुरु भएको छ। उत्तर वा पूर्व दिशाका जीवनसाथीसँग उत्तम तालमेल रहने संकेत छ। मांगलिक दोष भएमा परिहार विचार गर्नु उचित हुनेछ।`;
      favorableTiming = 'आगामी मार्गशीर्ष देखि फागुन महिना';
      keyInfluences = ['बृहस्पतिको सप्तम भावमा गोचर दृष्टि', 'शुक्रको शुभ स्थिति', 'शनि-राहुको सूक्ष्म प्रभाव'];
      break;
    case 'finance':
      domainAnalysis = `धन स्थान (२ र ११ भाव) मा शुभ प्रभावका कारण आर्थिक स्थिति मजबुत हुनेछ। अनावश्यक खर्च र कर्जा लिने निर्णयमा सतर्कता अपनाउनुहोला। लगानीका लागि स्थिर सम्पत्ति (जग्गा वा सुन) अधिक फलदायी हुनेछ।`;
      favorableTiming = 'आगामी असोज देखि माघ सम्म';
      keyInfluences = ['बृहस्पतिको धन भावमा दृष्टि', 'एकादशेशको बलियो स्थिति'];
      break;
    case 'health':
      domainAnalysis = `षष्ठ भावको प्रभावले मौसमी बिरामी, पेट वा ढाड सम्बन्धी समस्या देखिन सक्छ। प्राणायाम, सूर्य नमस्कार र ताजा सात्विक आहारले आरोग्य रक्षा गर्नेछ।`;
      favorableTiming = 'नियमित दिनचर्यामा ध्यान दिँदा १ महिना भित्रै सुधार';
      keyInfluences = ['रोगेशको कमजोर स्थिति', 'सूर्यको सकारात्मक आत्मबल'];
      break;
    default:
      domainAnalysis = `तपाईंको प्रश्नको सन्दर्भमा ग्रहहरूको वर्तमान स्थितिले सकारात्मक संकेत गरिरहेको छ। ईश्वर भक्ति र कर्मयोगलाई सँगसँगै लैजाँदा सर्वत्र कल्याण हुनेछ।`;
      favorableTiming = 'आगामी ३ देखि ६ महिना भित्र';
      keyInfluences = ['दशानाथको अनुकूलता', 'नक्षत्र स्वामीको कृपा'];
  }

  // Agent 4: Remedy & Upay Expert
  const remedies = [
    {
      type: 'मन्त्र जप (Vedic Mantra)',
      instruction: `दैनिक बिहान ${activeMaha === 'Sun' ? 'गायत्री मन्त्र वा सूर्य अष्टाक्षर मन्त्र' : activeMaha === 'Jupiter' ? 'ॐ बृं बृहस्पतये नमः' : 'ॐ नमः शिवाय'} १०८ पटक जप गर्नुहोस्।`
    },
    {
      type: 'रत्न / रुद्राक्ष (Gemstone / Rudraksha)',
      instruction: `${gemstoneInfo.recommendations.lifeStone.gemstone.name} (${gemstoneInfo.recommendations.lifeStone.gemstone.sanskrit}) वा ${gemstoneInfo.recommendations.lifeStone.gemstone.rudraksha} धारण गर्नाले आरोग्य र कार्य सिद्धि हुनेछ।`
    },
    {
      type: 'दान / सेवा (Daana & Service)',
      instruction: `महिनामा एक पटक गाईलाई हरियो घाँस, चराचुरुङ्गीलाई अन्न वा असहायलाई भोजन गराउनुहोस्।`
    },
    {
      type: 'शुभ बार र दिशा (Auspicious Day & Direction)',
      instruction: `महत्वपूर्ण कामको थालनी बिहीबार वा आइतबार, पूर्व वा उत्तर मुख गरेर गर्दा सफलता मिल्नेछ।`
    }
  ];

  const agentsInvolved = ['LagnaExpert', 'DashaExpert', 'DomainExpert', 'RemedyExpert'];

  // Optional: Enhance final verdict with OpenRouter AI if configured
  let aiSummary = domainAnalysis;
  let openRouterMeta = null;
  try {
    const openRouter = require('./openRouterService');
    if (openRouter.getApiKey()) {
      const promptText = `जातकको नाम: ${name}, प्रश्न: "${question}", विषय: ${domain}, महादशा: ${activeMaha}, अन्तर्दशा: ${activeAntar}। 
पण्डितजी, माथिका वैदिक तथ्यका आधारमा जातकलाई आत्मीय, स्पष्ट र प्रेरणादायी ज्योतिषीय निष्कर्ष र मार्गदर्शन प्रदान गर्नुहोस् (२-३ अनुच्छेदमा)।`;
      const aiRes = await openRouter.chatCompletion({
        messages: [
          { role: 'system', content: openRouter.VEDIC_SYSTEM_PROMPT },
          { role: 'user', content: promptText }
        ],
        maxTokens: 400
      });
      if (aiRes && aiRes.content) {
        aiSummary = aiRes.content;
        openRouterMeta = {
          model: aiRes.model,
          provider: aiRes.provider,
          source: `OpenRouter AI (${aiRes.model})`
        };
      }
    }
  } catch (e) {
    // Graceful fallback to deterministic analysis
  }

  return {
    success: true,
    consultationId: 'PANDIT-' + Date.now().toString(36).toUpperCase(),
    clientName: name,
    question,
    domain,
    agentsInvolved,
    aiPowered: !!openRouterMeta,
    aiSource: openRouterMeta?.source || 'Deterministic Vedic Rules',
    consultation: {
      domain,
      agentsInvolved,
      summary: aiSummary,
      favorableTiming,
      remedies
    },
    astrologicalVerdict: {
      summary: aiSummary,
      favorableTiming,
      keyInfluences,
      aiMeta: openRouterMeta
    },
    currentDasha: {
      activeMahadasha: activeMaha,
      activeAntardasha: activeAntar,
      remainingTime: dashaInfo.remainingInMahadasha.formatted,
      dashaAnalysis: dashaVerdict
    },
    prescribedRemedies: remedies,
    agentVerdicts: {
      lagnaExpert: { score: 85, verdict: lagnaVerdicts[domain] || lagnaVerdicts.general },
      dashaExpert: { score: 80, verdict: dashaVerdict },
      domainExpert: { score: 90, verdict: domainAnalysis },
      remedyExpert: { score: 95, verdict: 'शास्त्रीय वैदिक परिहार पालना गरेमा विघ्न-बाधा स्वतः शान्त हुनेछ।' }
    }
  };
}

module.exports = {
  detectDomain,
  consultAgenticPandit
};
