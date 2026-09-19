/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co'
      }
    ]
  },
  typescript: {
    tsconfigPath: './tsconfig.json'
  }
};

module.exports = nextConfig;
