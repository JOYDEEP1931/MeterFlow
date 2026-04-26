const BillingService = require('../services/BillingService');

// Generate Invoice
exports.generateInvoice = async (req, res) => {
  try {
    const { periodStart, periodEnd } = req.body;

    if (!periodStart || !periodEnd) {
      return res.status(400).json({ error: 'Period start and end required' });
    }

    const invoice = await BillingService.generateInvoice(
      req.userId,
      new Date(periodStart),
      new Date(periodEnd)
    );

    res.status(201).json({
      message: 'Invoice generated successfully',
      invoice
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Billing History
exports.getBillingHistory = async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query;
    const result = await BillingService.getBillingHistory(req.userId, parseInt(limit), parseInt(skip));

    res.json({
      total: result.total,
      count: result.billings.length,
      billings: result.billings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Invoice Details
exports.getInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await BillingService.getInvoice(invoiceId, req.userId);

    res.json(invoice);
  } catch (error) {
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
  }
};

// Mark as Paid
exports.markAsPaid = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { paymentMethod, transactionId } = req.body;

    const invoice = await BillingService.markAsPaid(invoiceId, req.userId, paymentMethod, transactionId);

    res.json({
      message: 'Invoice marked as paid',
      invoice
    });
  } catch (error) {
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
  }
};

// Get Billing Summary
exports.getBillingSummary = async (req, res) => {
  try {
    const summary = await BillingService.getBillingSummary(req.userId);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
