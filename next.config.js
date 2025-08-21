/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/:asset.json',
        destination: '/data/assets/:asset.json',
      },
    ];
  },
};

module.exports = nextConfig;