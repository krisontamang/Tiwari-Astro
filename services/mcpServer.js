/**
 * services/mcpServer.js
 * Model Context Protocol (MCP) JSON-RPC 2.0 Handler
 * Compatible with Astroway MCP & VedAstro MCP specs
 */

const astrologyService = require('./astrology');
const vedicEngine = require('./vedicEngine');
const aiChatbot = require('./aiChatbot');
const vedastro = require('./vedastro');
const roxyApi = require('./roxyApi');
const astrowaySdk = require('./astrowaySdk');
const gemlyService = require('./gemlyService');
const dashaService = require('./dashaService');
const panditAgentService = require('./panditAgentService');
const poruthamService = require('./poruthamService');
const openRouterService = require('./openRouterService');

const MCP_TOOLS = [
  {
    name: 'calculate_kundali',
    description: 'Calculate Vedic birth chart (Lagna Kundali), planetary positions (Sun-Ketu), Rashis, and houses with SVG wheel.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Subject name' },
        dobAd: { type: 'string', description: 'Date of birth AD (YYYY-MM-DD)' },
        dobBs: { type: 'string', description: 'Date of birth BS (e.g. 2054-08-22)' },
        birthTime: { type: 'string', description: 'Birth time (e.g. 06:30 AM)' },
        birthPlace: { type: 'string', description: 'City / District in Nepal (e.g. Kathmandu, Pokhara)' }
      },
      required: ['name']
    }
  },
  {
    name: 'calculate_vimshottari_dasha',
    description: 'Calculate 120-year Vimshottari Dasha timeline, balance of dasha at birth, and active Mahadasha.',
    inputSchema: {
      type: 'object',
      properties: {
        year: { type: 'number', description: 'Birth Year' },
        month: { type: 'number', description: 'Birth Month' },
        day: { type: 'number', description: 'Birth Day' },
        moonLongitude: { type: 'number', description: 'Moon longitude in degrees (0-360)' }
      },
      required: ['year', 'month', 'day']
    }
  },
  {
    name: 'match_kundali_guna',
    description: 'Calculate 36 Guna Ashtakoot Kundali matching between bride and groom (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi).',
    inputSchema: {
      type: 'object',
      properties: {
        boyNakshatraId: { type: 'number', description: 'Boy Nakshatra index (1-27)' },
        boyRashiId: { type: 'number', description: 'Boy Moon Rashi (1-12)' },
        girlNakshatraId: { type: 'number', description: 'Girl Nakshatra index (1-27)' },
        girlRashiId: { type: 'number', description: 'Girl Moon Rashi (1-12)' }
      },
      required: ['boyNakshatraId', 'boyRashiId', 'girlNakshatraId', 'girlRashiId']
    }
  },
  {
    name: 'get_panchang',
    description: 'Get today Vedic Panchang for Nepal (Tithi, Vaar, Nakshatra, Yoga, Karana, Rahu Kaal, Abhijit Muhurta).',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date in YYYY-MM-DD format (defaults to today)' }
      }
    }
  },
  {
    name: 'ask_vedic_ai',
    description: 'Consult the Vedic Astrology AI Advisor for guidance on Kundali, Dasha, Doshas, Gemstones, Rudraksha, and Shanti remedies.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The question or situation to consult on' }
      },
      required: ['query']
    }
  },
  {
    name: 'roxy_check_doshas',
    description: 'RoxyAPI: Evaluate Manglik Dosha, Kalsarpa Yoga, and Saturn Sade Sati / Dhayya with Vedic remedies.',
    inputSchema: {
      type: 'object',
      properties: {
        marsBhava: { type: 'number', description: 'House of Mars (1-12)' },
        lagnaSign: { type: 'number', description: 'Lagna Rashi Number (1-12)' },
        moonSign: { type: 'number', description: 'Moon Rashi Number (1-12)' }
      }
    }
  },
  {
    name: 'roxy_detect_yogas',
    description: 'RoxyAPI: Detect 301 classical Vedic Yogas in a birth chart (Gajakesari, Budhaditya, Pancha Mahapurusha, Raja Yogas).',
    inputSchema: {
      type: 'object',
      properties: {
        birthDetails: { type: 'object', description: 'Birth details (dob, time, place)' }
      }
    }
  },
  {
    name: 'roxy_get_choghadiya',
    description: 'RoxyAPI: Calculate 8 Day and 8 Night Choghadiyas (Muhurtas: Amrit, Shubh, Labh, Char, Rog, Kaal, Udveg).',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date (YYYY-MM-DD)' }
      }
    }
  },
  {
    name: 'astroway_human_design',
    description: 'AstroWay SDK: Compute Human Design BodyGraph (Type, Strategy, Inner Authority, Profile, Definition, Centers).',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date of birth (YYYY-MM-DD)' },
        time: { type: 'string', description: 'Time of birth (HH:MM:SS)' }
      }
    }
  },
  {
    name: 'astroway_numerology',
    description: 'AstroWay SDK: Compute Life Path, Destiny Expression, Soul Urge, Personality, and Birthday Numbers.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Full birth name' },
        dob: { type: 'string', description: 'Date of birth (YYYY-MM-DD)' }
      }
    }
  },
  {
    name: 'astroway_synastry',
    description: 'AstroWay SDK: Calculate Synastry compatibility score (0-100) and aspect grid between two charts.',
    inputSchema: {
      type: 'object',
      properties: {
        chart1: { type: 'object', description: 'Subject 1 birth details (date, time, lat, lon)' },
        chart2: { type: 'object', description: 'Subject 2 birth details (date, time, lat, lon)' }
      },
      required: ['chart1', 'chart2']
    }
  },
  {
    name: 'astroway_tarot',
    description: 'AstroWay SDK: Draw a Rider-Waite Tarot card reading (1-card daily or 3-card past/present/future spread).',
    inputSchema: {
      type: 'object',
      properties: {
        spreadType: { type: 'string', description: 'one-card or three-card' }
      }
    }
  },
  {
    name: 'astroway_get_reference',
    description: 'AstroWay SDK: Get reference data for signs, planets, houses, aspects, or nakshatras.',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'signs, planets, houses, aspects, or nakshatras' }
      }
    }
  },
  {
    name: 'vedic_gemstone_recommendation',
    description: 'Recommend Life Stone (जीव रत्न), Lucky Stone (भाग्य रत्न), and Benefic Stone (पुण्य रत्न) with metals, mantras, wearing fingers, and conflict cautions.',
    inputSchema: {
      type: 'object',
      properties: {
        lagnaRashi: { type: 'number', description: 'Lagna Rashi Number (1-12, 1=Aries, 2=Taurus, etc.)' },
        dob: { type: 'string', description: 'Date of birth YYYY-MM-DD' },
        concern: { type: 'string', description: 'career, love, wealth, health, or spiritual' }
      }
    }
  },
  {
    name: 'vedic_vimshottari_dasha',
    description: 'Calculate 120-year Vimshottari Mahadasha, Antardasha (Bhukti), Pratyantardasha timeline, active Dasha, and remaining duration.',
    inputSchema: {
      type: 'object',
      properties: {
        birthDate: { type: 'string', description: 'Date of birth YYYY-MM-DD' },
        moonLongitude: { type: 'number', description: 'Moon longitude in degrees (0-360)' },
        targetDate: { type: 'string', description: 'Target date to query active Dasha (defaults to today)' }
      },
      required: ['birthDate']
    }
  },
  {
    name: 'agentic_pandit_consult',
    description: 'Autonomous Multi-Agent Vedic Pandit consultation evaluating Lagna, Dasha, and domain bhavas to provide structured Jyotish guidance and remedies.',
    inputSchema: {
      type: 'object',
      properties: {
        question: { type: 'string', description: 'Question in Nepali or English (e.g. When will I get a job?)' },
        name: { type: 'string', description: 'Client name' },
        dob: { type: 'string', description: 'Date of birth YYYY-MM-DD' },
        birthTime: { type: 'string', description: 'Birth time HH:MM' },
        lagnaRashi: { type: 'number', description: 'Lagna Rashi Number (1-12)' }
      },
      required: ['question']
    }
  },
  {
    name: 'porutham_matchmaking',
    description: 'Calculate South Indian & Sri Lankan 10 Poruthams (दश पोरुथम) and Papasamya malefic balance with Rajju and Vedha veto checking.',
    inputSchema: {
      type: 'object',
      properties: {
        girlNakshatra: { type: 'number', description: 'Bride Nakshatra index (1-27)' },
        boyNakshatra: { type: 'number', description: 'Groom Nakshatra index (1-27)' },
        girlRashi: { type: 'number', description: 'Bride Moon Rashi index (1-12)' },
        boyRashi: { type: 'number', description: 'Groom Moon Rashi index (1-12)' }
      },
      required: ['girlNakshatra', 'boyNakshatra']
    }
  },
  {
    name: 'pancha_pakshi_analysis',
    description: 'Determine Pancha Pakshi birth bird (Vulture, Owl, Crow, Rooster, Peacock) and relationship affinity.',
    inputSchema: {
      type: 'object',
      properties: {
        nakshatra: { type: 'number', description: 'Nakshatra index (1-27)' }
      },
      required: ['nakshatra']
    }
  },
  {
    name: 'openrouter_ai_consult',
    description: 'Consult state-of-the-art AI models (GPT-4o-mini, DeepSeek, Llama 3.3 70B) via OpenRouter for conversational Vedic astrology and remedies.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Astrological question in Nepali or English' },
        model: { type: 'string', description: 'Model ID (e.g. openai/gpt-4o-mini, deepseek/deepseek-chat, meta-llama/llama-3.3-70b-instruct)' },
        context: { type: 'object', description: 'Optional chart context (dob, lagna, moonSign, dasha)' }
      },
      required: ['query']
    }
  },
  {
    name: 'openrouter_get_status',
    description: 'Check OpenRouter AI Gateway account status, active API key verification, credits, and available models.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'vedastro_horoscope_predictions',
    description: 'Calculate 100+ Vedic horoscope life predictions and event trends using VedAstro engine (Parashari rules, Swiss Ephemeris precision).',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date of birth DD/MM/YYYY or YYYY-MM-DD' },
        time: { type: 'string', description: 'Time of birth HH:mm' },
        lat: { type: 'number', description: 'Latitude' },
        lon: { type: 'number', description: 'Longitude' },
        tz: { type: 'string', description: 'Timezone offset e.g. +05:45' },
        ayanamsa: { type: 'string', description: 'Ayanamsha (LAHIRI, RAMAN, KRISHNAMURTI)' }
      }
    }
  },
  {
    name: 'vedastro_all_planet_data',
    description: 'Get planetary positions, signs, nakshatras, retrogression, combustion, and 6-fold Shadbala strengths using VedAstro.',
    inputSchema: {
      type: 'object',
      properties: {
        planet: { type: 'string', description: 'Planet name (All, Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu)' },
        date: { type: 'string', description: 'Date DD/MM/YYYY or YYYY-MM-DD' },
        time: { type: 'string', description: 'Time HH:mm' },
        lat: { type: 'number', description: 'Latitude' },
        lon: { type: 'number', description: 'Longitude' }
      }
    }
  },
  {
    name: 'vedastro_house_data',
    description: 'Calculate 12 Vedic Bhavas (Houses), signs, lordships, and occupying planets.',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date DD/MM/YYYY' },
        time: { type: 'string', description: 'Time HH:mm' },
        lat: { type: 'number', description: 'Latitude' },
        lon: { type: 'number', description: 'Longitude' }
      }
    }
  },
  {
    name: 'vedastro_ashtakavarga',
    description: 'Calculate Sarvashtakavarga 337-bindu distribution matrix across 12 signs using VedAstro.',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date DD/MM/YYYY' },
        time: { type: 'string', description: 'Time HH:mm' },
        lat: { type: 'number', description: 'Latitude' },
        lon: { type: 'number', description: 'Longitude' }
      }
    }
  },
  {
    name: 'vedastro_kuta_score',
    description: 'Calculate 10 Kuta marriage compatibility score between male and female charts using VedAstro.',
    inputSchema: {
      type: 'object',
      properties: {
        maleDate: { type: 'string', description: 'Groom birth date DD/MM/YYYY' },
        maleTime: { type: 'string', description: 'Groom birth time HH:mm' },
        femaleDate: { type: 'string', description: 'Bride birth date DD/MM/YYYY' },
        femaleTime: { type: 'string', description: 'Bride birth time HH:mm' }
      }
    }
  },
  {
    name: 'vedastro_yogas',
    description: 'Detect classical Vedic Yogas (Gajakesari, Budhaditya, Ruchaka, Hamsa, Chandra-Mangal, etc.) using VedAstro.',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date DD/MM/YYYY' },
        time: { type: 'string', description: 'Time HH:mm' },
        lat: { type: 'number', description: 'Latitude' },
        lon: { type: 'number', description: 'Longitude' }
      }
    }
  }
];

async function handleMcpRequest(requestBody) {
  const { jsonrpc, id, method, params } = requestBody || {};

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        serverInfo: {
          name: 'astro-tiwari-vedic-mcp',
          version: '1.0.0'
        },
        capabilities: {
          tools: {}
        }
      }
    };
  }

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: MCP_TOOLS
      }
    };
  }

  if (method === 'tools/call') {
    const toolName = params ? params.name : '';
    const args = (params && params.arguments) ? params.arguments : {};

    try {
      if (toolName === 'calculate_kundali') {
        const chart = await astrologyService.generateChartForSubmission(args);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  lagna: chart.astrologyData.lagna,
                  moonSign: chart.astrologyData.moonSign,
                  nakshatra: chart.astrologyData.nakshatra,
                  planets: chart.astrologyData.planets,
                  chartSvgUrl: chart.chartSvgUrl,
                  source: chart.source
                }, null, 2)
              }
            ]
          }
        };
      }

      if (toolName === 'calculate_vimshottari_dasha') {
        const moonDeg = args.moonLongitude || 120;
        const dasha = vedicEngine.calculateVimshottariDasha(args.year, args.month, args.day, moonDeg);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(dasha, null, 2) }]
          }
        };
      }

      if (toolName === 'match_kundali_guna') {
        const match = vedicEngine.calculateAshtakootMilan(
          { nakshatraId: args.boyNakshatraId, rashiId: args.boyRashiId },
          { nakshatraId: args.girlNakshatraId, rashiId: args.girlRashiId }
        );
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(match, null, 2) }]
          }
        };
      }

      if (toolName === 'get_panchang') {
        const panchang = vedicEngine.calculateDailyPanchang(args.date ? new Date(args.date) : new Date());
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(panchang, null, 2) }]
          }
        };
      }

      if (toolName === 'ask_vedic_ai') {
        const aiRes = await aiChatbot.processAstrologyChat(args.query);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: aiRes.reply }]
          }
        };
      }

      if (toolName === 'roxy_check_doshas') {
        const mars = args.marsBhava || 1;
        const lagna = args.lagnaSign || 1;
        const moon = args.moonSign || 1;
        const manglik = roxyApi.calculateManglikDosha(mars, lagna);
        const sadhesati = roxyApi.calculateSadhesati(moon);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify({ manglik, sadhesati }, null, 2) }]
          }
        };
      }

      if (toolName === 'roxy_detect_yogas') {
        let planets = [];
        if (args.birthDetails) {
          const chart = await astrologyService.generateChartForSubmission(args.birthDetails);
          planets = chart.astrologyData?.planets || [];
        }
        const yogas = roxyApi.detectVedicYogas(planets);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(yogas, null, 2) }]
          }
        };
      }

      if (toolName === 'roxy_get_choghadiya') {
        const choghadiya = roxyApi.calculateChoghadiya(args.date ? new Date(args.date) : new Date());
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(choghadiya, null, 2) }]
          }
        };
      }

      if (toolName === 'astroway_human_design') {
        const hd = astrowaySdk.computeHumanDesign(args);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(hd, null, 2) }]
          }
        };
      }

      if (toolName === 'astroway_numerology') {
        const num = astrowaySdk.computeNumerology(args.name, args.dob);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(num, null, 2) }]
          }
        };
      }

      if (toolName === 'astroway_synastry') {
        const syn = await astrowaySdk.computeSynastry(args.chart1, args.chart2);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(syn, null, 2) }]
          }
        };
      }

      if (toolName === 'astroway_tarot') {
        const tarot = astrowaySdk.getTarotReading(args.spreadType || 'three-card');
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(tarot, null, 2) }]
          }
        };
      }

      if (toolName === 'astroway_get_reference') {
        const ref = await astrowaySdk.getReferenceData(args.category || 'signs');
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(ref, null, 2) }]
          }
        };
      }

      if (toolName === 'vedic_gemstone_recommendation') {
        const res = gemlyService.recommendGemstones(args);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
          }
        };
      }

      if (toolName === 'vedic_vimshottari_dasha') {
        const res = dashaService.getCurrentDasha(args.birthDate, args.moonLongitude, args.targetDate);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
          }
        };
      }

      if (toolName === 'agentic_pandit_consult') {
        const res = await panditAgentService.consultAgenticPandit(args);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
          }
        };
      }

      if (toolName === 'porutham_matchmaking') {
        const res = poruthamService.calculate10Poruthams(args.girlNakshatra, args.boyNakshatra, args.girlRashi, args.boyRashi);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
          }
        };
      }

      if (toolName === 'pancha_pakshi_analysis') {
        const res = poruthamService.getPanchaPakshiBird(args.nakshatra);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
          }
        };
      }

      if (toolName === 'openrouter_ai_consult') {
        const res = await openRouterService.generateVedicAstrologyResponse({
          userMessage: args.query,
          contextData: args.context || {},
          model: args.model
        });
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
          }
        };
      }

      if (toolName === 'openrouter_get_status') {
        const res = await openRouterService.getAccountStatus();
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
          }
        };
      }

      if (toolName === 'vedastro_horoscope_predictions') {
        const res = await vedastro.getHoroscopePredictions(args.lat, args.lon, args.time, args.date, args.tz, args.ayanamsa);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
          }
        };
      }

      if (toolName === 'vedastro_all_planet_data') {
        const res = await vedastro.getAllPlanetData(args.planet || 'All', args.lat, args.lon, args.time, args.date, args.tz, args.ayanamsa);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
          }
        };
      }

      if (toolName === 'vedastro_house_data') {
        const res = await vedastro.getAllHouseData(args.lat, args.lon, args.time, args.date, args.tz, args.ayanamsa);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
          }
        };
      }

      if (toolName === 'vedastro_ashtakavarga') {
        const res = await vedastro.getAshtakvarga(args.lat, args.lon, args.time, args.date, args.tz, args.ayanamsa);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
          }
        };
      }

      if (toolName === 'vedastro_kuta_score') {
        const res = await vedastro.getMatchReport(
          args.maleLat || 27.7172, args.maleLon || 85.3240, args.maleTime || '08:30', args.maleDate || '15/05/1995', args.maleTz || '+05:45',
          args.femaleLat || 27.7172, args.femaleLon || 85.3240, args.femaleTime || '10:15', args.femaleDate || '20/08/1997', args.femaleTz || '+05:45'
        );
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
          }
        };
      }

      if (toolName === 'vedastro_yogas') {
        const res = await vedastro.getAllYogas(args.lat, args.lon, args.time, args.date, args.tz, args.ayanamsa);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(res, null, 2) }]
          }
        };
      }

      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Tool not found: ${toolName}` }
      };
    } catch (err) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32000, message: err.message }
      };
    }
  }

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not supported: ${method}` }
  };
}

module.exports = {
  MCP_TOOLS,
  getTools: () => MCP_TOOLS,
  handleMcpRequest
};
