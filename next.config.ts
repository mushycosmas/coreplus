/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // allow serving images from public/uploads without optimization errors
  images: {
    unoptimized: true,
  },

  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;
