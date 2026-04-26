const API = require('../models/API');
const APIKey = require('../models/APIKey');

class APIService {
  // Create API
  static async createAPI(userId, apiData) {
    const api = new API({
      userId,
      ...apiData
    });

    await api.save();
    return api;
  }

  // Get all APIs for user
  static async getUserAPIs(userId) {
    return await API.find({ userId }).sort({ createdAt: -1 });
  }

  // Get API by ID
  static async getAPIById(apiId, userId) {
    const api = await API.findById(apiId);
    
    if (!api) {
      throw new Error('API not found');
    }

    if (api.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    return api;
  }

  // Update API
  static async updateAPI(apiId, userId, updateData) {
    const api = await API.findById(apiId);
    
    if (!api) {
      throw new Error('API not found');
    }

    if (api.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    Object.assign(api, updateData);
    await api.save();
    return api;
  }

  // Delete API
  static async deleteAPI(apiId, userId) {
    const api = await API.findById(apiId);
    
    if (!api) {
      throw new Error('API not found');
    }

    if (api.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    // Delete associated API keys
    await APIKey.deleteMany({ apiId });
    
    await API.findByIdAndDelete(apiId);
    return { message: 'API deleted successfully' };
  }

  // Get API statistics
  static async getAPIStats(apiId, userId) {
    const api = await API.findById(apiId);
    
    if (!api) {
      throw new Error('API not found');
    }

    if (api.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    const UsageLog = require('../models/UsageLog');
    const totalUsage = await UsageLog.countDocuments({ apiId });
    const totalCost = (await UsageLog.aggregate([
      { $match: { apiId } },
      { $group: { _id: null, totalCost: { $sum: '$costIncurred' } } }
    ]))[0]?.totalCost || 0;

    return {
      apiId,
      totalRequests: api.totalRequests,
      totalRevenue: api.totalRevenue,
      averageLatency: api.averageLatency,
      errorRate: api.errorRate,
      totalUsageLogs: totalUsage,
      totalCost
    };
  }
}

module.exports = APIService;
