const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
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
  key: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  },
  rateLimit: {
    type: Number,
    default: 1000
  },
  rateLimitWindow: {
    type: Number,
    default: 60
  },
  lastUsed: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  permissions: {
    type: [String],
    default: ['read']
  },
  requestCount: {
    type: Number,
    default: 0
  },
  ipWhitelist: [String],
  rotatedFrom: mongoose.Schema.Types.ObjectId,
  rotatedTo: mongoose.Schema.Types.ObjectId,
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for faster lookups
apiKeySchema.index({ key: 1 });
apiKeySchema.index({ userId: 1, apiId: 1 });

// Static method to generate API key
apiKeySchema.statics.generateKey = function() {
  return 'sk_' + crypto.randomBytes(32).toString('hex');
};

module.exports = mongoose.model('APIKey', apiKeySchema);
