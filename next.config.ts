/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  typescript: {
    // ✅ Ignores build errors from TypeScript
    ignoreBuildErrors: true,
  },

  eslint: {
    // ✅ Ignores ESLint errors during build
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
