/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    WORDWARE_API_KEY: process.env.WORDWARE_API_KEY,
  },
};

module.exports = nextConfig;
