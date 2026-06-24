import type { MetadataRoute } from "next"

// Required for `output: export` — generate the sitemap at build time.
export const dynamic = "force-static"

const BASE_URL = "https://paipan.tw"

// Static sitemap for the export. Trailing slashes match `trailingSlash: true`.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/how-it-works/", "/faq/", "/about/", "/privacy/", "/terms/"]
  return paths.map((path) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }))
}
