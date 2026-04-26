const Billing = require('../models/Billing');
const UsageLog = require('../models/UsageLog');
const User = require('../models/User');

class BillingService {
  // Generate invoice
  static async generateInvoice(userId, periodStart, periodEnd) {
    const usageLogs = await UsageLog.find({
      userId,
      timestamp: { $gte: periodStart, $lte: periodEnd }
    });

    // Group by API
    const usageByAPI = {};
    let subtotal = 0;

    for (const log of usageLogs) {
      if (!usageByAPI[log.apiId]) {
        usageByAPI[log.apiId] = { requests: 0, cost: 0 };
      }
      usageByAPI[log.apiId].requests++;
      usageByAPI[log.apiId].cost += log.costIncurred;
      subtotal += log.costIncurred;
    }

    // Convert to array
    const usageBreakdown = [];
    for (const [apiId, usage] of Object.entries(usageByAPI)) {
      const API = require('../models/API');
      const api = await API.findById(apiId);
      usageBreakdown.push({
        apiId,
        apiName: api?.name || 'Unknown',
        requests: usage.requests,
        cost: usage.cost
      });
    }

    // Calculate tax (10%)
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;

    const invoiceNumber = `INV-${Date.now()}`;
    const dueDate = new Date(periodEnd);
    dueDate.setDate(dueDate.getDate() + 30);

    const billing = new Billing({
      userId,
      invoiceNumber,
      periodStart,
      periodEnd,
      totalRequests: usageLogs.length,
      usageBreakdown,
      subtotal,
      tax,
      total,
      dueDate,
      status: 'pending'
    });

    await billing.save();
    return billing;
  }

  // Get user billing history
  static async getBillingHistory(userId, limit = 10, skip = 0) {
    const billings = await Billing.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Billing.countDocuments({ userId });

    return { billings, total };
  }

  // Get invoice details
  static async getInvoice(invoiceId, userId) {
    const billing = await Billing.findById(invoiceId);

    if (!billing) {
      throw new Error('Invoice not found');
    }

    if (billing.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    return billing;
  }

  // Mark invoice as paid
  static async markAsPaid(invoiceId, userId, paymentMethod, transactionId) {
    const billing = await Billing.findById(invoiceId);

    if (!billing) {
      throw new Error('Invoice not found');
    }

    if (billing.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    billing.status = 'paid';
    billing.paymentStatus = 'paid';
    billing.paymentMethod = paymentMethod;
    billing.transactionId = transactionId;
    billing.paidAt = new Date();

    await billing.save();
    return billing;
  }

  // Get billing summary
  static async getBillingSummary(userId) {
    const user = await User.findById(userId);
    const billings = await Billing.find({ userId });

    const totalRevenue = billings.reduce((sum, b) => sum + b.total, 0);
    const paidAmount = billings
      .filter(b => b.status === 'paid')
      .reduce((sum, b) => sum + b.total, 0);
    const pendingAmount = billings
      .filter(b => b.status === 'pending')
      .reduce((sum, b) => sum + b.total, 0);

    return {
      totalRevenue,
      paidAmount,
      pendingAmount,
      invoiceCount: billings.length,
      paidInvoices: billings.filter(b => b.status === 'paid').length,
      pendingInvoices: billings.filter(b => b.status === 'pending').length,
      subscriptionPlan: user.subscriptionPlan
    };
  }
}

module.exports = BillingService;
