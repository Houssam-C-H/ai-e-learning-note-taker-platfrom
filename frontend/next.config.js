/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Only proxy to external backend when NEXT_PUBLIC_API_URL is explicitly set.
  // When it is empty (standalone / no-Docker mode), Next.js serves its own
  // /app/api/ route handlers directly — no proxy needed.
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
      return []; // serve Next.js API routes locally
    }
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
