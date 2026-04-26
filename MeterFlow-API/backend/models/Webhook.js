const mongoose = require('mongoose');
const crypto = require('crypto');

const webhookSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  apiId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'API'
  },
  url: {
    type: String,
    required: true
  },
  events: {
    type: [String],
    enum: ['usage.recorded', 'key.rotated', 'billing.created', 'payment.completed', 'rate_limit.exceeded', 'api.error'],
    required: true
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  },
  secret: {
    type: String,
    required: true
  },
  headers: mongoose.Schema.Types.Mixed,
  retryAttempts: {
    type: Number,
    default: 3
  },
  retryDelay: {
    type: Number,
    default: 5000 // milliseconds
  },
  lastEventAt: Date,
  failureCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for faster queries
webhookSchema.index({ userId: 1 });
webhookSchema.index({ apiId: 1 });

// Static method to generate webhook secret
webhookSchema.statics.generateSecret = function() {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = mongoose.model('Webhook', webhookSchema);
