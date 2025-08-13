'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const ParkAdminDashboardPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [parkDetails, setParkDetails] = useState(null);

  useEffect(() => {
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

        if (parsedUser.role !== 'park-admin') {
          toast.error('You do not have permission to access this page');
          router.push('/admin');
          return;
        }

        // Replace this with real API call if needed
        setParkDetails({
          name: 'Adventure Park',
          location: 'New York',
          capacity: 500,
          dailyVisitors: 320,
          openingHours: '9:00 AM - 6:00 PM'
        });

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
          <DashboardCard title="Today's Bookings" value="18" linkText="View all bookings" />
          <DashboardCard title="Revenue (Today)" value="₹1,200" linkText="View financial reports" />
        </div>

        {/* Check Ticket Section */}
        <CheckTicketSection />

        {/* Recent Bookings */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
            <p className="text-sm text-gray-500">Latest 5 bookings for your park.</p>
          </div>
          <div className="border-t border-gray-200">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} px-4 py-4 grid grid-cols-4 gap-4`}>
                <div className="text-sm font-medium text-gray-500">Visitor Name</div>
                <div className="text-sm text-gray-900">Visitor {i + 1}</div>
                <div className="text-sm text-gray-500">2 Adults, 1 Child</div>
                <div className="text-sm text-gray-500">Today</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

// Dashboard Card Component
const DashboardCard = ({ title, value, linkText }) => (
  <div className="bg-white shadow rounded-lg p-6">
    <div className="flex items-center justify-between">
      <div>
        <dt className="text-sm font-medium text-gray-500">{title}</dt>
        <dd className="text-2xl font-semibold text-gray-900">{value}</dd>
      </div>
      <svg
        className="w-8 h-8 text-primary-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div className="mt-4 text-sm">
      <a href="#" className="text-primary-600 hover:text-primary-500">
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

  const handleCheck = async () => {
    if (!ticketNo) return toast.error('Please enter a ticket number');
    setLoading(true);
    setTicketData(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/ticket/${ticketNo}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || 'Ticket not found');
      } else if (data.data.status === 'used') {
        toast.error('This ticket has already been used.');
        setTicketData(data.data);
      } else {
        setTicketData(data.data);
        toast.success('Ticket is valid!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const markAsUsed = async () => {
    if (!ticketData) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${ticketData._id}/status`, {
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
        setTicketData(data.data);
      } else {
        toast.error(data.message || 'Failed to update ticket');
      }
    } catch (err) {
      toast.error('Error updating ticket status');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-10">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">🎟️ Check Ticket</h2>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Enter ticket number"
          className="border rounded px-4 py-2 w-full md:w-1/2"
          value={ticketNo}
          onChange={(e) => setTicketNo(e.target.value)}
        />
        <button
          onClick={handleCheck}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Checking...' : 'Check Ticket'}
        </button>
      </div>

      {ticketData && (
        <div className="mt-4 border-t pt-4">
          <p><strong>Visitor:</strong> {ticketData.visitorName}</p>
          <p><strong>Park:</strong> {ticketData.park?.name}</p>
          <p><strong>Visit Date:</strong> {new Date(ticketData.visitDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {ticketData.status}</p>
          {ticketData.status !== 'used' && (
            <button
              onClick={markAsUsed}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Mark as Used
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ParkAdminDashboardPage;
