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
const kerykeionService = require('./kerykeionService');
const xinisEngineService = require('./xinisEngineService');
const iztroService = require('./iztroService');
const nepaliPatroService = require('./nepaliPatroService');


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
  },
  {
    name: 'kerykeion_birth_chart',
    description: 'Calculate complete Kerykeion Western/Tropical natal chart with 12 houses (Placidus/Equal), planetary positions (Sun-Pluto, Chiron, Nodes), elements, and moon phase.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Subject name' },
        year: { type: 'number', description: 'Birth Year' },
        month: { type: 'number', description: 'Birth Month (1-12)' },
        day: { type: 'number', description: 'Birth Day (1-31)' },
        hour: { type: 'number', description: 'Birth Hour (0-23)' },
        minute: { type: 'number', description: 'Birth Minute (0-59)' },
        city: { type: 'string', description: 'Birth City' },
        nation: { type: 'string', description: 'Country code (e.g. NP, US, GB)' },
        lat: { type: 'number', description: 'Latitude' },
        lng: { type: 'number', description: 'Longitude' },
        houseSystem: { type: 'string', description: 'House system: Placidus, Equal, Whole_Sign' }
      },
      required: ['year', 'month', 'day']
    }
  },
  {
    name: 'kerykeion_aspects',
    description: 'Calculate planetary aspect grid with exact orbs and applying/separating dynamics according to Kerykeion AspectsFactory.',
    inputSchema: {
      type: 'object',
      properties: {
        year: { type: 'number', description: 'Birth Year' },
        month: { type: 'number', description: 'Birth Month' },
        day: { type: 'number', description: 'Birth Day' },
        hour: { type: 'number', description: 'Birth Hour' },
        minute: { type: 'number', description: 'Birth Minute' },
        lat: { type: 'number', description: 'Latitude' },
        lng: { type: 'number', description: 'Longitude' }
      },
      required: ['year', 'month', 'day']
    }
  },
  {
    name: 'kerykeion_synastry_score',
    description: 'Calculate Ciro Discepolo synastry compatibility score (0-30+ pts, minimal to rare exceptional) and inter-chart aspects between two individuals.',
    inputSchema: {
      type: 'object',
      properties: {
        person1: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            year: { type: 'number' },
            month: { type: 'number' },
            day: { type: 'number' },
            hour: { type: 'number' },
            minute: { type: 'number' },
            lat: { type: 'number' },
            lng: { type: 'number' }
          },
          required: ['year', 'month', 'day']
        },
        person2: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            year: { type: 'number' },
            month: { type: 'number' },
            day: { type: 'number' },
            hour: { type: 'number' },
            minute: { type: 'number' },
            lat: { type: 'number' },
            lng: { type: 'number' }
          },
          required: ['year', 'month', 'day']
        }
      },
      required: ['person1', 'person2']
    }
  },
  {
    name: 'kerykeion_chart_svg',
    description: 'Generate modern 5-concentric-ring circular SVG astrological wheel chart for natal or synastry.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        year: { type: 'number' },
        month: { type: 'number' },
        day: { type: 'number' },
        hour: { type: 'number' },
        minute: { type: 'number' },
        city: { type: 'string' },
        lat: { type: 'number' },
        lng: { type: 'number' },
        theme: { type: 'string', description: 'Theme: dark or light' }
      },
      required: ['year', 'month', 'day']
    }
  },
  {
    name: 'kerykeion_full_report',
    description: 'Generate comprehensive Markdown astrological interpretation report using Kerykeion Western astrology engine.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        year: { type: 'number' },
        month: { type: 'number' },
        day: { type: 'number' },
        hour: { type: 'number' },
        minute: { type: 'number' },
        city: { type: 'string' },
        lat: { type: 'number' },
        lng: { type: 'number' }
      },
      required: ['year', 'month', 'day']
    }
  },
  {
    name: 'xinis_natal_chart',
    description: 'Calculate complete astrological chart with XiNiS Engine across 10 house systems (Placidus, Whole Sign, Koch, Equal, Campanus, Regiomontanus, Porphyry, Morinus, Topocentric, Alcabitius), Part of Fortune, Vertex, and AI Markdown export.',
    inputSchema: {
      type: 'object',
      properties: {
        datetime_utc: { type: 'string', description: 'ISO UTC datetime of birth (e.g. 2000-05-15T12:30:00Z)' },
        latitude: { type: 'number', description: 'Birth latitude (-90 to 90)' },
        longitude: { type: 'number', description: 'Birth longitude (-180 to 180)' },
        location_name: { type: 'string', description: 'City/Location name' },
        house_system: { type: 'string', description: 'House system (Placidus, Whole_Sign, Koch, Equal, Campanus, Regiomontanus, Porphyry, Morinus, Topocentric, Alcabitius)' }
      },
      required: ['datetime_utc']
    }
  },
  {
    name: 'xinis_aspect_patterns',
    description: 'Detect 7 astrological aspect patterns (Grand Trine, T-Square, Grand Cross, Yod / Finger of God, Kite, Stellium, Mystic Rectangle) with apex focal planets and elements.',
    inputSchema: {
      type: 'object',
      properties: {
        datetime_utc: { type: 'string', description: 'ISO UTC datetime of birth' },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        house_system: { type: 'string' }
      },
      required: ['datetime_utc']
    }
  },
  {
    name: 'xinis_fixed_stars',
    description: 'Calculate positions of 16 major fixed stars (Regulus, Spica, Algol, Aldebaran, Antares, Sirius, Betelgeuse, Rigel, Vega, Arcturus, etc.) and star clusters (Pleiades, Hyades, Praesepe) with J2000.0 precession and planetary conjunctions.',
    inputSchema: {
      type: 'object',
      properties: {
        datetime_utc: { type: 'string', description: 'Target or birth ISO UTC datetime' },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        star_orb: { type: 'number', description: 'Maximum orb in degrees for conjunction (default 1.2)' }
      },
      required: ['datetime_utc']
    }
  },
  {
    name: 'xinis_secondary_progressions',
    description: 'Compute secondary progressed chart (1 day = 1 year of life) with progressed planets, houses, and progressed-to-natal aspects.',
    inputSchema: {
      type: 'object',
      properties: {
        datetime_utc: { type: 'string', description: 'Birth ISO UTC datetime' },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        progression_date: { type: 'string', description: 'Target date to progress to (e.g. 2026-09-06)' }
      },
      required: ['datetime_utc', 'progression_date']
    }
  },
  {
    name: 'xinis_solar_lunar_returns',
    description: 'Find the exact moment the transiting Sun or Moon returns to its natal longitude with high-precision numerical convergence, generating full return charts.',
    inputSchema: {
      type: 'object',
      properties: {
        datetime_utc: { type: 'string', description: 'Birth ISO UTC datetime' },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        return_type: { type: 'string', enum: ['solar', 'lunar'], description: 'Type of return: solar or lunar' },
        return_year: { type: 'number', description: 'Year for solar return (e.g. 2025)' },
        return_date: { type: 'string', description: 'Approximate target date for lunar return' }
      },
      required: ['datetime_utc']
    }
  },
  {
    name: 'iztro_ziwei_astrolabe',
    description: 'Calculate complete Chinese Purple Star Astrology (Zi Wei Dou Shu / 紫微斗数) astrolabe: Chinese Lunar calendar date, 12 Palaces, 14 Major Stars with brightness, Auxiliary stars, Da Xian, and Si Hua transformations.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Subject name' },
        gender: { type: 'string', enum: ['Male', 'Female', 'male', 'female'], description: 'Gender for Da Xian direction' },
        birthDate: { type: 'string', description: 'Solar date of birth ISO (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)' }
      },
      required: ['birthDate']
    }
  },
  {
    name: 'iztro_ziwei_svg',
    description: 'Generate traditional Chinese 12-Palace Perimeter Square Grid Astrolabe SVG chart for Zi Wei Dou Shu.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        gender: { type: 'string', enum: ['Male', 'Female', 'male', 'female'] },
        birthDate: { type: 'string' }
      },
      required: ['birthDate']
    }
  },
  {
    name: 'get_nepali_date',
    description: 'Get current Nepali Bikram Sambat (BS) date, English AD equivalent, Tithi, Paksha, weekday, and Kathmandu sunrise/sunset.',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Optional ISO date or AD date (YYYY-MM-DD). Defaults to current date.' }
      }
    }
  },
  {
    name: 'convert_bs_ad',
    description: 'Convert Bikram Sambat (BS 1700-2200) date to Anno Domini (AD) or AD date to BS with high accuracy.',
    inputSchema: {
      type: 'object',
      properties: {
        direction: { type: 'string', enum: ['bs_to_ad', 'ad_to_bs'], description: 'Conversion direction' },
        bsDate: { type: 'string', description: 'BS date format YYYY-MM-DD e.g. 2083-05-22' },
        adDate: { type: 'string', description: 'AD date format YYYY-MM-DD e.g. 2026-09-06' }
      },
      required: ['direction']
    }
  },
  {
    name: 'get_nepali_panchanga',
    description: 'Compute full mathematical Nepali Panchanga: Tithi, Paksha, Nakshatra, Yoga, Karana, Sunrise, Sunset, Rahukaal, and Abhijit Muhurat.',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Target date (ISO or YYYY-MM-DD). Defaults to today.' },
        lat: { type: 'number', description: 'Latitude (default Kathmandu 27.7172)' },
        lon: { type: 'number', description: 'Longitude (default Kathmandu 85.3240)' }
      }
    }
  },
  {
    name: 'get_nepali_festivals',
    description: 'Get major Nepali festivals, national holidays, and religious observances for a given BS month or year from Bikram Sambat calendar.',
    inputSchema: {
      type: 'object',
      properties: {
        bsYear: { type: 'number', description: 'Bikram Sambat year (e.g. 2083)' },
        bsMonth: { type: 'number', description: 'Bikram Sambat month (1-12, 1=Baisakh)' }
      }
    }
  },
  {
    name: 'get_rashifal',
    description: 'Get live daily, weekly, monthly, or yearly Rashifal (astrological horoscope) for all 12 Rashis from Hamro Patro scraper.',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'yearly'], description: 'Horoscope timeframe (default: daily)' },
        rashi: { type: 'string', description: 'Optional specific Rashi name in Nepali or English (e.g. मेष or Aries)' }
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

      if (toolName === 'kerykeion_birth_chart') {
        const subject = kerykeionService.createSubject(args);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(subject, null, 2) }]
          }
        };
      }

      if (toolName === 'kerykeion_aspects') {
        const subject = kerykeionService.createSubject(args);
        const aspects = kerykeionService.calculateSingleChartAspects(subject, args.options);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(aspects, null, 2) }]
          }
        };
      }

      if (toolName === 'kerykeion_synastry_score') {
        const s1 = kerykeionService.createSubject(args.person1);
        const s2 = kerykeionService.createSubject(args.person2);
        const score = kerykeionService.calculateRelationshipScore(s1, s2, args.options);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(score, null, 2) }]
          }
        };
      }

      if (toolName === 'kerykeion_chart_svg') {
        const subject = kerykeionService.createSubject(args);
        const svg = kerykeionService.generateWheelSvg(subject, { theme: args.theme || 'dark' });
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: svg }]
          }
        };
      }

      if (toolName === 'kerykeion_full_report') {
        const subject = kerykeionService.createSubject(args);
        const report = kerykeionService.generateReport(subject);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: report }]
          }
        };
      }

      if (toolName === 'xinis_natal_chart') {
        const chart = xinisEngineService.calculateNatalChart(args);
        const markdown = xinisEngineService.exportToMarkdown(chart);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              { type: 'text', text: markdown },
              { type: 'text', text: JSON.stringify(chart, null, 2) }
            ]
          }
        };
      }

      if (toolName === 'xinis_aspect_patterns') {
        const chart = xinisEngineService.calculateNatalChart(args);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify({
              patterns: chart.patterns,
              aspectsCount: chart.aspects.length,
              planets: Object.keys(chart.planets)
            }, null, 2) }]
          }
        };
      }

      if (toolName === 'xinis_fixed_stars') {
        const chart = xinisEngineService.calculateNatalChart(args);
        const starsData = xinisEngineService.calculateFixedStars(new Date(args.datetime_utc || new Date()), args.star_orb || 1.2);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify({
              conjunctions: chart.fixedStarConjunctions,
              allMajorStars: starsData.stars,
              starClusters: starsData.clusters,
              precessionDegrees: starsData.precessionDegrees
            }, null, 2) }]
          }
        };
      }

      if (toolName === 'xinis_secondary_progressions') {
        const prog = xinisEngineService.calculateSecondaryProgressions(args, args.progression_date || new Date());
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(prog, null, 2) }]
          }
        };
      }

      if (toolName === 'xinis_solar_lunar_returns') {
        let returnData;
        if (args.return_type === 'lunar') {
          returnData = xinisEngineService.calculateLunarReturn(args, args.return_date || new Date());
        } else {
          returnData = xinisEngineService.calculateSolarReturn(args, args.return_year || new Date().getFullYear());
        }
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(returnData, null, 2) }]
          }
        };
      }

      if (toolName === 'iztro_ziwei_astrolabe') {
        const astrolabe = iztroService.calculateAstrolabe(args);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(astrolabe, null, 2) }]
          }
        };
      }

      if (toolName === 'iztro_ziwei_svg') {
        const astrolabe = iztroService.calculateAstrolabe(args);
        const svg = iztroService.generateAstrolabeSvg(astrolabe, args);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: svg }]
          }
        };
      }

      if (toolName === 'get_nepali_date') {
        const targetDate = args.date ? new Date(args.date) : new Date();
        const bs = nepaliPatroService.adToBs(targetDate);
        const panchang = nepaliPatroService.calculatePanchanga(targetDate);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{
              type: 'text',
              text: JSON.stringify({
                bs,
                panchanga: panchang,
                ad: targetDate.toISOString().split('T')[0]
              }, null, 2)
            }]
          }
        };
      }

      if (toolName === 'convert_bs_ad') {
        let result;
        if (args.direction === 'bs_to_ad') {
          const parts = (args.bsDate || '').split('-').map(Number);
          result = nepaliPatroService.bsToAd(parts[0], parts[1], parts[2]);
        } else {
          result = nepaliPatroService.adToBs(args.adDate || new Date());
        }
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
          }
        };
      }

      if (toolName === 'get_nepali_panchanga') {
        const targetDate = args.date ? new Date(args.date) : new Date();
        const panchang = nepaliPatroService.calculatePanchanga(targetDate, args.lat || 27.7172, args.lon || 85.3240);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(panchang, null, 2) }]
          }
        };
      }

      if (toolName === 'get_nepali_festivals') {
        const year = args.bsYear || 2083;
        const month = args.bsMonth;
        let festivals = nepaliPatroService.NEPALI_FESTIVALS;
        if (month) {
          festivals = festivals.filter(f => f.bsMonth === Number(month));
        }
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify({ bsYear: year, bsMonth: month || 'all', total: festivals.length, festivals }, null, 2) }]
          }
        };
      }

      if (toolName === 'get_rashifal') {
        const type = args.type || 'daily';
        const rashifal = await nepaliPatroService.getRashifal(type);
        let result = rashifal;
        if (args.rashi && rashifal && rashifal.items) {
          const needle = args.rashi.toLowerCase().trim();
          result = rashifal.items.find(r => 
            (r.rashiNp && r.rashiNp.includes(needle)) || 
            (r.rashiEn && r.rashiEn.toLowerCase().includes(needle))
          ) || rashifal;
        }
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
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
  listTools: () => MCP_TOOLS,
  handleMcpRequest
};
