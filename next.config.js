/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:*']
    }
  },
  images: {
    domains: ['cdn4.iconfinder.com'],
  },
};

module.exports = nextConfig; 