'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { formatINR } from '@/utils/currency';
import { buildImageSrc } from '@/utils/image';

export default function ParksPage() {
  const searchParams = useSearchParams();
  const districtId = searchParams.get('district');

  const [parks, setParks] = useState([]);
  const [district, setDistrict] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParks = async () => {
      if (!districtId) {
        setError('No district selected. Please go back and select a district.');
        setLoading(false);
        return;
      }

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

        // District details
        const districtRes = await fetch(`${API_URL}/districts/${districtId}`);
        const districtJson = await districtRes.json();
        if (districtJson?.success) setDistrict(districtJson.data);

        // Parks for district (prefer nested route)
        let parksJson;
        try {
          const parksRes = await fetch(`${API_URL}/districts/${districtId}/parks`);
          parksJson = await parksRes.json();
        } catch {
          const allRes = await fetch(`${API_URL}/parks`);
          const allJson = await allRes.json();
          if (allJson?.success) {
            const filtered = (allJson.data || []).filter(
              (p) => p?.district?._id === districtId || p?.district === districtId
            );
            parksJson = { success: true, data: filtered };
          }
        }

        if (parksJson?.success) setParks(parksJson.data || []);
        setLoading(false);
      } catch (e) {
        console.error('Error fetching parks:', e);
        setError('Failed to load parks. Please try again later.');
        setLoading(false);
      }
    };

    fetchParks();
  }, [districtId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Loading parks...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-red-500">{error}</p>
          <Link href="/" className="btn-primary mt-4 inline-block">
            Go Back to Home
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link href="/" className="text-primary-600 hover:underline">
              &larr; Back to Home
            </Link>
          </div>

          <h1 className="text-3xl font-heading font-bold mb-2">
            Parks in {district?.name}
          </h1>
          <p className="text-gray-600 mb-8">Select a park to book your tickets</p>

          {parks.length === 0 ? (
            <div className="text-center py-8">
              <p>No parks found in this district.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parks.map((park) => {
                const imageSrc = buildImageSrc(park.picture, park.image);
                return (
                  <div
                    key={park._id}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={imageSrc}
                        alt={park.name}
                        fill
                        className="object-cover"
                        // If you haven't restarted after next.config.js change,
                        // uncomment the next line temporarily:
                        // unoptimized
                      />
                      {park.isActive ? (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Open
                        </div>
                      ) : (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Closed
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {park.name}
                      </h2>
                      <p className="text-gray-600 mb-3 text-sm line-clamp-2">
                        {park.description || 'A beautiful park to visit and enjoy.'}
                      </p>

                      {park.location && (
                        <div className="flex items-center text-gray-500 text-sm mb-2">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {park.location}
                        </div>
                      )}

                      {park.openingHours && (
                        <div className="flex items-center text-gray-500 text-sm mb-2">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {park.openingHours}
                        </div>
                      )}

                      {park.capacity && (
                        <div className="flex items-center text-gray-500 text-sm mb-3">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Capacity: {park.capacity} visitors
                        </div>
                      )}

                      {park.features?.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {park.features.slice(0, 3).map((feature, index) => (
                              <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {feature}
                              </span>
                            ))}
                            {park.features.length > 3 && (
                              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                +{park.features.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Adult: {formatINR(park.adultPrice)}</p>
                          <p className="text-sm font-semibold text-gray-900">Child: {formatINR(park.childPrice)}</p>
                        </div>
                        <Link
                          href={`/booking/${park._id}`}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            park.isActive
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          onClick={!park.isActive ? (e) => e.preventDefault() : undefined}
                        >
                          {park.isActive ? 'Book Now' : 'Closed'}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
