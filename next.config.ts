import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NODE_ENV === "development" ? "" : "/shift-scheduler",
  trailingSlash: true,
  distDir: "dist",
  images: {
    unoptimized: true,
  },
}

export default nextConfig
