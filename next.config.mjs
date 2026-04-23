/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  // PostgreSQL — no local DB file needed
  // outputFileTracingIncludes removed (was for SQLite)
};

export default nextConfig;
