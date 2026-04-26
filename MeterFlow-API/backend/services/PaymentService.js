const Payment = require('../models/Payment');
const Billing = require('../models/Billing');
const User = require('../models/User');
let stripe;
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} catch (e) {
  console.log('⚠️ Stripe not configured - using mock mode');
}

class PaymentService {
  // Create payment intent (Stripe)
  static async createPaymentIntent(userId, amount, billingId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          userId: userId.toString(),
          billingId: billingId?.toString() || ''
        }
      });

      const payment = new Payment({
        userId,
        billingId,
        amount,
        paymentMethod: 'stripe',
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending'
      });

      await payment.save();
      return {
        payment,
        clientSecret: paymentIntent.client_secret
      };
    } catch (error) {
      throw new Error(`Payment intent creation failed: ${error.message}`);
    }
  }

  // Confirm payment
  static async confirmPayment(paymentIntentId, userId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });

        if (!payment) {
          throw new Error('Payment record not found');
        }

        payment.status = 'completed';
        await payment.save();

        // Update billing status
        if (payment.billingId) {
          await Billing.findByIdAndUpdate(
            payment.billingId,
            {
              status: 'paid',
              paymentStatus: 'paid',
              transactionId: paymentIntentId,
              paidAt: new Date()
            }
          );
        }

        return payment;
      } else {
        throw new Error('Payment not confirmed');
      }
    } catch (error) {
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  }

  // Get payment history
  static async getPaymentHistory(userId, limit = 10, skip = 0) {
    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Payment.countDocuments({ userId });

    return { payments, total };
  }

  // Process refund
  static async processRefund(paymentId, userId, reason) {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    try {
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        reason: reason || 'requested_by_customer'
      });

      payment.status = 'refunded';
      payment.refundedAmount = payment.amount;
      payment.refundReason = reason;
      payment.refundedAt = new Date();

      await payment.save();

      return payment;
    } catch (error) {
      throw new Error(`Refund processing failed: ${error.message}`);
    }
  }

  // Get payment details
  static async getPaymentDetails(paymentId, userId) {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    return payment;
  }

  // Create subscription payment
  static async createSubscription(userId, plan) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const planPrices = {
      free: 0,
      pro: 2999, // $29.99 per month
      enterprise: 9999 // $99.99 per month
    };

    const amount = planPrices[plan] || 0;

    if (amount === 0) {
      user.subscriptionPlan = plan;
      await user.save();
      return { plan, message: 'Free plan activated' };
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        metadata: {
          userId: userId.toString(),
          type: 'subscription',
          plan
        }
      });

      const payment = new Payment({
        userId,
        amount: amount / 100,
        paymentMethod: 'stripe',
        stripePaymentIntentId: paymentIntent.id,
        description: `Subscription plan: ${plan}`,
        status: 'pending'
      });

      await payment.save();

      return {
        payment,
        clientSecret: paymentIntent.client_secret,
        plan
      };
    } catch (error) {
      throw new Error(`Subscription creation failed: ${error.message}`);
    }
  }
}

module.exports = PaymentService;
