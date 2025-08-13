import { NextResponse } from 'next/server';

// Mock parks data
const mockParks = [
  {
    _id: 'park1',
    name: 'Central Park',
    description: 'A beautiful urban park in the heart of the city with walking trails, playgrounds, and picnic areas.',
    picture: '/images/park-placeholder.jpg',
    image: '/images/park-placeholder.jpg',
    district: {
      _id: '1',
      name: 'Central District'
    },
    entryFee: 50,
    openingHours: '6:00 AM - 8:00 PM',
    features: ['Walking Trails', 'Playground', 'Picnic Areas', 'Lake'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'park2',
    name: 'Mountain View Park',
    description: 'Scenic park with hiking trails and mountain views, perfect for nature lovers.',
    picture: '/images/park-placeholder.jpg',
    image: '/images/park-placeholder.jpg',
    district: {
      _id: '2',
      name: 'Northern District'
    },
    entryFee: 75,
    openingHours: '5:00 AM - 7:00 PM',
    features: ['Hiking Trails', 'Mountain Views', 'Wildlife Watching'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'park3',
    name: 'Seaside Park',
    description: 'Coastal park with beach access, perfect for family outings and water activities.',
    picture: '/images/park-placeholder.jpg',
    image: '/images/park-placeholder.jpg',
    district: {
      _id: '3',
      name: 'Southern District'
    },
    entryFee: 100,
    openingHours: '6:00 AM - 9:00 PM',
    features: ['Beach Access', 'Swimming Area', 'Volleyball Courts', 'Restaurants'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'park4',
    name: 'Heritage Garden',
    description: 'Historic garden with cultural significance and beautiful landscaping.',
    picture: '/images/park-placeholder.jpg',
    image: '/images/park-placeholder.jpg',
    district: {
      _id: '4',
      name: 'Eastern District'
    },
    entryFee: 30,
    openingHours: '7:00 AM - 6:00 PM',
    features: ['Historic Sites', 'Gardens', 'Museum', 'Guided Tours'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'park5',
    name: 'Urban Recreation Center',
    description: 'Modern recreational facility with sports courts and fitness areas.',
    picture: '/images/park-placeholder.jpg',
    image: '/images/park-placeholder.jpg',
    district: {
      _id: '5',
      name: 'Western District'
    },
    entryFee: 80,
    openingHours: '6:00 AM - 10:00 PM',
    features: ['Sports Courts', 'Fitness Center', 'Swimming Pool', 'Cafeteria'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('district');
    
    let filteredParks = mockParks;
    
    if (districtId) {
      filteredParks = mockParks.filter(park => 
        park.district._id === districtId || park.district === districtId
      );
    }
    
    return NextResponse.json({
      success: true,
      data: filteredParks,
      message: 'Parks fetched successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch parks'
    }, { status: 500 });
  }
}
