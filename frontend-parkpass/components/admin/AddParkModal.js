'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const AddParkModal = ({ isOpen, onClose, onParkAdded }) => {
  const [name, setName] = useState('');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [capacity, setCapacity] = useState('');
  const [pictureFile, setPictureFile] = useState(null);
  const [adultPrice, setAdultPrice] = useState('');
  const [childPrice, setChildPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // District adder states
  const [showDistrictForm, setShowDistrictForm] = useState(false);
  const [newDistrictName, setNewDistrictName] = useState('');
  const [newDistrictDesc, setNewDistrictDesc] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await axios.get(`${API_URL}/districts`);
        setDistricts(res.data.data);
      } catch (err) {
        toast.error('Failed to load districts');
        console.error(err);
      }
    };

    if (isOpen) fetchDistricts();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name || !selectedDistrict || !capacity || !pictureFile || !adultPrice || !childPrice) {
      toast.error('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    if (parseFloat(adultPrice) < 0 || parseFloat(childPrice) < 0) {
      toast.error('Prices cannot be negative.');
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      // Upload picture
      const formData = new FormData();
      formData.append('image', pictureFile);

      const uploadResponse = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!uploadResponse.data.success) {
        toast.error(uploadResponse.data.message || 'Failed to upload image.');
        setIsLoading(false);
        return;
      }

      const imageUrl = uploadResponse.data.filePath;

      // Create park
      const response = await axios.post(
        `${API_URL}/parks`,
        {
          name,
          district: selectedDistrict,
          picture: imageUrl,
          location: selectedDistrict,
          capacity: parseInt(capacity),
          adultPrice: parseFloat(adultPrice),
          childPrice: parseFloat(childPrice),
          isActive,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('Park added successfully!');
        onParkAdded?.();
        onClose();

        // Reset form
        setName('');
        setSelectedDistrict('');
        setCapacity('');
        setPictureFile(null);
        setAdultPrice('');
        setChildPrice('');
        setIsActive(true);
      } else {
        toast.error(response.data.message || 'Failed to add park.');
      }
    } catch (error) {
      console.error('Error adding park:', error);
      toast.error(error.response?.data?.message || 'Failed to add park. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDistrict = async () => {
    const token = localStorage.getItem('token');
    if (!newDistrictName.trim()) {
      toast.error('District name is required');
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/districts`,
        {
          name: newDistrictName.trim(),
          description: newDistrictDesc.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        toast.success('District added');
        setNewDistrictName('');
        setNewDistrictDesc('');
        setShowDistrictForm(false);

        // Refresh district list
        const districtsRes = await axios.get(`${API_URL}/districts`);
        setDistricts(districtsRes.data.data);
      } else {
        toast.error(res.data.message || 'Failed to add district');
      }
    } catch (err) {
      console.error('Add district error:', err);
      toast.error(err.response?.data?.message || 'Failed to add district');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Add New Park</h2>
        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          {/* District */}
          <div className="mb-4">
            <label htmlFor="district" className="block text-sm font-medium text-gray-700">District</label>
            <select
              id="district"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="">Select a district</option>
              {districts.map((district) => (
                <option key={district._id} value={district._id}>
                  {district.name}
                </option>
              ))}
            </select>

            {/* Add New District Toggle */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowDistrictForm(!showDistrictForm)}
                className="text-sm text-blue-600 hover:underline"
              >
                + Add New District
              </button>
            </div>

            {/* New District Form */}
            {showDistrictForm && (
              <div className="border p-3 mt-2 rounded bg-gray-50">
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="District Name"
                    value={newDistrictName}
                    onChange={(e) => setNewDistrictName(e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div className="mb-2">
                  <textarea
                    placeholder="Description (optional)"
                    value={newDistrictDesc}
                    onChange={(e) => setNewDistrictDesc(e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddDistrict}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Save District
                </button>
              </div>
            )}
          </div>

          {/* Capacity */}
          {/* <div className="mb-4">
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacity</label>
            <input
              type="number"
              id="capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div> */}

          {/* Picture */}
          <div className="mb-4">
            <label htmlFor="picture" className="block text-sm font-medium text-gray-700">Picture</label>
            <input
              type="file"
              id="picture"
              onChange={(e) => setPictureFile(e.target.files[0])}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          {/* Adult Price */}
          <div className="mb-4">
            <label htmlFor="adultPrice" className="block text-sm font-medium text-gray-700">Adult Price</label>
            <input
              type="number"
              id="adultPrice"
              value={adultPrice}
              onChange={(e) => setAdultPrice(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
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
              value={childPrice}
              onChange={(e) => setChildPrice(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
              step="0.01"
            />
          </div>

          {/* Is Active */}
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded"
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
              {isLoading ? 'Adding...' : 'Add Park'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddParkModal;
