'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getImageUrl } from '../../utils/imageUtils';

const ImageDisplay = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  fill = false,
  placeholder = 'default',
  placeholderIcon = 'image',
  placeholderText = 'No Image',
  onError = null
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Determine fallback based on placeholder type
  const getFallbackImage = () => {
    switch (placeholder) {
      case 'district':
        return '/images/district-placeholder.jpg';
      case 'park':
        return '/images/park-placeholder.jpg';
      default:
        return '/images/park-placeholder.jpg';
    }
  };

  const imageUrl = getImageUrl(src, getFallbackImage());
  const shouldShowPlaceholder = !imageUrl || imageError;

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
    if (onError) onError();
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const getPlaceholderIcon = () => {
    switch (placeholderIcon) {
      case 'district':
        return (
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'park':
        return (
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        );
      case 'user':
        return (
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  const getPlaceholderBackground = () => {
    switch (placeholder) {
      case 'district':
        return 'bg-gradient-to-br from-blue-100 to-green-100';
      case 'park':
        return 'bg-gradient-to-br from-green-100 to-blue-100';
      case 'error':
        return 'bg-gradient-to-br from-red-100 to-red-200';
      default:
        return 'bg-gradient-to-br from-gray-100 to-gray-200';
    }
  };

  if (shouldShowPlaceholder) {
    return (
      <div className={`flex items-center justify-center ${getPlaceholderBackground()} ${className}`}>
        <div className="text-center">
          {getPlaceholderIcon()}
          <p className="text-gray-500 text-sm font-medium mt-2">{placeholderText}</p>
          {imageError && (
            <p className="text-gray-400 text-xs">Failed to load</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center ${getPlaceholderBackground()}`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
        </div>
      )}
      <Image
        src={imageUrl}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        unoptimized // For external URLs
      />
    </div>
  );
};

export default ImageDisplay;
