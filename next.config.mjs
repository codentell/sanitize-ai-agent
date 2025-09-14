/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@genkit-ai/ai', '@genkit-ai/core']
  }
};

export default nextConfig;
