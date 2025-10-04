require('dotenv').config();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Use auth routes
app.use(authRoutes);

// Create payment intent endpoint
app.post('/create-payment-intent', async (req, res) => {
  try {
    // Check if user is authenticated (if you implement session auth)
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { amount, currency = 'usd' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Stripe payment server is running!' });
});

// Use port 3001 instead of 3000
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`💳 Stripe Server running on http://localhost:${PORT}`);
  console.log(`✅ Payment endpoint: http://localhost:${PORT}/create-payment-intent`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});