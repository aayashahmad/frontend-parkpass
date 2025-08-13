'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const DistrictSelection = () => {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
        const response = await fetch(`${API_URL}/districts`);
        const data = await response.json();

        if (data.success) {
          setDistricts(data.data);
        } else {
          setError('Failed to load districts.');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching districts:', err);
        setError('Failed to load districts. Please try again later.');
        setLoading(false);
      }
    };

    fetchDistricts();
  }, []);

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedDistrict) {
      router.push(`/parks?district=${selectedDistrict}`);
    }
  };

  if (loading) {
    return (
      <section id="district-selection" className="py-12">
        <div className="container mx-auto px-4 text-center">
          <p>Loading districts...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="district-selection" className="py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="district-selection" className="py-20 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Explore Beautiful Districts
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover stunning parks and natural attractions across different districts.
            Each district offers unique experiences and breathtaking landscapes.
          </p>
        </div>
        
        {/* Beautiful Mobile Dropdown */}
        <div className="md:hidden mb-12">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Choose Your District</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <select
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 appearance-none"
                >
                  <option value="">Select a district</option>
                  {districts.map((district) => (
                    <option key={district._id} value={district._id}>
                      {district.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <button
                type="submit"
                disabled={!selectedDistrict}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Explore Parks
              </button>
            </form>
          </div>
        </div>
        
        {/* Beautiful District Cards */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {districts.map((district) => (
            <Link
              key={district._id}
              href={`/parks?district=${district._id}`}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src={district.image && district.image !== 'no-photo.jpg' ?
                    (district.image.startsWith('/') || district.image.startsWith('http') ?
                      district.image :
                      `/uploads/${district.image}`) :
                    '/images/district-placeholder.jpg'}
                  alt={district.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold mb-1">{district.name}</h3>
                  <p className="text-sm opacity-90">Discover Amazing Parks</p>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {district.description || 'Explore beautiful parks and natural attractions in this district.'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600">Explore Parks</span>
                  <div className="flex items-center text-blue-600 group-hover:translate-x-2 transition-transform duration-300">
                    <span className="text-sm font-medium mr-2">View Details</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DistrictSelection;