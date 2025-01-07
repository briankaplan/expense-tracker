/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn4.iconfinder.com'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    },
  },
};

module.exports = nextConfig;
