const express = require('express');
const router = express.Router();
const usageController = require('../controllers/usageController');
const { verifyToken } = require('../middleware/auth');

// All routes protected
router.use(verifyToken);

router.get('/', usageController.getUsageLogs);
router.get('/summary', usageController.getUsageSummary);
router.get('/daily-stats', usageController.getDailyStats);

module.exports = router;
