/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_WORDWARE_API_KEY: process.env.NEXT_WORDWARE_API_KEY,
  },
};

module.exports = nextConfig;
