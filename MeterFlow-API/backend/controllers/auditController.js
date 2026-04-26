const AuditLog = require('../models/AuditLog');

// Get Audit Logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, resourceType, limit = 50, skip = 0 } = req.query;

    const query = { userId: req.userId };
    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await AuditLog.countDocuments(query);

    res.json({
      total,
      count: logs.length,
      logs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Audit Log Details
exports.getAuditLogDetails = async (req, res) => {
  try {
    const { logId } = req.params;
    const log = await AuditLog.findById(logId);

    if (!log) {
      return res.status(404).json({ error: 'Audit log not found' });
    }

    if (log.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Activity Summary
exports.getActivitySummary = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - parseInt(days));

    const logs = await AuditLog.find({
      userId: req.userId,
      timestamp: { $gte: startDate, $lte: now }
    });

    const actionCounts = {};
    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    res.json({
      days,
      totalActions: logs.length,
      actionCounts,
      logs: logs.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
