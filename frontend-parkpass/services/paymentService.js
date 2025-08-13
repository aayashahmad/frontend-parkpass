import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

/**
 * Process a payment for a booking
 * @param {string} bookingId - The ID of the booking
 * @param {string} paymentMethod - The payment method (e.g., 'credit_card')
 * @param {object} cardDetails - Credit card details
 * @returns {Promise} - The payment result
 */
export const processPayment = async (bookingId, paymentMethod, cardDetails) => {
  try {
    const response = await axios.post(`${API_URL}/payments/process`, {
      bookingId,
      paymentMethod,
      cardDetails
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Payment processing failed' };
  }
};

/**
 * Get the payment status for a booking
 * @param {string} bookingId - The ID of the booking
 * @returns {Promise} - The payment status
 */
export const getPaymentStatus = async (bookingId) => {
  try {
    const response = await axios.get(`${API_URL}/payments/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get payment status' };
  }
};

/**
 * Get available payment methods
 * @returns {Promise} - The available payment methods
 */
export const getPaymentMethods = async () => {
  try {
    const response = await axios.get(`${API_URL}/payments/methods`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get payment methods' };
  }
};