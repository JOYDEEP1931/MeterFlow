const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { verifyToken } = require('../middleware/auth');

// All routes protected
router.use(verifyToken);

router.get('/', auditController.getAuditLogs);
router.get('/summary', auditController.getActivitySummary);
router.get('/:logId', auditController.getAuditLogDetails);

module.exports = router;
