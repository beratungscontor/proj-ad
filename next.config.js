/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_CLIENT_ID: process.env.NEXT_PUBLIC_CLIENT_ID,
    NEXT_PUBLIC_TENANT_ID: process.env.NEXT_PUBLIC_TENANT_ID,
    NEXT_PUBLIC_AUTHORITY: process.env.NEXT_PUBLIC_AUTHORITY,
    GRAPH_API_ENDPOINT: process.env.GRAPH_API_ENDPOINT,
  },
};

module.exports = nextConfig;