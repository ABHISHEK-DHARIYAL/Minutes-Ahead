import type { NextConfig } from "next";

const isExport = process.env.STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: isExport ? "export" : undefined,
  assetPrefix: isExport ? "/next_static" : undefined,
  images: isExport
    ? { unoptimized: true }
    : {
        remotePatterns: [
          { protocol: "https", hostname: "gibs.earthdata.nasa.gov" },
          { protocol: "https", hostname: "noaa-himawari9.s3.amazonaws.com" },
        ],
      },
  ...(isExport
    ? {}
    : {
        async rewrites() {
          return [
            {
              source: "/api/ml/:path*",
              destination: `${process.env.ML_API_URL || "http://localhost:8001"}/:path*`,
            },
          ];
        },
      }),
};

export default nextConfig;
