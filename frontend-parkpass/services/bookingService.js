import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

/**
 * Create a new booking
 * @param {object} bookingData - The booking data
 * @returns {Promise} - The created booking
 */
export const createBooking = async (bookingData) => {
  try {
    const response = await axios.post(`${API_URL}/bookings`, bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to create booking' };
  }
};

/**
 * Get a booking by ID
 * @param {string} bookingId - The ID of the booking
 * @returns {Promise} - The booking
 */
export const getBooking = async (bookingId) => {
  try {
    const response = await axios.get(`${API_URL}/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get booking' };
  }
};

/**
 * Update booking payment status
 * @param {string} bookingId - The ID of the booking
 * @param {string} paymentStatus - The payment status
 * @param {string} paymentId - The payment ID
 * @returns {Promise} - The updated booking
 */
export const updatePaymentStatus = async (bookingId, paymentStatus, paymentId) => {
  try {
    const response = await axios.put(`${API_URL}/bookings/${bookingId}/payment`, {
      paymentStatus,
      paymentId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to update payment status' };
  }
};

/**
 * Generate a ticket for a booking
 * @param {string} bookingId - The ID of the booking
 * @returns {Promise} - The ticket data or a Blob for PDF
 */
export const generateTicket = async (bookingId) => {
  try {
    const response = await axios.get(`${API_URL}/bookings/${bookingId}/ticket`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to generate ticket' };
  }
};

/**
 * Mark a ticket as printed
 * @param {string} bookingId - The ID of the booking
 * @returns {Promise} - The updated booking
 */
export const markTicketAsPrinted = async (bookingId) => {
  try {
    const response = await axios.put(`${API_URL}/bookings/${bookingId}/print`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to mark ticket as printed' };
  }
};

/**
 * Get a ticket by ticket number
 * @param {string} ticketNo - The ticket number
 * @returns {Promise} - The ticket
 */
export const getTicketByNumber = async (ticketNo) => {
  try {
    const response = await axios.get(`${API_URL}/bookings/ticket/${ticketNo}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to get ticket' };
  }
};