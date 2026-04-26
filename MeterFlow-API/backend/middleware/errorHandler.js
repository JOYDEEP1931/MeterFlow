const AuditLog = require('../models/AuditLog');

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date()
  });
};

// Request logging middleware
const requestLogger = async (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    
    if (req.userId) {
      try {
        await AuditLog.create({
          userId: req.userId,
          action: req.method.toLowerCase(),
          resourceType: 'api',
          description: `${req.method} ${req.path}`,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          status: res.statusCode < 400 ? 'success' : 'failure',
          metadata: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration
          }
        });
      } catch (error) {
        console.error('Failed to log request:', error);
      }
    }
  });

  next();
};

// Validate request body
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }

    req.validatedBody = value;
    next();
  };
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  requestLogger,
  validateRequest,
  asyncHandler
};
