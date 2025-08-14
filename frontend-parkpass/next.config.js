/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3002',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
  env: {
    // kept for legacy usage, but prefer NEXT_PUBLIC_API_URL below
    API_URL: process.env.API_URL || 'http://localhost:3002/api',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api',
    NEXT_PUBLIC_FILES_URL: process.env.NEXT_PUBLIC_FILES_URL || 'http://localhost:3002',
  },
};

module.exports = nextConfig;
