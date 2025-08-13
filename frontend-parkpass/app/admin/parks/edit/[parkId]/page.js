'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const EditParkPage = ({ params }) => {
  const { parkId } = params;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImage, setCurrentImage] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();

  useEffect(() => {
    fetchParkData();
    fetchDistricts();
  }, [parkId]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchParkData = async () => {
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        toast.error('Authentication token not found. Please log in again.');
        router.push('/admin');
        return;
      }

      const { data } = await axios.get(`${API_URL}/parks/${parkId}`, { headers });
      if (data?.success) {
        const park = data.data;
        
        // Set form values
        setValue('name', park.name);
        setValue('description', park.description);
        setValue('location', park.location);
        setValue('district', park.district?._id || park.district);
        setValue('capacity', park.capacity);
        setValue('adultPrice', park.adultPrice);
        setValue('childPrice', park.childPrice);
        setValue('features', park.features?.join(', ') || '');
        setValue('openingHours', park.openingHours);
        setValue('isActive', park.isActive);
        
        setCurrentImage(park.picture);
      }
    } catch (error) {
      console.error('Error fetching park:', error);
      toast.error('Failed to load park data');
      router.push('/admin/parks');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      const headers = getAuthHeader();
      const { data } = await axios.get(`${API_URL}/districts`, { headers });
      if (data?.success) setDistricts(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const headers = getAuthHeader();
      const formData = new FormData();

      // Add form fields
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('location', data.location);
      formData.append('district', data.district);
      formData.append('capacity', data.capacity);
      formData.append('adultPrice', data.adultPrice);
      formData.append('childPrice', data.childPrice);
      formData.append('features', data.features);
      formData.append('openingHours', data.openingHours);
      formData.append('isActive', data.isActive);

      // Add image if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await axios.put(`${API_URL}/parks/${parkId}`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success) {
        toast.success('Park updated successfully!');
        router.push('/admin/parks');
      } else {
        throw new Error(response.data?.message || 'Failed to update park');
      }
    } catch (error) {
      console.error('Error updating park:', error);
      toast.error(error?.response?.data?.message || 'Failed to update park');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading park data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Park</h1>
              <p className="mt-2 text-gray-600">Update park information and settings</p>
            </div>
            <Link
              href="/admin/parks"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Parks
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Park Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Park name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter park name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District *
                  </label>
                  <select
                    {...register('district', { required: 'District is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district._id} value={district._id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter park description"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>

              {/* Location and Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    {...register('location', { required: 'Location is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter park location"
                  />
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    {...register('capacity', { required: 'Capacity is required', min: 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter park capacity"
                  />
                  {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>}
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adult Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('adultPrice', { required: 'Adult price is required', min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter adult price"
                  />
                  {errors.adultPrice && <p className="text-red-500 text-sm mt-1">{errors.adultPrice.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Child Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('childPrice', { required: 'Child price is required', min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter child price"
                  />
                  {errors.childPrice && <p className="text-red-500 text-sm mt-1">{errors.childPrice.message}</p>}
                </div>
              </div>

              {/* Features and Opening Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features
                  </label>
                  <input
                    type="text"
                    {...register('features')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter features (comma separated)"
                  />
                  <p className="text-sm text-gray-500 mt-1">Separate features with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Hours *
                  </label>
                  <input
                    type="text"
                    {...register('openingHours', { required: 'Opening hours are required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 9:00 AM - 6:00 PM"
                  />
                  {errors.openingHours && <p className="text-red-500 text-sm mt-1">{errors.openingHours.message}</p>}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Park Image
                </label>
                <div className="space-y-4">
                  {currentImage && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                      <img
                        src={currentImage.startsWith('http') ? currentImage : `${API_URL}${currentImage}`}
                        alt="Current park"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500">Upload a new image to replace the current one</p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Park is Active</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Link
                  href="/admin/parks"
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Updating...' : 'Update Park'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditParkPage;
