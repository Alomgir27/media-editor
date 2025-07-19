/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  transpilePackages: [
    '@designcombo/events',
    '@designcombo/frames',
    '@designcombo/state',
    '@designcombo/timeline',
    '@designcombo/types',
    '@interactify/infinite-viewer',
    '@interactify/moveable',
    '@interactify/selection',
  ],
  webpack: (config) => {
    // Add any custom webpack configurations if needed
    return config;
  },
};

module.exports = nextConfig; 