/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/:asset.json',
        destination: '/api/:asset',
      },
    ];
  },
};

module.exports = nextConfig;