const APIService = require('../services/APIService');

// Create API
exports.createAPI = async (req, res) => {
  try {
    const { name, description, baseUrl, endpoint, pricingModel, pricePerRequest } = req.body;

    if (!name || !baseUrl) {
      return res.status(400).json({ error: 'Name and baseUrl required' });
    }

    const api = await APIService.createAPI(req.userId, {
      name,
      description,
      baseUrl,
      endpoint,
      pricingModel,
      pricePerRequest
    });

    res.status(201).json({
      message: 'API created successfully',
      api
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all APIs
exports.getAPIs = async (req, res) => {
  try {
    const apis = await APIService.getUserAPIs(req.userId);
    res.json({
      count: apis.length,
      apis
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get API by ID
exports.getAPIById = async (req, res) => {
  try {
    const api = await APIService.getAPIById(req.params.apiId, req.userId);
    res.json(api);
  } catch (error) {
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
  }
};

// Update API
exports.updateAPI = async (req, res) => {
  try {
    const api = await APIService.updateAPI(req.params.apiId, req.userId, req.body);
    res.json({
      message: 'API updated successfully',
      api
    });
  } catch (error) {
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
  }
};

// Delete API
exports.deleteAPI = async (req, res) => {
  try {
    const result = await APIService.deleteAPI(req.params.apiId, req.userId);
    res.json(result);
  } catch (error) {
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
  }
};

// Get API Statistics
exports.getAPIStats = async (req, res) => {
  try {
    const stats = await APIService.getAPIStats(req.params.apiId, req.userId);
    res.json(stats);
  } catch (error) {
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
  }
};
