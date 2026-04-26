const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Webhook = require('../models/Webhook');

// All routes protected
router.use(verifyToken);

// Create webhook
router.post('/', async (req, res) => {
  try {
    const { url, events, description } = req.body;

    if (!url || !events) {
      return res.status(400).json({ error: 'URL and events required' });
    }

    const secret = Webhook.generateSecret();
    const webhook = new Webhook({
      userId: req.userId,
      url,
      events,
      description,
      secret
    });

    await webhook.save();
    res.status(201).json({
      message: 'Webhook created',
      webhook
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user webhooks
router.get('/', async (req, res) => {
  try {
    const webhooks = await Webhook.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ count: webhooks.length, webhooks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update webhook
router.put('/:webhookId', async (req, res) => {
  try {
    const webhook = await Webhook.findById(req.params.webhookId);

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    if (webhook.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    Object.assign(webhook, req.body);
    await webhook.save();

    res.json({ message: 'Webhook updated', webhook });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete webhook
router.delete('/:webhookId', async (req, res) => {
  try {
    const webhook = await Webhook.findById(req.params.webhookId);

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    if (webhook.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Webhook.findByIdAndDelete(req.params.webhookId);
    res.json({ message: 'Webhook deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
