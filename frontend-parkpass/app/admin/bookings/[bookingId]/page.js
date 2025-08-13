'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const BookingDetailsPage = ({ params }) => {
  const { bookingId } = params;
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in and has the right role
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        toast.error('You must be logged in to access this page');
        router.push('/admin');
        return;
      }
      
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Check if user has the right role
        if (parsedUser.role !== 'super-admin') {
          toast.error('You do not have permission to access this page');
          router.push('/admin');
          return;
        }

        // Fetch booking details
        fetchBookingDetails(token);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/admin');
      }
    };
    
    checkAuth();
  }, [router, bookingId]);

  const fetchBookingDetails = async (token) => {
    try {
      setIsLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await axios.get(`${API_URL}/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setBooking(response.data.data);
      } else {
        toast.error('Booking not found');
        router.push('/admin/bookings');
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to load booking details. Please try again.');
      router.push('/admin/bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/admin');
  };

  const handleBackToBookings = () => {
    router.push('/admin/bookings');
  };

  const handleViewTicket = () => {
    if (booking) {
      router.push(`/ticket/${booking._id}`);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      const response = await axios.put(
        `${API_URL}/bookings/${booking._id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Booking cancelled successfully');
        setBooking({ ...booking, status: 'cancelled' });
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
          <button
            onClick={handleBackToBookings}
            className="px-6 py-3 bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 hover:bg-white/30 transition-all duration-300"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToBookings}
              className="px-4 py-2 bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 text-white hover:bg-white/30 transition-all duration-300 flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back to Bookings</span>
            </button>
            <h1 className="text-2xl font-bold text-white">Booking Details</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-white/80">
              Welcome, {user?.name || 'Admin'}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 backdrop-blur-lg rounded-xl border border-red-300/20 text-white hover:bg-red-500/30 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Booking Information Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Booking #{booking.bookingId}</h2>
                <p className="text-white/80">Complete booking information</p>
              </div>
              <div className="text-right">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  booking.status === 'confirmed' 
                    ? 'bg-green-500/20 text-green-300 border border-green-300/20' 
                    : booking.status === 'pending' 
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-300/20' 
                    : 'bg-red-500/20 text-red-300 border border-red-300/20'
                }`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Visitor Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">👤 Visitor Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-white/60 text-sm">Name</p>
                    <p className="text-white font-medium">{booking.visitorName}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Email</p>
                    <p className="text-white font-medium">{booking.visitorEmail}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Phone</p>
                    <p className="text-white font-medium">{booking.visitorPhone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">🎫 Booking Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-white/60 text-sm">Park</p>
                    <p className="text-white font-medium">{booking.park?.name || 'Unknown Park'}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">District</p>
                    <p className="text-white font-medium">{booking.park?.district?.name || 'Unknown District'}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Visit Date</p>
                    <p className="text-white font-medium">{formatDate(booking.visitDate)}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Booking Date</p>
                    <p className="text-white font-medium">{formatDate(booking.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Information */}
            <div className="mt-8 pt-8 border-t border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">🎟️ Ticket Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-white/60 text-sm">Adults</p>
                  <p className="text-white font-medium text-2xl">{booking.adults}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Children</p>
                  <p className="text-white font-medium text-2xl">{booking.children}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Total Amount</p>
                  <p className="text-white font-medium text-2xl">{formatCurrency(booking.totalAmount)}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {booking.paymentStatus && (
              <div className="mt-8 pt-8 border-t border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">💳 Payment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-white/60 text-sm">Payment Status</p>
                    <p className={`font-medium ${
                      booking.paymentStatus === 'completed' ? 'text-green-300' : 
                      booking.paymentStatus === 'pending' ? 'text-yellow-300' : 'text-red-300'
                    }`}>
                      {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                    </p>
                  </div>
                  {booking.paymentId && (
                    <div>
                      <p className="text-white/60 text-sm">Payment ID</p>
                      <p className="text-white font-medium font-mono text-sm">{booking.paymentId}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 pt-8 border-t border-white/20 flex flex-wrap gap-4">
              <button
                onClick={handleViewTicket}
                className="px-6 py-3 bg-blue-500/20 backdrop-blur-lg rounded-xl border border-blue-300/20 text-blue-300 hover:bg-blue-500/30 transition-all duration-300 flex items-center space-x-2"
              >
                <span>🎫</span>
                <span>View Ticket</span>
              </button>
              
              {booking.status !== 'cancelled' && (
                <button
                  onClick={handleCancelBooking}
                  className="px-6 py-3 bg-red-500/20 backdrop-blur-lg rounded-xl border border-red-300/20 text-red-300 hover:bg-red-500/30 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>❌</span>
                  <span>Cancel Booking</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingDetailsPage;
