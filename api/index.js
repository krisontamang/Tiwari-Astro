/**
 * api/index.js
 * Vercel Serverless Function entrypoint for Astro Tiwari
 */

const { handleRequest } = require('../server');

module.exports = async (req, res) => {
  return handleRequest(req, res);
};
