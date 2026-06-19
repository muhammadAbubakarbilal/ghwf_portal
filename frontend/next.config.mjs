// NEXT_PUBLIC_API_URL must be set in Vercel environment variables to your
// backend Vercel deployment URL, e.g. https://ghwf-portal-backend.vercel.app
// In local dev it falls back to the local uvicorn server.
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
