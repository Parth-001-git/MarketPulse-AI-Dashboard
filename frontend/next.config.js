/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7860',
  },
  experimental: {
    // Enable server actions if needed in future phases
  },
};

module.exports = nextConfig;
