import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict mode for development
  reactStrictMode: true,

  // Standalone output for Docker deployment
  output: "standalone",

  // Enable experimental features for better performance
  experimental: {
    // Optimize package imports for smaller bundles
    optimizePackageImports: ["lucide-react"],
  },

  // Image optimization configuration
  images: {
    // Remote patterns for AI-generated images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Modern formats for better compression
    formats: ["image/avif", "image/webp"],
    // Minimize image sizes
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Headers for caching and security
  async headers() {
    return [
      {
        // Static assets caching
        source: "/:path*.(ico|svg|png|jpg|jpeg|gif|webp|avif|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // JS and CSS caching
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Security headers for all pages
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Compression is enabled by default in production
  compress: true,

  // Generate ETags for better caching
  generateEtags: true,

  // Production source maps (disabled for smaller bundles)
  productionBrowserSourceMaps: false,
};

export default nextConfig;
