const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { verifyToken } = require('../middleware/auth');

// All routes protected
router.use(verifyToken);

router.post('/', apiController.createAPI);
router.get('/', apiController.getAPIs);
router.get('/:apiId', apiController.getAPIById);
router.put('/:apiId', apiController.updateAPI);
router.delete('/:apiId', apiController.deleteAPI);
router.get('/:apiId/stats', apiController.getAPIStats);

module.exports = router;
