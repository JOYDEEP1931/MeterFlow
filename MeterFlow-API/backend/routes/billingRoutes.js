const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { verifyToken } = require('../middleware/auth');

// All routes protected
router.use(verifyToken);

router.post('/generate-invoice', billingController.generateInvoice);
router.get('/history', billingController.getBillingHistory);
router.get('/summary', billingController.getBillingSummary);
router.get('/:invoiceId', billingController.getInvoice);
router.post('/:invoiceId/mark-paid', billingController.markAsPaid);

module.exports = router;
