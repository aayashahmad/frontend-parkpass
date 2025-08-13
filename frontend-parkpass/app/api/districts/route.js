import { NextResponse } from 'next/server';

// Mock districts data
const mockDistricts = [
  {
    _id: '1',
    name: 'Central District',
    description: 'The heart of the city with beautiful urban parks and recreational areas.',
    image: '/images/district-placeholder.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2', 
    name: 'Northern District',
    description: 'Mountainous region with hiking trails and nature reserves.',
    image: '/images/district-placeholder.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '3',
    name: 'Southern District', 
    description: 'Coastal area with beach parks and waterfront attractions.',
    image: '/images/district-placeholder.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '4',
    name: 'Eastern District',
    description: 'Historic district with heritage parks and cultural sites.',
    image: '/images/district-placeholder.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '5',
    name: 'Western District',
    description: 'Industrial area transformed into modern recreational spaces.',
    image: '/images/district-placeholder.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockDistricts,
      message: 'Districts fetched successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch districts'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newDistrict = {
      _id: (mockDistricts.length + 1).toString(),
      name: body.name,
      description: body.description || '',
      image: '/images/district-placeholder.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockDistricts.push(newDistrict);
    
    return NextResponse.json({
      success: true,
      data: newDistrict,
      message: 'District created successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to create district'
    }, { status: 500 });
  }
}
