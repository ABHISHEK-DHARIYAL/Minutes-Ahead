import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/ml/:path*",
        destination: `${process.env.ML_API_URL || "http://localhost:8001"}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "gibs.earthdata.nasa.gov" },
      { protocol: "https", hostname: "noaa-himawari9.s3.amazonaws.com" },
    ],
  },
};

export default nextConfig;
