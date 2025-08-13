'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      image: '/images/park1.jpg',
      title: '🌲 Explore Nature',
      description: 'Discover the beauty of our parks and natural reserves with breathtaking landscapes.',
      gradient: 'from-emerald-600 to-teal-600'
    },
    {
      image: '/images/park2.jpg',
      title: '👨‍👩‍👧‍👦 Family Adventures',
      description: 'Create lasting memories with your loved ones in our family-friendly parks.',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      image: '/images/park3.jpg',
      title: '🎫 Easy Booking',
      description: 'Book your tickets online with just a few clicks and skip the queues.',
      gradient: 'from-purple-600 to-pink-600'
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full opacity-10 animate-bounce"></div>
      </div>

      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 transform ${
            index === currentSlide
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-105'
          }`}
        >
          <div className="relative h-full w-full">
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-80`} />
          </div>
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center text-center z-10">
        <div className="container mx-auto px-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 animate-fadeInUp">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-6 animate-fadeInDown">
              {slides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10 leading-relaxed animate-fadeInUp animate-delay-200">
              {slides[currentSlide].description}
            </p>
            <Link
              href="#district-selection"
              className="group inline-flex items-center px-10 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white text-xl font-semibold rounded-2xl hover:from-emerald-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl animate-fadeInUp animate-delay-400"
            >
              <svg className="w-6 h-6 mr-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Select Your District ✨
            </Link>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;