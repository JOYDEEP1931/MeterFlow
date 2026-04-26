const redis = require('redis');
const UsageLog = require('../models/UsageLog');
const APIKey = require('../models/APIKey');
const API = require('../models/API');

// Initialize Redis client for rate limiting
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// API Gateway - Rate Limiting
const gatewayRateLimit = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    const key = await APIKey.findOne({ key: apiKey, isActive: true });
    if (!key) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Check expiration
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      return res.status(401).json({ error: 'API key expired' });
    }

    // Check rate limit
    const redisKey = `rate_limit:${apiKey}`;
    const currentCount = await redisClient.get(redisKey);
    const count = currentCount ? parseInt(currentCount) : 0;

    if (count >= key.rateLimit) {
      // Emit event for rate limit exceeded
      const io = req.app.get('io');
      if (io) {
        io.to(key.userId.toString()).emit('rate_limit_exceeded', {
          apiKeyId: key._id,
          apiId: key.apiId,
          limit: key.rateLimit,
          window: key.rateLimitWindow
        });
      }

      return res.status(429).json({
        error: 'Rate limit exceeded',
        limit: key.rateLimit,
        window: `${key.rateLimitWindow}s`,
        remaining: 0
      });
    }

    // Increment counter
    if (count === 0) {
      await redisClient.setex(redisKey, key.rateLimitWindow, 1);
    } else {
      await redisClient.incr(redisKey);
    }

    const remaining = key.rateLimit - count - 1;
    res.setHeader('X-RateLimit-Limit', key.rateLimit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Window', `${key.rateLimitWindow}s`);

    req.apiKey = key;
    req.apiId = key.apiId;
    req.userId = key.userId;
    next();
  } catch (error) {
    console.error('Rate limit middleware error:', error);
    return res.status(500).json({ error: 'Gateway error' });
  }
};

// Log API usage
const logUsage = async (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', async () => {
    try {
      const duration = Date.now() - startTime;
      const contentLength = res.get('content-length') || 0;

      if (req.apiKey && req.apiId) {
        // Calculate cost based on pricing model
        const api = await API.findById(req.apiId);
        let costIncurred = 0;

        if (api) {
          if (api.pricingModel === 'pay_per_request') {
            costIncurred = api.pricePerRequest;
          } else if (api.pricingModel === 'tiered') {
            const tier = api.tieredPricing.find(t => 
              req.apiKey.requestCount >= t.minRequests && 
              req.apiKey.requestCount <= t.maxRequests
            );
            costIncurred = tier ? tier.pricePerRequest : 0;
          }
        }

        // Create usage log
        await UsageLog.create({
          apiKeyId: req.apiKey._id,
          apiId: req.apiId,
          userId: req.userId,
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode,
          responseTime: duration,
          requestSize: req.get('content-length') || 0,
          responseSize: parseInt(contentLength),
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          costIncurred,
          metadata: {
            headers: req.headers,
            query: req.query
          }
        });

        // Update API key request count
        await APIKey.findByIdAndUpdate(
          req.apiKey._id,
          {
            $inc: { requestCount: 1 },
            lastUsed: new Date()
          }
        );

        // Update API stats
        await API.findByIdAndUpdate(
          req.apiId,
          {
            $inc: { 
              totalRequests: 1,
              totalRevenue: costIncurred
            }
          }
        );

        // Emit real-time event
        const io = req.app.get('io');
        if (io) {
          io.to(req.userId.toString()).emit('usage_recorded', {
            apiId: req.apiId,
            endpoint: req.path,
            statusCode: res.statusCode,
            responseTime: duration,
            costIncurred,
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Usage logging error:', error);
    }
  });

  next();
};

// IP Whitelist check
const checkIPWhitelist = async (req, res, next) => {
  try {
    if (req.apiKey?.ipWhitelist && req.apiKey.ipWhitelist.length > 0) {
      const clientIP = req.ip;
      if (!req.apiKey.ipWhitelist.includes(clientIP)) {
        return res.status(403).json({ error: 'IP not whitelisted' });
      }
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: 'IP check failed' });
  }
};

module.exports = {
  gatewayRateLimit,
  logUsage,
  checkIPWhitelist,
  redisClient
};
