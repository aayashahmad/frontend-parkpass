'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

const TicketCheckerDashboardPage = () => {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scanLoading, setScanLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUseConfirm, setShowUseConfirm] = useState(false);

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
        
        // Allow ticket-checker, super-admin, and park-admin roles
        if (!['ticket-checker', 'super-admin', 'park-admin'].includes(parsedUser.role)) {
          toast.error('You do not have permission to access this page');
          router.push('/admin');
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/admin');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/admin');
  };

  const onSubmitScan = async ({ ticketNo }) => {
    setScanLoading(true);
    setTicket(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await axios.get(`${API_URL}/bookings/ticket/${ticketNo}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setTicket(response.data.data);

        // Add to recent scans
        const scanRecord = {
          id: Date.now(),
          ticketNo: response.data.data.ticketNo,
          visitorName: response.data.data.visitorName,
          status: response.data.data.status,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          park: response.data.data.park.name
        };
        setRecentScans(prev => [scanRecord, ...prev.slice(0, 9)]);

        if (response.data.data.status === 'used') {
          toast.warning('⚠️ This ticket has already been used!');
        } else if (response.data.data.status === 'cancelled') {
          toast.error('❌ This ticket has been cancelled!');
        } else {
          toast.success('✅ Valid ticket found!');
        }
      }
    } catch (error) {
      console.error('Scan error:', error);
      if (error.response?.status === 404) {
        toast.error('❌ Ticket not found');

        // Add failed scan to recent scans
        const failedScan = {
          id: Date.now(),
          ticketNo: ticketNo,
          visitorName: 'N/A',
          status: 'invalid',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          park: 'N/A'
        };
        setRecentScans(prev => [failedScan, ...prev.slice(0, 9)]);
      } else {
        toast.error(error.response?.data?.message || 'Failed to scan ticket');
      }
    } finally {
      setScanLoading(false);
      reset();
    }
  };

  const handleMarkAsUsed = async () => {
    if (!ticket) return;

    setScanLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      const response = await axios.put(`${API_URL}/bookings/ticket/${ticket.ticketNo}/use`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setTicket(prev => ({ ...prev, status: 'used', usedAt: new Date() }));
        toast.success('✅ Ticket marked as used successfully!');
        setShowUseConfirm(false);
      }
    } catch (error) {
      console.error('Mark as used error:', error);
      toast.error(error.response?.data?.message || 'Failed to mark ticket as used');
    } finally {
      setScanLoading(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticket) return;

    setScanLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      await axios.delete(`${API_URL}/bookings/ticket/${ticket.ticketNo}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('🗑️ Ticket deleted successfully!');
      setTicket(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete ticket');
    } finally {
      setScanLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎫 Ticket Checker Dashboard</h1>
              <p className="text-gray-600 mt-1">Scan and validate park entry tickets</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Ticket Checker'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'ticket-checker'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket Scanner */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h4m4 0h2m4 0h4M4 8h4m0 0v4m0 0h4m0 0v4" />
                  </svg>
                  Scan Ticket
                </h3>
                <p className="text-blue-100 text-sm mt-1">Enter ticket number to validate</p>
              </div>

              <div className="p-6">
            <form onSubmit={handleSubmit(onSubmitScan)} className="space-y-4">
              <div>
                <label htmlFor="ticketNo" className="block text-sm font-medium text-gray-700 mb-2">
                  Ticket Number
                </label>
                <input
                  id="ticketNo"
                  type="text"
                  placeholder="Enter ticket number (e.g., 91CF1951)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono"
                  {...register('ticketNo', {
                    required: 'Ticket number is required',
                    pattern: {
                      value: /^[A-Z0-9]{8}$/,
                      message: 'Ticket number must be 8 characters (letters and numbers)'
                    }
                  })}
                />
                {errors.ticketNo && (
                  <p className="mt-1 text-sm text-red-600">{errors.ticketNo.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={scanLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {scanLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Scanning...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Scan Ticket
                  </div>
                )}
              </button>
            </form>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-2">
            {ticket ? (
              <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
                <div className={`px-6 py-4 ${
                  ticket.status === 'active' ? 'bg-gradient-to-r from-green-600 to-green-700' :
                  ticket.status === 'used' ? 'bg-gradient-to-r from-orange-600 to-orange-700' :
                  'bg-gradient-to-r from-red-600 to-red-700'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-white">Ticket Details</h3>
                      <p className="text-white/90 text-sm">
                        {ticket.status === 'active' ? '✅ Valid Ticket' :
                         ticket.status === 'used' ? '⚠️ Already Used' :
                         '❌ Invalid/Cancelled'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {ticket.status === 'active' && (
                        <button
                          onClick={() => setShowUseConfirm(true)}
                          disabled={scanLoading}
                          className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 transition-colors"
                        >
                          Mark as Used
                        </button>
                      )}
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={scanLoading}
                        className="px-4 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Number</label>
                        <p className="text-2xl font-mono font-bold text-gray-900 bg-gray-100 px-3 py-2 rounded-lg">
                          {ticket.ticketNo}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Park</label>
                        <p className="text-lg font-semibold text-gray-900">{ticket.park.name}</p>
                        <p className="text-sm text-gray-500">{ticket.park.district.name} District</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Information</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-900">{ticket.visitorName}</p>
                          <p className="text-sm text-gray-600">{ticket.visitorEmail}</p>
                          <p className="text-sm text-gray-600">{ticket.visitorPhone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Visit Details</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm"><span className="font-medium">Date:</span> {new Date(ticket.visitDate).toLocaleDateString()}</p>
                          <p className="text-sm"><span className="font-medium">Adults:</span> {ticket.adults}</p>
                          <p className="text-sm"><span className="font-medium">Children:</span> {ticket.children}</p>
                          <p className="text-sm"><span className="font-medium">Total People:</span> {ticket.adults + ticket.children}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Information</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-lg font-bold text-green-600">₹{ticket.totalAmount}</p>
                          <p className="text-sm text-gray-600">Status: {ticket.paymentStatus}</p>
                          {ticket.paymentMethod && (
                            <p className="text-sm text-gray-600">Method: {ticket.paymentMethod}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status Information</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm">
                            <span className="font-medium">Status:</span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                              ticket.status === 'active' ? 'bg-green-100 text-green-800' :
                              ticket.status === 'used' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {ticket.status.toUpperCase()}
                            </span>
                          </p>
                          {ticket.usedAt && (
                            <p className="text-sm text-gray-600">Used: {new Date(ticket.usedAt).toLocaleString()}</p>
                          )}
                          <p className="text-sm text-gray-600">Created: {new Date(ticket.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow-xl rounded-2xl border border-gray-200 p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Ticket Scanned</h3>
                <p className="text-gray-500">Enter a ticket number to view details and manage the ticket.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Scans */}
        <div className="mt-8 bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
            <h3 className="text-xl font-bold text-white">Recent Scans</h3>
            <p className="text-gray-200 text-sm">Latest ticket validations and scans</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visitor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Park
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentScans.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No recent scans. Start scanning tickets to see history here.
                    </td>
                  </tr>
                ) : (
                  recentScans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                        {scan.ticketNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {scan.visitorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {scan.park}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          scan.status === 'active' ? 'bg-green-100 text-green-800' :
                          scan.status === 'used' ? 'bg-orange-100 text-orange-800' :
                          scan.status === 'invalid' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {scan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {scan.timestamp}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirmation Modals */}
        {showUseConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-2">Mark Ticket as Used</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to mark ticket <strong>{ticket?.ticketNo}</strong> as used?
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    This will prevent anyone else from using this ticket number.
                  </p>
                </div>
                <div className="flex gap-4 px-4 py-3">
                  <button
                    onClick={() => setShowUseConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMarkAsUsed}
                    disabled={scanLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {scanLoading ? 'Processing...' : 'Mark as Used'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-2">Delete Ticket</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete ticket <strong>{ticket?.ticketNo}</strong>?
                  </p>
                  <p className="text-xs text-red-500 mt-2">
                    This action cannot be undone. The ticket will be permanently removed.
                  </p>
                </div>
                <div className="flex gap-4 px-4 py-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteTicket}
                    disabled={scanLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {scanLoading ? 'Deleting...' : 'Delete Ticket'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TicketCheckerDashboardPage;