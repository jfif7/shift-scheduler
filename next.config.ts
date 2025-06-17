import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NODE_ENV === "development" ? "" : "/shift-scheduler",
  trailingSlash: true,
  distDir: "dist",
  images: {
    unoptimized: true,
  },
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
