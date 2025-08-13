'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

const AddParkPage = () => {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [features, setFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState('');

  // Watch for image file changes
  const watchedImage = watch('image');

  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (watchedImage && watchedImage[0]) {
      const file = watchedImage[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [watchedImage]);

  const fetchDistricts = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await axios.get(`${API_URL}/districts`);
      if (response.data.success) {
        setDistricts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
      toast.error('Failed to load districts');
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      // Upload image if provided
      let imageUrl = '';
      if (data.image && data.image[0]) {
        const formData = new FormData();
        formData.append('image', data.image[0]);
        
        const uploadResponse = await axios.post(`${API_URL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (uploadResponse.data.success) {
          imageUrl = uploadResponse.data.filePath;
        }
      }

      // Prepare park data
      const parkData = {
        name: data.name,
        description: data.description,
        district: data.district,
        location: data.location,
        capacity: parseInt(data.capacity),
        adultPrice: parseInt(data.adultPrice),
        childPrice: parseInt(data.childPrice),
        features: features,
        openingHours: data.openingHours,
        picture: imageUrl,
        isActive: data.isActive
      };

      const response = await axios.post(`${API_URL}/parks`, parkData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success('Park created successfully!');
        router.push('/admin/parks');
      }
    } catch (error) {
      console.error('Error creating park:', error);
      toast.error(error.response?.data?.message || 'Failed to create park');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin/parks')}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Parks
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">➕ Add New Park</h1>
              <p className="text-gray-600 mt-1">Create a new park with details and pricing</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-2xl border border-gray-200">

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Park Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Park Name *
                </label>
                <input
                  id="name"
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  {...register('name', {
                    required: 'Park name is required',
                    maxLength: { value: 100, message: 'Name cannot exceed 100 characters' }
                  })}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              {/* District */}
              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                  District *
                </label>
                <select
                  id="district"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  {...register('district', { required: 'District is required' })}
                >
                  <option value="">Select a district</option>
                  {districts.map((district) => (
                    <option key={district._id} value={district._id}>
                      {district.name}
                    </option>
                  ))}
                </select>
                {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>}
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  id="location"
                  type="text"
                  placeholder="e.g., Near City Center, Highway 123"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  {...register('location', { required: 'Location is required' })}
                />
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
              </div>

              {/* Capacity */}
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <input
                  id="capacity"
                  type="number"
                  min="1"
                  placeholder="Maximum number of visitors"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  {...register('capacity', {
                    required: 'Capacity is required',
                    min: { value: 1, message: 'Capacity must be at least 1' }
                  })}
                />
                {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>}
              </div>

              {/* Adult Price */}
              <div>
                <label htmlFor="adultPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Adult Price (₹) *
                </label>
                <input
                  id="adultPrice"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  {...register('adultPrice', {
                    required: 'Adult price is required',
                    min: { value: 0, message: 'Price cannot be negative' }
                  })}
                />
                {errors.adultPrice && <p className="mt-1 text-sm text-red-600">{errors.adultPrice.message}</p>}
              </div>

              {/* Child Price */}
              <div>
                <label htmlFor="childPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Child Price (₹) *
                </label>
                <input
                  id="childPrice"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  {...register('childPrice', {
                    required: 'Child price is required',
                    min: { value: 0, message: 'Price cannot be negative' }
                  })}
                />
                {errors.childPrice && <p className="mt-1 text-sm text-red-600">{errors.childPrice.message}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="Describe the park, its attractions, and facilities..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                {...register('description', {
                  maxLength: { value: 1000, message: 'Description cannot exceed 1000 characters' }
                })}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            {/* Opening Hours */}
            <div>
              <label htmlFor="openingHours" className="block text-sm font-medium text-gray-700 mb-2">
                Opening Hours
              </label>
              <input
                id="openingHours"
                type="text"
                placeholder="e.g., 9:00 AM - 5:00 PM"
                defaultValue="9:00 AM - 5:00 PM"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                {...register('openingHours')}
              />
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature (e.g., Swimming Pool, Playground)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Park Image
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                {...register('image')}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                id="isActive"
                type="checkbox"
                defaultChecked={true}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                {...register('isActive')}
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Park is active and accepting bookings
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link
                href="/admin/parks"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Park...' : 'Create Park'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddParkPage;
