'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const ParkAdminDashboardPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [parkDetails, setParkDetails] = useState(null);
  const [parkStats, setParkStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
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

        if (parsedUser.role !== 'park-admin') {
          toast.error('You do not have permission to access this page');
          router.push('/admin');
          return;
        }

        // Fetch park details from API
        await fetchParkDetails(token, parsedUser);

      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.clear();
        router.push('/admin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);
  
  // Fetch park details from API
  const fetchParkDetails = async (token, user) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      // Assuming the park admin is associated with a specific park
      // and the user object contains the parkId
      if (!user.parkId) {
        console.error('No park associated with this admin');
        return;
      }
      
      // Fetch park details
      const response = await fetch(`${API_URL}/parks/${user.parkId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setParkDetails({
          name: data.data.name,
          location: data.data.location,
          capacity: data.data.capacity,
          dailyVisitors: data.data.dailyVisitors || 320, // Fallback if not available
          openingHours: data.data.openingHours
        });
      } else {
        console.error('Failed to fetch park details:', data.message);
        toast.error('Failed to load park details');
      }
      
      // Fetch park stats
      await fetchParkStats(token, user.parkId);
      
    } catch (error) {
      console.error('Error fetching park details:', error);
      toast.error('Failed to load park details');
    }
  };
  
  // Fetch park statistics (bookings, revenue, etc.)
  const fetchParkStats = async (token, parkId) => {
    setIsStatsLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      // Fetch park stats for today's bookings and revenue
      const statsResponse = await fetch(`${API_URL}/parks/${parkId}/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const statsData = await statsResponse.json();
      
      // Fetch recent bookings from the bookings API
      const bookingsResponse = await fetch(`${API_URL}/bookings?parkId=${parkId}&limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const bookingsData = await bookingsResponse.json();
      
      if (statsData.success && bookingsData.success) {
        // Combine the data from both endpoints
        setParkStats({
          ...statsData.data,
          recentBookings: bookingsData.data || []
        });
      } else if (statsData.success) {
        // If only stats succeeded but bookings failed
        setParkStats({
          ...statsData.data,
          recentBookings: []
        });
        console.error('Failed to fetch recent bookings:', bookingsData?.message);
      } else if (bookingsData.success) {
        // If only bookings succeeded but stats failed
        setParkStats({
          todayBookings: '0',
          todayRevenue: '0',
          recentBookings: bookingsData.data || []
        });
        console.error('Failed to fetch park stats:', statsData?.message);
      } else {
        // If both failed
        console.error('Failed to fetch park stats:', statsData?.message);
        console.error('Failed to fetch recent bookings:', bookingsData?.message);
        // Use fallback data if API fails
        setParkStats({
          todayBookings: '0',
          todayRevenue: '0',
          recentBookings: []
        });
      }
    } catch (error) {
      console.error('Error fetching park stats:', error);
      // Use fallback data if API fails
      setParkStats({
        todayBookings: '0',
        todayRevenue: '0',
        recentBookings: []
      });
    } finally {
      setIsStatsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logged out successfully');
    router.push('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Park Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {parkDetails && (
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900">{parkDetails.name}</h3>
              <p className="text-sm text-gray-500">{parkDetails.location}</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Capacity</dt>
                  <dd className="text-sm text-gray-900">{parkDetails.capacity} visitors</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Today's Visitors</dt>
                  <dd className="text-sm text-gray-900">{parkDetails.dailyVisitors}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Opening Hours</dt>
                  <dd className="text-sm text-gray-900">{parkDetails.openingHours}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard 
            title="Today's Bookings" 
            value={parkStats?.todayBookings || '0'} 
            linkText="View all bookings" 
            isLoading={isStatsLoading}
          />
          <DashboardCard 
            title="Revenue (Today)" 
            value={`₹${parkStats?.todayRevenue || '0'}`} 
            linkText="View financial reports" 
            isLoading={isStatsLoading}
          />
        </div>

        {/* Check Ticket Section */}
        <CheckTicketSection />

        {/* Recent Bookings */}
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
            <p className="text-sm text-gray-500">Latest 5 bookings for your park.</p>
          </div>
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isStatsLoading ? (
                  // Loading state
                  Array(5).fill(0).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : parkStats?.recentBookings && parkStats.recentBookings.length > 0 ? (
                  // Actual data
                  parkStats.recentBookings.map((booking) => (
                    <tr key={booking.id || booking._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{booking.bookingId || booking.id || booking._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.visitorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.date || new Date(booking.visitDate || booking.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'used' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{booking.amount || booking.totalAmount || '0'}
                      </td>
                    </tr>
                  ))
                ) : (
                  // No data
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No recent bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

// Dashboard Card Component
const DashboardCard = ({ title, value, linkText, isLoading }) => (
  <div className="bg-white shadow rounded-lg p-6">
    <div className="flex items-center justify-between">
      <div>
        <dt className="text-sm font-medium text-gray-500">{title}</dt>
        {isLoading ? (
          <dd className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></dd>
        ) : (
          <dd className="text-2xl font-semibold text-gray-900">{value}</dd>
        )}
      </div>
      <svg
        className={`w-8 h-8 ${isLoading ? 'text-gray-300' : 'text-primary-500'}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div className="mt-4 text-sm">
      <a href="#" className={`${isLoading ? 'text-gray-400' : 'text-primary-600 hover:text-primary-500'}`}>
        {linkText}
      </a>
    </div>
  </div>
);

// Check Ticket Component
const CheckTicketSection = () => {
  const [ticketNo, setTicketNo] = useState('');
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheck = async () => {
    if (!ticketNo) return toast.error('Please enter a ticket number');
    setLoading(true);
    setTicketData(null);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
      const res = await fetch(`${API_URL}/bookings/ticket/${ticketNo}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!data.success) {
        setError(`No ticket found with number ${ticketNo}`);
        toast.error(data.message || 'Ticket not found');
      } else if (data.data.status === 'used') {
        setTicketData(data.data);
        toast.error('This ticket has already been used.');
      } else {
        setTicketData(data.data);
        toast.success('Ticket is valid!');
      }
    } catch (err) {
      console.error(err);
      setError(`Error checking ticket: ${err.message || 'Unknown error'}`);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const markAsUsed = async () => {
    if (!ticketData) return;
    
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      // Get current user from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setError('User session expired. Please login again.');
        toast.error('Authentication error');
        return;
      }
      
      const user = JSON.parse(userStr);
      
      // Check if the user has permission to mark tickets for this park
      if (user && ticketData && user.parkId && ticketData.parkId && 
          user.parkId !== ticketData.parkId) {
        setError('You do not have permission to mark tickets for this park. Please contact your administrator.');
        toast.error('Permission denied: You can only mark tickets for your assigned park');
        return;
      }
      
      // Determine the correct endpoint based on the ticket data structure
      const endpoint = ticketData._id 
        ? `${API_URL}/bookings/${ticketData._id}/status` 
        : `${API_URL}/bookings/ticket/${ticketData.ticketNo}/mark-used`;
      
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'used' })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Ticket marked as used');
        setTicketData({ ...ticketData, status: 'used' });
      } else {
        // Handle specific error cases
        if (data.message && (data.message.includes('Not authorized') || 
            data.message.includes('permission') || 
            data.message.includes('authorized'))) {
          setError('You do not have permission to mark tickets for this park. Please contact your administrator.');
        } else {
          setError(data.message || 'Failed to update ticket');
        }
        toast.error(data.message || 'Failed to update ticket');
      }
    } catch (err) {
      console.error('Error marking ticket as used:', err);
      setError(`Error updating ticket status: ${err.message || 'Unknown error'}`);
      toast.error('Error updating ticket status');
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg rounded-xl p-8 mt-10 border border-blue-100">
      <div className="flex items-center mb-6">
        <div className="bg-blue-600 rounded-full p-3 mr-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Ticket Verification</h2>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-inner mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Enter ticket number (e.g., 91CF1951)"
            className="border border-gray-300 rounded-lg px-4 py-3 w-full md:w-2/3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={ticketNo}
            onChange={(e) => setTicketNo(e.target.value)}
          />
          <button
            onClick={handleCheck}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              <>Verify Ticket</>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {ticketData && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-lg font-bold text-white">Ticket Information</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Ticket Number</p>
                  <p className="text-lg font-mono font-bold">{ticketData.ticketNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Visitor</p>
                  <p className="text-lg font-medium">{ticketData.visitorName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Park</p>
                  <p className="text-lg font-medium">{ticketData.park?.name}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Visit Date</p>
                  <p className="text-lg font-medium">{new Date(ticketData.visitDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${ticketData.status === 'used' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                    {ticketData.status === 'used' ? (
                      <>
                        <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Used
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Valid
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            {ticketData.status !== 'used' && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={markAsUsed}
                  className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mark as Used
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkAdminDashboardPage;
