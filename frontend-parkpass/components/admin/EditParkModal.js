'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const EditParkModal = ({ isOpen, onClose, onParkUpdated, parkToEdit }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [maxVisitors, setMaxVisitors] = useState('');
  const [picture, setPicture] = useState('');
  const [pictureFile, setPictureFile] = useState(null);
  const [adultPrice, setAdultPrice] = useState('');
  const [childPrice, setChildPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  // Load park data when modal opens
  useEffect(() => {
    if (isOpen && parkToEdit) {
      setName(parkToEdit.name || '');
      setLocation(parkToEdit.location || '');
      setMaxVisitors(parkToEdit.maxVisitors || '');
      setPicture(parkToEdit.picture || '');
      setPictureFile(null); // reset file
      setAdultPrice(parkToEdit.adultPrice || '');
      setChildPrice(parkToEdit.childPrice || '');
      setIsActive(parkToEdit.isActive ?? true);
    }
  }, [isOpen, parkToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name || !location || !maxVisitors || (!picture && !pictureFile) || !adultPrice || !childPrice) {
      toast.error('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    if (isNaN(adultPrice) || isNaN(childPrice) || parseFloat(adultPrice) < 0 || parseFloat(childPrice) < 0) {
      toast.error('Prices must be valid non-negative numbers.');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found.');
        setIsLoading(false);
        return;
      }

      let imageUrl = picture;

      if (pictureFile) {
        const formData = new FormData();
        formData.append('image', pictureFile);
        const uploadResponse = await axios.post(`${API_URL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });

        if (uploadResponse.data.success) {
          imageUrl = uploadResponse.data.filePath;
        } else {
          toast.error(uploadResponse.data.message || 'Failed to upload image.');
          setIsLoading(false);
          return;
        }
      }

      // Update park
      const response = await axios.put(`${API_URL}/parks/${parkToEdit._id}`, {
        name,
        location,
        maxVisitors: parseInt(maxVisitors),
        picture: imageUrl,
        adultPrice: parseFloat(adultPrice),
        childPrice: parseFloat(childPrice),
        isActive
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('Park updated successfully!');
        onParkUpdated?.();
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to update park.');
      }
    } catch (error) {
      console.error('Error updating park:', error);
      toast.error(error.response?.data?.message || 'Failed to update park.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Edit Park</h2>
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Location */}
          <div className="mb-4">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              id="location"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          {/* Max Visitors */}
          <div className="mb-4">
            <label htmlFor="maxVisitors" className="block text-sm font-medium text-gray-700">Capacity</label>
            <input
              type="number"
              id="maxVisitors"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              value={maxVisitors}
              onChange={(e) => setMaxVisitors(e.target.value)}
              required
            />
          </div>

          {/* Picture Upload */}
          <div className="mb-4">
            <label htmlFor="picture" className="block text-sm font-medium text-gray-700">Picture</label>
            {picture && (
              <div className="mb-2">
                <img
                  src={`http://localhost:5001${picture}`}
                  alt="Current"
                  className="w-24 h-24 object-cover rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">Current: {picture.split('/').pop()}</p>
              </div>
            )}
            <input
              type="file"
              id="picture"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              onChange={(e) => setPictureFile(e.target.files[0])}
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank to keep current picture.</p>
          </div>

          {/* Adult Price */}
          <div className="mb-4">
            <label htmlFor="adultPrice" className="block text-sm font-medium text-gray-700">Adult Price</label>
            <input
              type="number"
              id="adultPrice"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              value={adultPrice}
              onChange={(e) => setAdultPrice(e.target.value)}
              required
              step="0.01"
            />
          </div>

          {/* Child Price */}
          <div className="mb-4">
            <label htmlFor="childPrice" className="block text-sm font-medium text-gray-700">Child Price</label>
            <input
              type="number"
              id="childPrice"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              value={childPrice}
              onChange={(e) => setChildPrice(e.target.value)}
              required
              step="0.01"
            />
          </div>

          {/* Is Active */}
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="isActive"
              className="h-4 w-4 text-primary-600 border-gray-300 rounded"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Is Active</label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
            >
              {isLoading ? 'Updating...' : 'Update Park'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditParkModal;
