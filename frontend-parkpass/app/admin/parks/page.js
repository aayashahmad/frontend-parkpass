'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import ImageDisplay from '../../../components/common/ImageDisplay';
import { formatINR } from '../../../utils/currency';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const ParksManagementPage = () => {
  const router = useRouter();
  const [parks, setParks] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchParks();
    fetchDistricts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchParks = async () => {
    try {
      const headers = getAuthHeader();
      if (!headers.Authorization) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      const { data } = await axios.get(`${API_URL}/parks`, { headers });
      if (data?.success) setParks(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Error fetching parks:', error);
      toast.error('Failed to load parks');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      // include token in case /districts is protected; safe even if it’s public
      const headers = getAuthHeader();
      const { data } = await axios.get(`${API_URL}/districts`, { headers });
      if (data?.success) setDistricts(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const handleDeletePark = async (parkId, parkName) => {
    console.log('Delete button clicked for park:', parkId, parkName);

    if (!confirm(`Are you sure you want to delete "${parkName}"? This action cannot be undone.`)) {
      console.log('Delete cancelled by user');
      return;
    }

    try {
      const headers = getAuthHeader();
      console.log('Auth headers:', headers);

      if (!headers.Authorization) {
        toast.error('Authentication token not found. Please log in again.');
        router.push('/admin');
        return;
      }

      console.log('Sending delete request to:', `${API_URL}/parks/${parkId}`);
      const response = await axios.delete(`${API_URL}/parks/${parkId}`, { headers });
      console.log('Delete response:', response);

      toast.success('Park deleted successfully');
      fetchParks();
    } catch (error) {
      console.error('Error deleting park:', error);
      console.error('Error response:', error.response);
      toast.error(error?.response?.data?.message || 'Failed to delete park');
    }
  };

  const toggleParkStatus = async (parkId, currentStatus) => {
    console.log('Toggle status clicked for park:', parkId, 'Current status:', currentStatus);

    try {
      const headers = getAuthHeader();
      console.log('Auth headers for toggle:', headers);

      if (!headers.Authorization) {
        toast.error('Authentication token not found. Please log in again.');
        router.push('/admin');
        return;
      }

      console.log('Sending toggle request to:', `${API_URL}/parks/${parkId}`);
      const response = await axios.put(
        `${API_URL}/parks/${parkId}`,
        { isActive: !currentStatus },
        { headers }
      );
      console.log('Toggle response:', response);

      toast.success(`Park ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchParks();
    } catch (error) {
      console.error('Error updating park status:', error);
      console.error('Error response:', error.response);
      toast.error(error?.response?.data?.message || 'Failed to update park status');
    }
  };

  // helper: get district id whether it's populated object or raw id
  const getDistrictId = (d) => (typeof d === 'string' ? d : d?._id);
  const getDistrictName = (d) => {
    const id = getDistrictId(d);
    const district = districts.find((x) => x._id === id);
    return district ? district.name : 'Unknown District';
  };

  // filtering
  const filteredParks = parks.filter((park) => {
    const name = (park.name || '').toString().toLowerCase();
    const location = (park.location || '').toString().toLowerCase();
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) || location.includes(searchTerm.toLowerCase());

    const matchesDistrict =
      !selectedDistrict || getDistrictId(park.district) === selectedDistrict;

    return matchesSearch && matchesDistrict;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>Loading parks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 relative overflow-hidden py-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-10 animate-bounce"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Back + CTA */}
        <div className="mb-8 animate-fadeInDown">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="group flex items-center px-6 py-3 bg-white/10 backdrop-blur-lg text-white rounded-2xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 border border-white/20"
              >
                <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                  🌳 Parks Management
                </h1>
                <p className="text-emerald-100 mt-2 text-lg">Manage parks, pricing, and availability ✨</p>
              </div>
            </div>

            <Link
              href="/admin/parks/add"
              className="group flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl font-medium"
            >
              <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Park
            </Link>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-3xl border border-white/20 animate-fadeInUp">
          {/* Filters */}
          <div className="px-6 py-6 border-b border-white/20 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-white mb-2">
                  🔍 Search Parks
                </label>
                <div className="relative">
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-white placeholder-white/70 transition-all duration-300"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="district" className="block text-sm font-medium text-white mb-2">
                  🏞️ Filter by District
                </label>
                <select
                  id="district"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 text-white transition-all duration-300"
                >
                  <option value="">All Districts</option>
                  {districts.map((district) => (
                    <option key={district._id} value={district._id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Parks List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Park</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No parks found
                    </td>
                  </tr>
                ) : (
                  filteredParks.map((park) => (
                    <tr key={park._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <ImageDisplay
                              src={park.picture}
                              alt={park.name}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-lg object-cover"
                              placeholder="park"
                              placeholderIcon="park"
                              placeholderText="Park"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{park.name}</div>
                            <div className="text-sm text-gray-500">{park.location}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {park.district?.name || getDistrictName(park.district)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>Adult: {formatINR(park.adultPrice)}</div>
                        <div>Child: {formatINR(park.childPrice)}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {park.capacity} visitors
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            park.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {park.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link href={`/admin/parks/edit/${park._id}`} className="text-primary-600 hover:text-primary-900">
                          Edit
                        </Link>
                        <button
                          onClick={() => toggleParkStatus(park._id, park.isActive)}
                          className={`${park.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {park.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeletePark(park._id, park.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing {filteredParks.length} of {parks.length} parks
              {selectedDistrict && ` in ${districts.find((d) => d._id === selectedDistrict)?.name}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParksManagementPage;
