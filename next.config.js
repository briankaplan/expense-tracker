/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add any custom webpack configuration here
    return config;
  }
}

module.exports = nextConfig; 