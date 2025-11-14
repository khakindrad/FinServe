/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 👈 replaces the old `next export`
  images: {
    unoptimized: true, // optional: required if you use <Image> component
  },
  trailingSlash: true, // optional: helps for static hosting
};

module.exports = nextConfig;
