'use client';
import { useState } from "react";
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardholderName, setCardholderName] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setError("Stripe hasn't loaded yet. Please try again.");
      return;
    }

    if (!cardholderName.trim()) {
      setError("Please enter the cardholder name");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // 1. Create PaymentIntent on the server first
      const response = await fetch('http://localhost:3001/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1000, // $10.00 in cents
          currency: 'usd'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }

      // 2. Confirm the payment with the card details
      const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: cardholderName,
          },
        }
      });

      if (confirmError) {
        setError(confirmError.message || "Payment confirmation failed");
      } else {
        setSuccess(true);
        console.log("Payment succeeded!");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setProcessing(false);
    }
  };

  const handleChange = (event: any) => {
    setError(event.error ? event.error.message : "");
    setCardComplete(event.complete);
  };

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
    hidePostalCode: true,
  };

  if (success) {
    return (
      <div className="p-6 bg-green-50 rounded-lg border border-green-200">
        <h3 className="text-green-800 font-semibold text-lg mb-2">Payment Successful!</h3>
        <p className="text-green-600">Thank you for your purchase.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md w-full mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Details</h2>
        
        {/* Cardholder Name Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
          <div className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
            <i className="fas fa-user text-gray-400 mr-3"></i>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full outline-none"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Card Details */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            {/* Card Number */}
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="flex items-center">
                <i className="fas fa-credit-card text-gray-400 mr-3"></i>
                <div className="flex-grow">
                  <CardElement 
                    options={{
                      ...CARD_ELEMENT_OPTIONS,
                      style: {
                        base: {
                          ...CARD_ELEMENT_OPTIONS.style.base,
                          fontSize: '16px',
                        }
                      }
                    }}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            {/* Expiry and CVC - Visual indicators only */}
            <div className="flex">
              <div className="flex-1 border-r border-gray-200 px-4 py-3">
                <div className="flex items-center text-gray-400">
                  <i className="far fa-calendar-alt mr-3"></i>
                  <span className="text-sm">MM/YY</span>
                </div>
              </div>
              <div className="flex-1 px-4 py-3">
                <div className="flex items-center text-gray-400">
                  <i className="fas fa-lock mr-3"></i>
                  <span className="text-sm">CVC</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-4">
          <i className="fas fa-lock mr-1"></i>
          Your card details are encrypted and processed securely by Stripe
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={!stripe || processing || !cardComplete}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
      >
        {processing ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          `Pay $10.00`
        )}
      </button>
    </form>
  );
};

export default CheckoutForm;