/**
 * services/mcpServer.js
 * Model Context Protocol (MCP) JSON-RPC 2.0 Handler
 * Compatible with Astroway MCP & VedAstro MCP specs
 */

const astrologyService = require('./astrology');
const vedicEngine = require('./vedicEngine');
const aiChatbot = require('./aiChatbot');
const vedastro = require('./vedastro');

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
  handleMcpRequest
};
