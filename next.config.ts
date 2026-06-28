import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    const apiUrl = process.env.API_URL ?? 'https://kgloto.com';
    return [
      {
        source: '/api/v2/:path*',
        destination: `${apiUrl}/api/v2/:path*`,
      },
    ];
  },
};

export default nextConfig;
