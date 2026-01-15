/** @type {import('next').NextConfig} */
const nextConfig = {
  // Handle /index.html requests (SFMC compatibility)
  async rewrites() {
    return [
      {
        source: '/index.html',
        destination: '/',
      },
    ];
  },

  // Allow cross-origin access (required by SFMC)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://*.exacttarget.com https://*.marketingcloudapps.com" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
