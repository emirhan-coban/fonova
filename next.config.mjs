/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  outputFileTracingIncludes: {
    "/*": ["./prisma/dev.db"]
  }
};

export default nextConfig;
