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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'coreplus.co.tz',
        port: '',
        pathname: '/uploads/**', // adjust path if needed
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Helps with multiple lockfiles warning
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;
