/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'connect.veew.vn',
        '*.vercel.app',
        'localhost:3000',
      ],
    },
  },
};

module.exports = nextConfig;
