/**
 * services/aiChatbot.js
 * Conversational Vedic Astrology AI Assistant
 * Inspired by RoxyAPI/astrology-ai-chatbot
 */

const https = require('https');

const VEDIC_SYSTEM_PROMPT = `तपाईं Astro Tiwari को आधिकारिक वैदिक ज्योतिष AI सल्लाहकार हुनुहुन्छ। 
तपाईं पण्डित आयुष तिवारी (Bensar Tiwari) को वैदिक ज्ञान, पराशर होरा शास्त्र र नेपाली ज्योतिष परम्परा अनुसार नम्र, संवेदनशील र स्पष्ट मार्गदर्शन प्रदान गर्नुहुन्छ।

[नियमहरू]:
१. जातकले सोधेको भाषामा जवाफ दिनुहोस् (नेपालीमा सोधे नेपालीमा, अङ्ग्रेजीमा सोधे अङ्ग्रेजीमा)।
२. डर वा त्रास देखाउने फल नदिनुहोस्। सदैव शान्ति, ध्यान र वैदिक समाधान (रुद्राक्ष, जप, दान, रत्न) को मार्गदर्शन गर्नुहोस्।
३. यदि जातकले जन्म मिति, समय वा स्थान दिएका छन् भने उनीहरूको लग्न, राशि र ग्रह स्थितिलाई आधार बनाएर सटीक विश्लेषण गर्नुहोस्।
४. यदि जातकले व्यक्तिगत पूर्ण हस्तलिखित कुण्डली वा पण्डितजीसँग प्रत्यक्ष परामर्श लिन चाहेमा, Astro Tiwari को परामर्श प्याकेज (रु. २९९, रु. ४९९, वा रु. १,०५५) सिफारिस गर्नुहोस्।`;

// Local Knowledge Base for Vedic Advice & Remedies
const VEDIC_KNOWLEDGE_BASE = [
  {
    keywords: ['राहु', 'rahu', 'राहुको महादशा'],
    title: 'राहु महादशा एवं प्रभाव',
    response: `राहुको महादशा (१८ वर्ष) मा जीवनमा अचानक परिवर्तन, वैदेशिक यात्रा, प्रविधि तथा कूटनीतिक सफलता मिल्ने योग रहन्छ। तर मानसिक भ्रम वा अस्थिरता हुन सक्ने भएकाले निम्न वैदिक उपायहरू फलदायी मानिन्छन्:
१. ॐ रां राहवे नमः मन्त्र दैनिक १०८ पटक जप गर्नुहोस्।
२. भगवान भैरव वा शिवजीको आराधना, शनिबार कालो तिल वा उडदको दाल दान।
३. उचित परामर्शपछि ८ मुखी रुद्राक्ष वा गोमेद रत्न धारण गर्न सकिन्छ।`
  },
  {
    keywords: ['शनि', 'साढेसाती', 'sade sati', 'saturn', 'अढैया'],
    title: 'शनि साढेसाती एवं अढैया विचार',
    response: `शनिदेव न्याय र कर्मका कारक हुन्। साढेसाती वा अढैयाको समय मानिसलाई अनुशासित र परिपक्व बनाउने समय हो:
१. शनिबार पीपलको रुखमा जल चढाउने र साँझमा तिलको तेलको दीप बाल्ने।
२. हनुमान चालीसा वा दशरथकृत शनि स्तोत्र नियमित पाठ गर्नुहोस्।
३. असहाय, वृद्ध वा श्रमिक वर्गलाई सेवा र सहयोग गर्नाले शनिदेव अत्यन्त प्रसन्न हुनुहुन्छ।`
  },
  {
    keywords: ['मंगल', 'मांगलिक', 'mangal', 'mangal dosha'],
    title: 'मांगलिक दोष विचार',
    response: `लग्न कुण्डलीको १, ४, ७, ८ वा १२ औं भावमा मंगल बस्दा मांगलिक योग बन्दछ। तर २८ वर्षपछि वा गुरु/शुक्रको दृष्टि पर्दा यो दोष स्वतः शिथिल हुन्छ:
१. मंगलबार भगवान गणेश र हनुमानजीको पूजा गर्नुहोस्।
२. ॐ क्रां क्रीं क्रौं सः भौमाय नमः जप लाभदायक हुन्छ।
३. विवाहपूर्व दुबै कुण्डलीको गुण मिलान गराई योग्य ज्योतिषीबाट सल्लाह लिनु राम्रो हुन्छ।`
  },
  {
    keywords: ['विवाह', 'marriage', 'गुण मिलान', 'match'],
    title: 'विवाह तथा गुण मिलान परामर्श',
    response: `वैदिक ज्योतिषमा विवाहका लागि ३६ गुण (अष्टकूट मिलान) हेरिन्छ:
- १८ भन्दा बढी गुण आएमा विवाह शुभ मानिन्छ।
- नाडी दोष, भकूट दोष वा गण दोष परेमा विशेष शान्ति उपायहरू गरेर विवाह गर्न सकिन्छ।
Astro Tiwari मा वर र वधू दुबैको कुण्डली राखी पूर्ण गुण मिलान रिपोर्ट निकाल्न सकिन्छ।`
  },
  {
    keywords: ['करियर', 'job', 'business', 'जागिर', 'व्यवसाय', 'पैसा', 'धन'],
    title: 'करियर र आर्थिक योग',
    response: `कुण्डलीको १० औं भाव (कर्म भाव), २ औं भाव (धन भाव) र ११ औं भाव (आय भाव) ले करियर निर्धारण गर्छ:
१. दशमेश कुन राशि र भावमा छ त्यस अनुसार जागिर वा व्यापारको क्षेत्र छान्नुपर्छ।
२. सूर्यलाई हरेक बिहान तामाको लोटाबाट अर्घ्य दिँदा मान-सम्मान र सरकारी नोकरीको योग बलियो हुन्छ।
३. पण्डित आयुष तिवारीबाट आफ्नो कुण्डलीको दशमांश (D10) विश्लेषण गराउनुहोला।`
  },
  {
    keywords: ['रत्न', 'gemstone', 'रुद्राक्ष', 'rudraksha'],
    title: 'रत्न तथा रुद्राक्ष धारण नियम',
    response: `रत्न सधैं कुण्डलीको योगकारक ग्रह (लग्न, पञ्चम वा नवम भावका स्वामी) को मात्र लगाउनुपर्छ:
- मारक वा ६, ८, १२ औं भावका ग्रहको रत्न लगाउनु हुँदैन।
- रुद्राक्ष जुनसुकै राशिका व्यक्तिले पनि धारण गर्न सक्छन् र यसले कुनै नकारात्मक असर गर्दैन।`
  }
];

/**
 * Handle Vedic Astrology AI Chat Query
 */
async function processAstrologyChat(userMessage, contextData = {}) {
  const cleanMsg = (userMessage || '').trim();
  if (!cleanMsg) {
    return {
      reply: 'नमस्कार! म Astro Tiwari को वैदिक ज्योतिष AI सल्लाहकार हुँ। तपाईं आफ्नो जन्म कुण्डली, महादशा, राहु-शनि प्रभाव, विवाह गुण मिलान वा उपायबारे सोध्न सक्नुहुन्छ।'
    };
  }

  // 1. If OpenAI API key is set, call OpenAI GPT-4o-mini
  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey) {
    try {
      const response = await callOpenAi(userMessage, contextData, openAiKey);
      if (response) return { reply: response, source: 'OpenAI GPT' };
    } catch (e) {
      console.warn('OpenAI call failed, using local Vedic reasoning:', e.message);
    }
  }

  // 2. Intelligent Vedic Knowledge Matching
  const lower = cleanMsg.toLowerCase();
  for (const item of VEDIC_KNOWLEDGE_BASE) {
    for (const kw of item.keywords) {
      if (lower.includes(kw)) {
        return {
          reply: item.response,
          topic: item.title,
          source: 'Astro Tiwari Vedic Knowledge Base'
        };
      }
    }
  }

  // Default Guidance with Astrology Consultation
  return {
    reply: `तपाईंको प्रश्न प्राप्त भयो। वैदिक ज्योतिष शास्त्र अनुसार प्रत्येक जातकको जीवनमा ग्रह, गोचर र दशाको प्रत्यक्ष प्रभाव पर्दछ।

यस विषयमा गहिरो विश्लेषण गर्न तपाईंको जन्म मिति, जन्म समय र जन्म स्थान आवश्यक हुन्छ। यदि तपाईंले आफ्नो जन्म विवरण प्रदान गर्नुभएमा हामी तत्काल लग्न कुण्डली र ग्रह स्थिति गणना गर्न सक्छौं।

पण्डित आयुष तिवारीसँग विस्तृत व्यक्तिगत परामर्श, कुण्डली निर्माण तथा सटीक उपायका लागि हाम्रो परामर्श प्याकेज छनौट गर्न सक्नुहुन्छ। शुभम् भवतु! 🕉️`,
    source: 'Astro Tiwari Vedic AI'
  };
}

function callOpenAi(userMessage, contextData, apiKey) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: VEDIC_SYSTEM_PROMPT },
        ...(contextData && contextData.chartSummary ? [{ role: 'system', content: `जातकको कुण्डली विवरण: ${contextData.chartSummary}` }] : []),
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const req = https.request('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.choices && json.choices[0] && json.choices[0].message) {
            resolve(json.choices[0].message.content);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.write(payload);
    req.end();
  });
}

module.exports = {
  processAstrologyChat,
  VEDIC_SYSTEM_PROMPT
};
