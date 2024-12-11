/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ["www.google.com", "www.facebook.com"],
  },
};

module.exports = nextConfig;
