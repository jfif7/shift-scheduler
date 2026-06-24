// Shared AdSense configuration.
// The publisher id is public (it ships in the page anyway), so a build-time
// NEXT_PUBLIC_* env var is the right home for it. Falls back to the known id so
// the loader keeps working even when the env var is not configured locally.
export const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-8612728828421603"
