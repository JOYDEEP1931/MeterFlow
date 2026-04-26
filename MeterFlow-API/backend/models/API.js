const mongoose = require('mongoose');

const apiSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  baseUrl: {
    type: String,
    required: true
  },
  endpoint: String,
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
    default: 60, // in seconds
  },
  pricingModel: {
    type: String,
    enum: ['pay_per_request', 'subscription', 'tiered'],
    default: 'pay_per_request'
  },
  pricePerRequest: {
    type: Number,
    default: 0.001 // in cents
  },
  monthlySubscriptionPrice: {
    type: Number,
    default: 0
  },
  tieredPricing: [{
    minRequests: Number,
    maxRequests: Number,
    pricePerRequest: Number
  }],
  documentation: String,
  webhookUrl: String,
  webhookSecret: String,
  totalRequests: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  averageLatency: {
    type: Number,
    default: 0
  },
  errorRate: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'deprecated'],
    default: 'active'
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
apiSchema.index({ userId: 1 });
apiSchema.index({ createdAt: -1 });

module.exports = mongoose.model('API', apiSchema);
