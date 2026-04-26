const express = require('express');
const router = express.Router();
const axios = require('axios');
const { gatewayRateLimit, logUsage, checkIPWhitelist } = require('../middleware/gateway');

// Apply gateway middleware to all requests
router.use(gatewayRateLimit);
router.use(logUsage);
router.use(checkIPWhitelist);

// Forward all requests to target API - catch all routes
router.use(async (req, res) => {
  try {
    if (!req.apiId) {
      return res.status(400).json({ error: 'API ID not found - check API key' });
    }

    const API = require('../models/API');
    
    const api = await API.findById(req.apiId);
    if (!api) {
      return res.status(404).json({ error: 'API not found' });
    }

    // Build target path
    const path = req.originalUrl.replace(`/gateway/${req.apiId}`, '') || '/';
    const targetUrl = `${api.baseUrl.endsWith('/') ? api.baseUrl.slice(0, -1) : api.baseUrl}${path}`;
    
    // Forward request
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      params: req.query,
      headers: {
        ...req.headers,
        host: new URL(api.baseUrl).host,
        'X-Forwarded-For': req.ip,
        'X-API-Key': req.headers['x-api-key'] // pass if needed
      },
      timeout: 30000,
      validateStatus: () => true // pass all statuses
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Gateway proxy error:', error.message);
    res.status(error.response?.status || 502).json({
      error: 'Proxy error',
      message: error.message,
      details: error.response?.data
    });
  }
});

module.exports = router;
