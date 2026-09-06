/**
 * services/openRouterService.js
 * OpenRouter AI Gateway Integration for Astro Tiwari
 * Connects to OpenRouter.ai (https://openrouter.ai) with multi-model support:
 * - openai/gpt-4o-mini
 * - deepseek/deepseek-chat
 * - meta-llama/llama-3.3-70b-instruct
 * - anthropic/claude-3.5-haiku
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Auto-load .env if not already loaded into process.env
function loadEnvFallback() {
  try {
    const envPath = path.resolve(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const idx = trimmed.indexOf('=');
          if (idx > 0) {
            const k = trimmed.slice(0, idx).trim();
            const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[k]) process.env[k] = v;
          }
        }
      });
    }
  } catch (e) {}
}
loadEnvFallback();

const RECOMMENDED_MODELS = [
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini (OpenAI)',
    speed: 'अत्यन्त तीव्र (Fast)',
    bestFor: 'सामान्य ज्योतिष संवाद, कुण्डली व्याख्या र स्पष्ट परामर्श',
    default: true
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3 / Chat',
    speed: 'मध्यम-तीव्र (Balanced)',
    bestFor: 'गहन ग्रह विश्लेषण, दशा गणना तर्क र विस्तृत फलित विचार'
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B Instruct (Meta)',
    speed: 'उच्च क्षमता (High Capacity)',
    bestFor: 'खुला स्रोत शक्तिशाली भाषा मोडेल, नेपाली तथा अङ्ग्रेजी सम्प्रेषण'
  }
];

const VEDIC_SYSTEM_PROMPT = `तपाईं Astro Tiwari को आधिकारिक वरिष्ठ वैदिक ज्योतिष AI सल्लाहकार हुनुहुन्छ। 
तपाईं पण्डित आयुष तिवारी (Bensar Tiwari) को वैदिक ज्ञान, महर्षि पराशर होरा शास्त्र, जैमिनी सूत्र, र नेपाली ज्योतिषीय परम्परा अनुसार नम्र, संवेदनशील, स्पष्ट र प्रामाणिक मार्गदर्शन प्रदान गर्नुहुन्छ।

[मुख्य नियमहरू]:
१. जातकले सोधेको भाषामा सटीक जवाफ दिनुहोस् (नेपालीमा सोधे नेपालीमा, अङ्ग्रेजीमा सोधे अङ्ग्रेजीमा)।
२. डर, सन्त्रास वा निराशाजनक फल कहिल्यै नदिनुहोस्। वैदिक ज्योतिषको मूल उद्देश्य मार्गदर्शन, शान्ति, र आत्मबल प्रदान गर्नु हो। सदैव सकारात्मक समाधान (जप, दान, रुद्राक्ष, स्नान, ध्यान, साधना) सुझाउनुहोस्।
३. यदि जातकले जन्म विवरण (मिति, समय, स्थान, लग्न, राशि वा दशा) प्रदान गरेका छन् भने, त्यसैको आधारमा सटीक ज्योतिर्विज्ञान विश्लेषण प्रस्तुत गर्नुहोस्।
४. यदि जातकले आफ्नो व्यक्तिगत विस्तृत हस्तलिखित कुण्डली, वार्षिक वर्षफल वा पण्डित आयुष तिवारीसँग १-अन-१ परामर्श चाहन्छन् भने Astro Tiwari को आधिकारिक परामर्श प्याकेज (रु. २९९, रु. ४९९, वा रु. १,०५५) सिफारिस गर्नुहोस्।
५. तपाईंको भाषा शिष्ट, आदरार्थी र आध्यात्मिक ऊर्जाले भरिपूर्ण हुनुपर्छ।`;

function getApiKey() {
  return (process.env.OPENROUTER_API_KEY || '').trim();
}

function getDefaultModel() {
  return (process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini').trim();
}

/**
 * Check OpenRouter Account and Key status
 */
async function getAccountStatus() {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      connected: false,
      message: 'OPENROUTER_API_KEY is not configured in environment or .env file',
      model: getDefaultModel(),
      availableModels: RECOMMENDED_MODELS
    };
  }

  return new Promise((resolve) => {
    const req = https.request('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'AstroTiwari-Gateway/1.0'
      },
      timeout: 8000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode === 200 && json.data) {
            const data = json.data;
            resolve({
              connected: true,
              statusCode: 200,
              label: data.label || 'OpenRouter Key',
              isFreeTier: !!data.is_free_tier,
              usage: data.usage || 0,
              usageDaily: data.usage_daily || 0,
              usageWeekly: data.usage_weekly || 0,
              usageMonthly: data.usage_monthly || 0,
              limit: data.limit,
              configuredModel: getDefaultModel(),
              availableModels: RECOMMENDED_MODELS
            });
          } else {
            resolve({
              connected: false,
              statusCode: res.statusCode,
              error: json.error?.message || 'Authentication check failed',
              configuredModel: getDefaultModel(),
              availableModels: RECOMMENDED_MODELS
            });
          }
        } catch (e) {
          resolve({
            connected: false,
            error: 'Failed to parse OpenRouter response: ' + e.message,
            configuredModel: getDefaultModel(),
            availableModels: RECOMMENDED_MODELS
          });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        connected: false,
        error: err.message,
        configuredModel: getDefaultModel(),
        availableModels: RECOMMENDED_MODELS
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        connected: false,
        error: 'OpenRouter connection timed out',
        configuredModel: getDefaultModel(),
        availableModels: RECOMMENDED_MODELS
      });
    });

    req.end();
  });
}

/**
 * Universal Chat Completion via OpenRouter
 */
async function chatCompletion({ messages = [], model, temperature = 0.7, maxTokens = 800 }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured.');
  }

  const chosenModel = model || getDefaultModel();
  const siteUrl = process.env.OPENROUTER_SITE_URL || 'http://localhost:3000';
  const siteName = process.env.OPENROUTER_SITE_NAME || 'Astro Tiwari';

  const payload = JSON.stringify({
    model: chosenModel,
    messages: messages,
    temperature: typeof temperature === 'number' ? temperature : 0.7,
    max_tokens: typeof maxTokens === 'number' ? maxTokens : 800
  });

  return new Promise((resolve, reject) => {
    const req = https.request('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': siteUrl,
        'X-Title': siteName,
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 20000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode === 200 && json.choices && json.choices.length > 0) {
            resolve({
              success: true,
              model: json.model || chosenModel,
              provider: json.provider || 'OpenRouter',
              message: json.choices[0].message,
              content: json.choices[0].message.content,
              finishReason: json.choices[0].finish_reason,
              usage: json.usage || null
            });
          } else {
            const errMsg = (json.error && json.error.message) || `OpenRouter returned status ${res.statusCode}`;
            reject(new Error(errMsg));
          }
        } catch (e) {
          reject(new Error('JSON parse error from OpenRouter: ' + e.message));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('OpenRouter API request timed out (20s)'));
    });

    req.write(payload);
    req.end();
  });
}

/**
 * High-level Vedic Astrology AI Consultation
 */
async function generateVedicAstrologyResponse({ userMessage, contextData = {}, model }) {
  const cleanMsg = (userMessage || '').trim();
  if (!cleanMsg) {
    return {
      reply: 'नमस्कार! म Astro Tiwari को आधिकारिक वैदिक ज्योतिष AI सल्लाहकार हुँ। तपाईं आफ्नो कुण्डली, महादशा, राहु-शनि प्रभाव, वा कुनै पनि ज्योतिषीय प्रश्न सोध्न सक्नुहुन्छ।'
    };
  }

  const messages = [
    { role: 'system', content: VEDIC_SYSTEM_PROMPT }
  ];

  if (contextData && Object.keys(contextData).length > 0) {
    let ctxText = 'जातकको ज्योतिषीय पृष्ठभूमि:\n';
    if (contextData.chartSummary) ctxText += `- कुण्डली: ${contextData.chartSummary}\n`;
    if (contextData.dob) ctxText += `- जन्म मिति: ${contextData.dob}\n`;
    if (contextData.birthTime) ctxText += `- जन्म समय: ${contextData.birthTime}\n`;
    if (contextData.birthPlace) ctxText += `- जन्म स्थान: ${contextData.birthPlace}\n`;
    if (contextData.lagna) ctxText += `- लग्न: ${contextData.lagna}\n`;
    if (contextData.moonSign) ctxText += `- चन्द्र राशि: ${contextData.moonSign}\n`;
    if (contextData.activeDasha) ctxText += `- वर्तमान महादशा: ${contextData.activeDasha}\n`;
    messages.push({ role: 'system', content: ctxText });
  }

  messages.push({ role: 'user', content: cleanMsg });

  const chosenModel = model || getDefaultModel();
  const response = await chatCompletion({
    messages,
    model: chosenModel,
    temperature: 0.7,
    maxTokens: 1000
  });

  return {
    success: true,
    reply: response.content,
    response: response.content,
    model: response.model,
    provider: response.provider,
    usage: response.usage,
    source: `OpenRouter AI (${response.model})`
  };
}

module.exports = {
  RECOMMENDED_MODELS,
  VEDIC_SYSTEM_PROMPT,
  getApiKey,
  getDefaultModel,
  getAccountStatus,
  chatCompletion,
  generateVedicAstrologyResponse
};
