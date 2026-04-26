const mongoose = require('mongoose');

const usageLogSchema = new mongoose.Schema({
  apiKeyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'APIKey',
    required: true
  },
  apiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'API',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  endpoint: String,
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    required: true
  },
  statusCode: {
    type: Number,
    required: true
  },
  responseTime: {
    type: Number,
    required: true // in milliseconds
  },
  requestSize: Number,
  responseSize: Number,
  ipAddress: String,
  userAgent: String,
  errorMessage: String,
  costIncurred: {
    type: Number,
    default: 0
  },
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 2592000 // 30 days TTL
  }
}, { timestamps: true });

// Index for faster queries
usageLogSchema.index({ apiKeyId: 1, timestamp: -1 });
usageLogSchema.index({ userId: 1, timestamp: -1 });
usageLogSchema.index({ apiId: 1, timestamp: -1 });
usageLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('UsageLog', usageLogSchema);
