const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const { verifyToken } = require('../middleware/auth');

// All routes protected
router.use(verifyToken);

router.post('/', apiKeyController.createAPIKey);
router.get('/api/:apiId', apiKeyController.getAPIKeys);
router.get('/:keyId', apiKeyController.getAPIKey);
router.put('/:keyId', apiKeyController.updateAPIKey);
router.post('/:keyId/revoke', apiKeyController.revokeAPIKey);
router.post('/:keyId/rotate', apiKeyController.rotateAPIKey);
router.delete('/:keyId', apiKeyController.deleteAPIKey);

module.exports = router;
