const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const UsageLog = require('../models/UsageLog');
const APIKey = require('../models/APIKey');

// Get user API analytics summary
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const match = { userId: req.userId };
    const period = req.query.period || '30d';
    const now = new Date();
    if (period === '7d') {
      match.timestamp = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
    } else if (period === '30d') {
      match.timestamp = { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) };
    }

    const stats = await UsageLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          totalCost: { $sum: '$costIncurred' },
          avgLatency: { $avg: '$responseTime' },
          errorCount: { $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] } }
        }
      }
    ]);

    res.json(stats[0] || { totalRequests: 0, totalCost: 0, avgLatency: 0, errorCount: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get API key usage chart data
router.get('/chart/:apiKeyId', verifyToken, async (req, res) => {
  try {
    const apiKey = await APIKey.findOne({ _id: req.params.apiKeyId, userId: req.userId });
    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    const data = await UsageLog.aggregate([
      { $match: { apiKeyId: req.params.apiKeyId } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          requests: { $sum: 1 },
          cost: { $sum: '$costIncurred' }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
