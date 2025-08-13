'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

const TicketManagementPage = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUseConfirm, setShowUseConfirm] = useState(false);

  const onSubmitSearch = async ({ ticketNo }) => {
    setIsLoading(true);
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
        toast.success('Ticket found!');
      }
    } catch (error) {
      console.error('Search error:', error);
      if (error.response?.status === 404) {
        toast.error('Ticket not found');
      } else {
        toast.error(error.response?.data?.message || 'Failed to search ticket');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsUsed = async () => {
    if (!ticket) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await axios.put(`${API_URL}/bookings/ticket/${ticket.ticketNo}/use`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('Ticket marked as used! This ticket can no longer be used by anyone else.');
        setTicket(response.data.data); // Update with new status
        setShowUseConfirm(false);
      }
    } catch (error) {
      console.error('Mark as used error:', error);
      toast.error(error.response?.data?.message || 'Failed to mark ticket as used');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticket) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await axios.delete(`${API_URL}/bookings/ticket/${ticket.ticketNo}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('Ticket deleted successfully! This ticket number can never be used again.');
        setTicket(null);
        setShowDeleteConfirm(false);
        reset();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'used': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Ticket Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Search for tickets by ticket number and manage them
            </p>
          </div>

          <div className="p-6">
            {/* Search Form */}
            <form onSubmit={handleSubmit(onSubmitSearch)} className="mb-8">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="ticketNo" className="block text-sm font-medium text-gray-700 mb-2">
                    Ticket Number
                  </label>
                  <input
                    id="ticketNo"
                    name="ticketNo"
                    type="text"
                    placeholder="Enter ticket number (e.g., ABC12345)"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    {...register('ticketNo', {
                      required: 'Ticket number is required',
                      minLength: { value: 3, message: 'Ticket number must be at least 3 characters' }
                    })}
                  />
                  {errors.ticketNo && (
                    <p className="mt-1 text-sm text-red-600">{errors.ticketNo.message}</p>
                  )}
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Searching...' : 'Search Ticket'}
                  </button>
                </div>
              </div>
            </form>

            {/* Ticket Details */}
            {ticket && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Ticket Details</h2>
                  <div className="flex gap-2">
                    {ticket.status === 'active' && (
                      <button
                        onClick={() => setShowUseConfirm(true)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Mark as Used
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Delete Ticket
                    </button>
                  </div>
                </div>

                {/* Ticket Status Alert */}
                {ticket.status === 'used' && (
                  <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">
                          <strong>This ticket has been used</strong> - No one else can use this ticket number.
                          {ticket.usedAt && (
                            <span className="block text-xs mt-1">
                              Used on: {new Date(ticket.usedAt).toLocaleString()}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {ticket.status === 'cancelled' && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">
                          <strong>This ticket has been cancelled</strong> - This ticket cannot be used.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ticket Number</label>
                      <p className="mt-1 text-lg font-mono text-gray-900">{ticket.ticketNo}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Park</label>
                      <p className="mt-1 text-sm text-gray-900">{ticket.park.name}</p>
                      <p className="text-xs text-gray-500">{ticket.park.district.name} District</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Visitor</label>
                      <p className="mt-1 text-sm text-gray-900">{ticket.visitorName}</p>
                      <p className="text-xs text-gray-500">{ticket.visitorEmail}</p>
                      <p className="text-xs text-gray-500">{ticket.visitorPhone}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Visit Date</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(ticket.visitDate)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Visitors</label>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Total People:</span> {ticket.adults + ticket.children}
                        </p>
                        <p className="text-xs text-gray-600">
                          Adults: {ticket.adults} | Children: {ticket.children}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                      <p className="mt-1 text-lg font-semibold text-gray-900">${ticket.totalAmount.toFixed(2)}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(ticket.paymentStatus)}`}>
                        {ticket.paymentStatus.charAt(0).toUpperCase() + ticket.paymentStatus.slice(1)}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(ticket.createdAt)}</p>
                    </div>

                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Downloaded: {ticket.isDownloaded ? 'Yes' : 'No'}</span>
                      <span>Printed: {ticket.isPrinted ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mark as Used Confirmation Modal */}
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
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {isLoading ? 'Processing...' : 'Mark as Used'}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mt-2">Delete Ticket</h3>
                    <div className="mt-2 px-7 py-3">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete ticket <strong>{ticket?.ticketNo}</strong>? 
                        This action cannot be undone.
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
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        {isLoading ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketManagementPage;
