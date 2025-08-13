'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const DeleteParkModal = ({ isOpen, onClose, onParkDeleted, parkToDelete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!parkToDelete?._id) {
      toast.error('No park selected for deletion.');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      const response = await axios.delete(`${API_URL}/parks/${parkToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success('Park deleted successfully!');
        onParkDeleted?.();
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to delete park.');
      }
    } catch (error) {
      console.error('Error deleting park:', error);
      toast.error(error.response?.data?.message || 'Failed to delete park.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !parkToDelete) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Confirm Delete</h2>
        <p className="mb-4 text-gray-700">
          Are you sure you want to delete park <span className="font-semibold">{parkToDelete.name} ({parkToDelete.location})</span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteParkModal;
