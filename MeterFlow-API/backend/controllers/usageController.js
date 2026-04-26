const UsageLog = require('../models/UsageLog');

// Get Usage Logs
exports.getUsageLogs = async (req, res) => {
  try {
    const { apiId, apiKeyId, limit = 50, skip = 0, startDate, endDate } = req.query;

    const query = { userId: req.userId };
    if (apiId) query.apiId = apiId;
    if (apiKeyId) query.apiKeyId = apiKeyId;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await UsageLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('apiId', 'name')
      .populate('apiKeyId', 'name');

    const total = await UsageLog.countDocuments(query);

    res.json({
      total,
      count: logs.length,
      logs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Usage Summary
exports.getUsageSummary = async (req, res) => {
  try {
    const { apiId, period = '30d' } = req.query;

    const now = new Date();
    let startDate = new Date(now);

    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);

    const query = {
      userId: req.userId,
      timestamp: { $gte: startDate, $lte: now }
    };

    if (apiId) query.apiId = apiId;

    const logs = await UsageLog.find(query);

    const totalRequests = logs.length;
    const totalCost = logs.reduce((sum, log) => sum + (log.costIncurred || 0), 0);
    const avgResponseTime = logs.length > 0
      ? logs.reduce((sum, log) => sum + log.responseTime, 0) / logs.length
      : 0;

    const errorCount = logs.filter(log => log.statusCode >= 400).length;
    const errorRate = totalRequests > 0 ? (errorCount / totalRequests * 100).toFixed(2) : 0;

    res.json({
      period,
      startDate,
      endDate: now,
      totalRequests,
      totalCost: totalCost.toFixed(2),
      avgResponseTime: avgResponseTime.toFixed(2),
      errorCount,
      errorRate: `${errorRate}%`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get daily usage stats
exports.getDailyStats = async (req, res) => {
  try {
    const { apiId, days = 30 } = req.query;

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - parseInt(days));

    const query = {
      userId: req.userId,
      timestamp: { $gte: startDate, $lte: now }
    };

    if (apiId) query.apiId = apiId;

    const logs = await UsageLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          requestCount: { $sum: 1 },
          totalCost: { $sum: '$costIncurred' },
          avgResponseTime: { $avg: '$responseTime' },
          errorCount: {
            $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      days,
      stats: logs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
