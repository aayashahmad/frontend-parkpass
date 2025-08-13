/**
 * Utility functions for handling image URLs across the application
 */

/**
 * Get the proper image URL for display
 * @param {string} imagePath - The image path from the database
 * @param {string} fallback - Fallback image path
 * @returns {string} - Properly formatted image URL
 */
export const getImageUrl = (imagePath, fallback = null) => {
  // Use the base URL without /api suffix for static files
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';

  // If no image path or it's the default no-photo
  if (!imagePath || imagePath === 'no-photo.jpg') {
    return fallback;
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

/**
 * Get district image URL
 * @param {object} district - District object with image property
 * @returns {string} - Image URL or fallback to placeholder
 */
export const getDistrictImageUrl = (district) => {
  return getImageUrl(district?.image, '/images/district-placeholder.jpg');
};

/**
 * Get park image URL
 * @param {object} park - Park object with picture property
 * @returns {string} - Image URL or fallback to placeholder
 */
export const getParkImageUrl = (park) => {
  return getImageUrl(park?.picture, '/images/park-placeholder.jpg');
};

/**
 * Check if an image URL is valid/accessible
 * @param {string} url - Image URL to check
 * @returns {Promise<boolean>} - Whether the image is accessible
 */
export const isImageAccessible = async (url) => {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Get image dimensions
 * @param {string} url - Image URL
 * @returns {Promise<Object>} - Image dimensions with width and height properties
 */
export const getImageDimensions = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = url;
  });
};
