// index.js
require('dotenv').config()
const express = require('express');
const Stripe = require('stripe');

const cors = require('cors'); // Make sure cors is installed
const PORT = process.env.PORT || 3001; 
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Your existing health check route
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Your existing users route
app.get('/api/users', (req, res) => {
  // Your existing user logic here
   debugger; // Execution will pause here
  console.log('This is a breakpoint');
  res.json({ users: [] }); // Example response
});

// ✅ ADD STRIPE PAYMENT ENDPOINT
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    // Validate amount
    if (!amount || amount < 50) {
      return res.status(400).json({ error: 'Invalid amount. Minimum is 50 cents.' });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // amount in cents (e.g., $10.00 = 1000)
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`👥 API endpoint at http://localhost:${PORT}/api/users`);
  console.log(`💳 NEW: Payment endpoint at http://localhost:${PORT}/create-payment-intent`);
});