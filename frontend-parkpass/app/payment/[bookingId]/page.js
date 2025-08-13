'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { processPayment } from '@/services/paymentService';
import { updatePaymentStatus } from '@/services/bookingService';

const PaymentPage = ({ params }) => {
  const { bookingId } = params;
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount') || '0';
  
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('gpay');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  
  const processPayment = async (isTestPayment = false) => {
    setLoading(true);

    try {
      // For demo purposes, simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, isTestPayment ? 1000 : 2000));

      // Generate payment ID
      const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Update booking payment status via API
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_URL}/bookings/${bookingId}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentStatus: 'completed',
          paymentId: paymentId,
          paymentMethod: isTestPayment ? 'test' : paymentMethod,
          amount: parseFloat(amount)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      const result = await response.json();

      toast.success(`🎉 Payment successful! Ticket: ${result.data.ticketNo || 'Generated'}`);

      // Redirect to ticket page or success page
      setTimeout(() => {
        router.push(`/ticket/${bookingId}`);
      }, 1500);

    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    // Basic validation based on payment method
    if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        toast.error('Please fill in all card details');
        return;
      }
    } else if (paymentMethod === 'gpay' || paymentMethod === 'phonepe' || paymentMethod === 'paytm') {
      if (!upiId) {
        toast.error('Please enter your UPI ID');
        return;
      }
    }

    await processPayment(false);
  };

  const handleTestPayment = async () => {
    await processPayment(true);
  };
  
  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Add space after every 4 digits
    const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
    
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.substring(0, 19);
  };
  
  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };
  
  const formatExpiryDate = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format as MM/YY
    if (digits.length > 2) {
      return `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
    } else {
      return digits;
    }
  };
  
  const handleExpiryDateChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
  };
  
  return (
    <>
      <Navbar />
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link href={`/booking/${bookingId.replace('booking_', '')}`} className="text-primary-600 hover:underline">
              &larr; Back to Booking
            </Link>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="card">
              <div className="card-body">
                <h1 className="card-title text-2xl mb-6">Complete Your Payment</h1>
                
                <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Booking Reference:</span>
                    <span>{bookingId}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">Total Amount:</span>
                    <span className="font-bold text-lg">₹{parseFloat(amount)}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h2 className="font-medium mb-4">Select Payment Method</h2>

                  {/* UPI Payment Options */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">UPI Payments</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <button
                        className={`p-3 rounded-lg border-2 transition-all ${paymentMethod === 'gpay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setPaymentMethod('gpay')}
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                            <span className="text-white text-xs font-bold">G</span>
                          </div>
                          <span className="text-sm font-medium">Google Pay</span>
                        </div>
                      </button>

                      <button
                        className={`p-3 rounded-lg border-2 transition-all ${paymentMethod === 'phonepe' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setPaymentMethod('phonepe')}
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mb-2">
                            <span className="text-white text-xs font-bold">P</span>
                          </div>
                          <span className="text-sm font-medium">PhonePe</span>
                        </div>
                      </button>

                      <button
                        className={`p-3 rounded-lg border-2 transition-all ${paymentMethod === 'paytm' ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setPaymentMethod('paytm')}
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center mb-2">
                            <span className="text-white text-xs font-bold">P</span>
                          </div>
                          <span className="text-sm font-medium">Paytm</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Card Payment Options */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Card Payments</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        className={`p-3 rounded-lg border-2 transition-all ${paymentMethod === 'credit_card' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setPaymentMethod('credit_card')}
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center mb-2">
                            <span className="text-white text-xs font-bold">💳</span>
                          </div>
                          <span className="text-sm font-medium">Credit Card</span>
                        </div>
                      </button>

                      <button
                        className={`p-3 rounded-lg border-2 transition-all ${paymentMethod === 'debit_card' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setPaymentMethod('debit_card')}
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center mb-2">
                            <span className="text-white text-xs font-bold">💳</span>
                          </div>
                          <span className="text-sm font-medium">Debit Card</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Test Payment Button */}
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-yellow-900 mb-1">🧪 Quick Test Payment</h3>
                      <p className="text-sm text-yellow-700">
                        Skip the form and instantly complete payment for testing
                      </p>
                    </div>
                    <button
                      onClick={handleTestPayment}
                      disabled={loading}
                      className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {loading ? 'Processing...' : 'Test Pay ₹' + parseFloat(amount)}
                    </button>
                  </div>
                </div>

                {/* UPI Payment Form */}
                {(paymentMethod === 'gpay' || paymentMethod === 'phonepe' || paymentMethod === 'paytm') && (
                  <form onSubmit={handlePayment} className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h3 className="font-medium text-blue-900 mb-2">
                        Pay with {paymentMethod === 'gpay' ? 'Google Pay' : paymentMethod === 'phonepe' ? 'PhonePe' : 'Paytm'}
                      </h3>
                      <p className="text-sm text-blue-700">
                        Enter your UPI ID to complete the payment securely.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-2">
                        UPI ID *
                      </label>
                      <input
                        type="text"
                        id="upiId"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="yourname@paytm / yourname@okaxis"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Example: 9876543210@paytm, user@okaxis, name@ybl
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Processing...' : `Pay ₹${parseFloat(amount)} via ${paymentMethod.toUpperCase()}`}
                    </button>
                  </form>
                )}

                {/* Card Payment Form */}
                {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
                  <form onSubmit={handlePayment} className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg mb-4">
                      <h3 className="font-medium text-green-900 mb-2">
                        Pay with {paymentMethod === 'credit_card' ? 'Credit Card' : 'Debit Card'}
                      </h3>
                      <p className="text-sm text-green-700">
                        Your card information is secure and encrypted.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                      <input
                        type="text"
                        id="cardNumber"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength="19"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name *</label>
                      <input
                        type="text"
                        id="cardName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiryDate" className="label">Expiry Date</label>
                        <input
                          type="text"
                          id="expiryDate"
                          className="input"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={handleExpiryDateChange}
                          maxLength="5"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="cvv" className="label">CVV</label>
                        <input
                          type="text"
                          id="cvv"
                          className="input"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                          maxLength="3"
                          required
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Processing...' : `Pay ₹${parseFloat(amount)} with ${paymentMethod === 'credit_card' ? 'Credit Card' : 'Debit Card'}`}
                    </button>

                    <div className="text-center text-sm text-gray-500 mt-4">
                      <p>🔒 This is a demo application. No real payment will be processed.</p>
                      <p>You can enter any test card information.</p>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentPage;