const PaymentService = require('../services/PaymentService');

// Create Payment Intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, billingId } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount required' });
    }

    const result = await PaymentService.createPaymentIntent(req.userId, amount, billingId);

    res.status(201).json({
      message: 'Payment intent created',
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Confirm Payment
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID required' });
    }

    const payment = await PaymentService.confirmPayment(paymentIntentId, req.userId);

    res.json({
      message: 'Payment confirmed',
      payment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Payment History
exports.getPaymentHistory = async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query;
    const result = await PaymentService.getPaymentHistory(req.userId, parseInt(limit), parseInt(skip));

    res.json({
      total: result.total,
      count: result.payments.length,
      payments: result.payments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Payment Details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await PaymentService.getPaymentDetails(paymentId, req.userId);

    res.json(payment);
  } catch (error) {
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
  }
};

// Process Refund
exports.processRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await PaymentService.processRefund(paymentId, req.userId, reason);

    res.json({
      message: 'Refund processed successfully',
      payment
    });
  } catch (error) {
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
  }
};

// Create Subscription
exports.createSubscription = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan) {
      return res.status(400).json({ error: 'Plan required' });
    }

    const result = await PaymentService.createSubscription(req.userId, plan);

    res.status(201).json({
      message: 'Subscription created',
      ...result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
