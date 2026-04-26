const APIKeyService = require('../services/APIKeyService');

// Create API Key
exports.createAPIKey = async (req, res) => {
  try {
    const { apiId, name, description, rateLimit, rateLimitWindow, permissions } = req.body;

    if (!apiId || !name) {
      return res.status(400).json({ error: 'API ID and name required' });
    }

    const apiKey = await APIKeyService.createAPIKey(req.userId, apiId, {
      name,
      description,
      rateLimit: rateLimit || 1000,
      rateLimitWindow: rateLimitWindow || 60,
      permissions: permissions || ['read']
    });

    res.status(201).json({
      message: 'API Key created successfully',
      apiKey
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get API Keys
exports.getAPIKeys = async (req, res) => {
  try {
    const { apiId } = req.params;
    const keys = await APIKeyService.getAPIKeys(apiId, req.userId);

    res.json({
      count: keys.length,
      keys
    });
  } catch (error) {
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
  }
};

// Get API Key by ID
exports.getAPIKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const key = await APIKeyService.getAPIKey(keyId, req.userId);

    res.json(key);
  } catch (error) {
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
  }
};

// Update API Key
exports.updateAPIKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const updatedKey = await APIKeyService.updateAPIKey(keyId, req.userId, req.body);

    res.json({
      message: 'API Key updated successfully',
      apiKey: updatedKey
    });
  } catch (error) {
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
  }
};

// Revoke API Key
exports.revokeAPIKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const revokedKey = await APIKeyService.revokeAPIKey(keyId, req.userId);

    res.json({
      message: 'API Key revoked successfully',
      apiKey: revokedKey
    });
  } catch (error) {
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
  }
};

// Rotate API Key
exports.rotateAPIKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const newKey = await APIKeyService.rotateAPIKey(keyId, req.userId);

    res.json({
      message: 'API Key rotated successfully',
      apiKey: newKey
    });
  } catch (error) {
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
  }
};

// Delete API Key
exports.deleteAPIKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const result = await APIKeyService.deleteAPIKey(keyId, req.userId);

    res.json(result);
  } catch (error) {
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
  }
};
