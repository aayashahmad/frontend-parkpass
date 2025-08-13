/**
 * Image utility functions for building image sources
 */

/**
 * Build image source URL with fallback
 * @param {string} primaryImage - Primary image path
 * @param {string} fallbackImage - Fallback image path
 * @returns {string} - Image URL
 */
export const buildImageSrc = (primaryImage, fallbackImage) => {
  // Use the base URL without /api suffix for static files
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
  
  // Determine which image to use
  const imagePath = primaryImage || fallbackImage;
  
  // If no image path, return park placeholder
  if (!imagePath || imagePath === 'no-photo.jpg') {
    return '/images/park-placeholder.jpg';
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it starts with /, it's a relative path from the backend
  if (imagePath.startsWith('/')) {
    return `${BASE_URL}${imagePath}`;
  }

  // Otherwise, assume it's just a filename in uploads
  return `${BASE_URL}/uploads/${imagePath}`;
};
