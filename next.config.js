/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      { source: '/.well-known/:path*', headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }] },
      { source: '/XCP.png', headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }] },
    ];
  },
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
