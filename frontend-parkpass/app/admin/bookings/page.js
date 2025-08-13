'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import { formatINR } from '@/utils/currency';


const BookingsPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

        // Fetch bookings
        fetchBookings(token);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/admin');
      }
    };
    
    checkAuth();
  }, [router]);

  const fetchBookings = async (token) => {
    try {
      setIsLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await axios.get(`${API_URL}/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings. Please try again.');
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

  const handleBackToDashboard = () => {
    router.push('/admin/dashboard');
  };

  const handleViewBooking = (bookingId) => {
    router.push(`/admin/bookings/${bookingId}`);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      const response = await axios.put(
        `${API_URL}/bookings/${bookingId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Booking cancelled successfully');
        // Refresh bookings list
        fetchBookings(token);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking. Please try again.');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency in INR
  const formatCurrency = (amount) => {
    return formatINR(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-bounce"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-float"></div>
      </div>

      <header className="relative z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <span className="text-4xl">🎫</span>
            <span>Booking Management</span>
          </h1>
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

      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={handleBackToDashboard}
            className="px-6 py-3 bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 text-white hover:bg-white/30 transition-all duration-300 flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
          <div className="px-6 py-8">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center space-x-3">
              <span className="text-3xl">📋</span>
              <span>All Bookings</span>
            </h3>
            <p className="text-white/80">Complete booking management for ParkPass</p>
          </div>
          <div className="border-t border-white/20">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20">
                <thead className="bg-white/5">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Visitor
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Park
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                {bookings.length > 0 ? (
                  bookings.map((booking, index) => (
                    <tr key={booking._id} className="hover:bg-white/5 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{booking.bookingId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-medium">{booking.visitorName}</div>
                        <div className="text-sm text-white/60">{booking.visitorEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{booking.park?.name || 'Unknown Park'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white/80">{formatDate(booking.visitDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full backdrop-blur-lg border ${
                          booking.status === 'confirmed'
                            ? 'bg-green-500/20 text-green-300 border-green-300/20'
                            : booking.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-300/20'
                            : 'bg-red-500/20 text-red-300 border-red-300/20'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleViewBooking(booking._id)}
                            className="px-3 py-1 bg-blue-500/20 backdrop-blur-lg rounded-lg border border-blue-300/20 text-blue-300 hover:bg-blue-500/30 transition-all duration-200 text-xs font-medium"
                          >
                            👁️ View
                          </button>
                          {booking.status !== 'cancelled' && (
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="px-3 py-1 bg-red-500/20 backdrop-blur-lg rounded-lg border border-red-300/20 text-red-300 hover:bg-red-500/30 transition-all duration-200 text-xs font-medium"
                            >
                              ❌ Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-white/60">
                        <div className="text-6xl mb-4">📋</div>
                        <div className="text-lg font-medium mb-2">No bookings found</div>
                        <div className="text-sm">Bookings will appear here once visitors make reservations</div>
                      </div>
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Loading bookings...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingsPage;