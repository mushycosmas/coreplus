/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  typescript: {
    // Ignores build errors from TypeScript
    ignoreBuildErrors: true,
  },

  eslint: {
    // Ignores ESLint errors during build
    ignoreDuringBuilds: true,
  },

  images: {
    domains: [
      'coreplus.co.tz',        // your domain
      'upload.wikimedia.org',  // external images
    ],
  },

  // Helps with multiple lockfiles warning
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;
