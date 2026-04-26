const APIKey = require('../models/APIKey');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');

class APIKeyService {
  // Create API Key
  static async createAPIKey(userId, apiId, keyData) {
    const key = APIKey.generateKey();
    
    const apiKey = new APIKey({
      userId,
      apiId,
      key,
      ...keyData
    });

    await apiKey.save();
    
    // Log audit
    await AuditLog.create({
      userId,
      action: 'create',
      resourceType: 'apikey',
      resourceId: apiKey._id,
      description: `Created API key: ${keyData.name}`
    });

    return apiKey;
  }

  // Get API Key
  static async getAPIKey(keyId, userId) {
    const apiKey = await APIKey.findById(keyId);
    
    if (!apiKey) {
      throw new Error('API Key not found');
    }

    if (apiKey.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    return apiKey;
  }

  // List API Keys for API
  static async getAPIKeys(apiId, userId) {
    const API = require('../models/API');
    const api = await API.findById(apiId);

    if (!api) {
      throw new Error('API not found');
    }

    if (api.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    return await APIKey.find({ apiId }).sort({ createdAt: -1 });
  }

  // Revoke API Key
  static async revokeAPIKey(keyId, userId) {
    const apiKey = await APIKey.findById(keyId);
    
    if (!apiKey) {
      throw new Error('API Key not found');
    }

    if (apiKey.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    apiKey.isActive = false;
    await apiKey.save();

    // Log audit
    await AuditLog.create({
      userId,
      action: 'update',
      resourceType: 'apikey',
      resourceId: keyId,
      description: 'Revoked API key'
    });

    return apiKey;
  }

  // Rotate API Key
  static async rotateAPIKey(keyId, userId) {
    const oldKey = await APIKey.findById(keyId);
    
    if (!oldKey) {
      throw new Error('API Key not found');
    }

    if (oldKey.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    const newKey = APIKey.generateKey();
    
    const rotatedKey = new APIKey({
      userId: oldKey.userId,
      apiId: oldKey.apiId,
      key: newKey,
      name: `${oldKey.name} (rotated)`,
      rotatedFrom: oldKey._id,
      description: oldKey.description
    });

    await rotatedKey.save();

    // Mark old key as rotated
    oldKey.rotatedTo = rotatedKey._id;
    oldKey.isActive = false;
    await oldKey.save();

    // Log audit
    await AuditLog.create({
      userId,
      action: 'key_rotation',
      resourceType: 'apikey',
      resourceId: keyId,
      description: 'Rotated API key'
    });

    return rotatedKey;
  }

  // Update API Key
  static async updateAPIKey(keyId, userId, updateData) {
    const apiKey = await APIKey.findById(keyId);
    
    if (!apiKey) {
      throw new Error('API Key not found');
    }

    if (apiKey.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    const allowedFields = ['name', 'description', 'rateLimit', 'rateLimitWindow', 'permissions', 'ipWhitelist', 'expiresAt'];
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        apiKey[field] = updateData[field];
      }
    });

    await apiKey.save();
    return apiKey;
  }

  // Delete API Key
  static async deleteAPIKey(keyId, userId) {
    const apiKey = await APIKey.findById(keyId);
    
    if (!apiKey) {
      throw new Error('API Key not found');
    }

    if (apiKey.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    await APIKey.findByIdAndDelete(keyId);

    // Log audit
    await AuditLog.create({
      userId,
      action: 'delete',
      resourceType: 'apikey',
      resourceId: keyId,
      description: 'Deleted API key'
    });

    return { message: 'API Key deleted' };
  }
}

module.exports = APIKeyService;
