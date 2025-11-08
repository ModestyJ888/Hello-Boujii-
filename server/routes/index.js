const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const membershipRoutes = require('./membership');
const paymentRoutes = require('./payments');
const socialRoutes = require('./social');
const contentRoutes = require('./content');

// API version and info
router.get('/', (req, res) => {
  res.json({
    message: 'Hello Boujii Membership Platform API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      auth: '/api/auth',
      membership: '/api/membership',
      payments: '/api/payments',
      social: '/api/social',
      content: '/api/content'
    },
    documentation: 'https://docs.helloboujii.com/api',
    timestamp: new Date().toISOString()
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/membership', membershipRoutes);
router.use('/payments', paymentRoutes);
router.use('/social', socialRoutes);
router.use('/content', contentRoutes);

module.exports = router;
