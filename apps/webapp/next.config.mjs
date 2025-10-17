/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
    typedRoutes: true,
    scrollRestoration: true
  }
};

export default nextConfig;
