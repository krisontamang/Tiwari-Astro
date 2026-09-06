/**
 * services/vedastro.js
 * Connector for VedAstro API (https://github.com/VedAstro/Vedic-Astrology-AI-MCP-Server.git)
 * Public API: https://api.vedastro.org/api
 */

const https = require('https');
const url = require('url');

const VEDASTRO_API_BASE = 'https://api.vedastro.org/api';

function fetchVedAstro(endpointPath) {
  const apiKey = process.env.VEDASTRO_API_KEY || '';
  const fullUrl = `${VEDASTRO_API_BASE}${endpointPath}`;

  return new Promise((resolve) => {
    try {
      const parsed = new url.URL(fullUrl);
      const headers = {
        'Accept': 'application/json'
      };
      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }

      const req = https.request(parsed, {
        method: 'GET',
        headers,
        timeout: 7000
      }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const json = JSON.parse(data);
              if (json && json.Status === 'Pass') {
                resolve({ success: true, payload: json.Payload });
              } else {
                resolve({ success: false, error: json.Payload || 'VedAstro error' });
              }
            } else {
              resolve({ success: false, status: res.statusCode });
            }
          } catch (e) {
            resolve({ success: false, error: e.message });
          }
        });
      });

      req.on('error', (err) => resolve({ success: false, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ success: false, error: 'Timeout' }); });
      req.end();
    } catch (e) {
      resolve({ success: false, error: e.message });
    }
  });
}

/**
 * Get Horoscope Predictions from VedAstro
 * Format: Location/{lat},{lon}/Time/{time}/{date}/{tz}/Ayanamsa/LAHIRI
 */
async function getHoroscopePredictions(lat, lon, timeStr, dateStr, tzStr = '+05:45') {
  // dateStr format: DD/MM/YYYY
  // timeStr format: HH:MM
  const path = `/Calculate/HoroscopePredictions/Location/${lat},${lon}/Time/${timeStr}/${dateStr}/${tzStr}/Ayanamsa/LAHIRI`;
  return await fetchVedAstro(path);
}

/**
 * Get Match Report (Kuta Score) from VedAstro
 */
async function getMatchReport(mLat, mLon, mTime, mDate, mTz, fLat, fLon, fTime, fDate, fTz) {
  const path = `/Calculate/MatchReport/Location/${mLat},${mLon}/Time/${mTime}/${mDate}/${mTz}/Location/${fLat},${fLon}/Time/${fTime}/${fDate}/${fTz}`;
  return await fetchVedAstro(path);
}

/**
 * Get Ashtakvarga chart from VedAstro
 */
async function getAshtakvarga(lat, lon, timeStr, dateStr, tzStr = '+05:45') {
  const path = `/Calculate/Ashtakvarga/Location/${lat},${lon}/Time/${timeStr}/${dateStr}/${tzStr}/Ayanamsa/LAHIRI`;
  return await fetchVedAstro(path);
}

module.exports = {
  getHoroscopePredictions,
  getMatchReport,
  getAshtakvarga
};
