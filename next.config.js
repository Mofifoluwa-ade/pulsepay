/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors (needed due to viem/ox node_modules type depth issues).
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
