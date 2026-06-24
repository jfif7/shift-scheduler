import { ADSENSE_CLIENT_ID } from "./adsense"

/**
 * Loads the Google AdSense script. Rendered in the <head> of each root layout.
 * The loader alone is policy-compliant; actual ad units (<AdUnit/>) must only be
 * placed on content pages, never on the tool screens.
 */
export function AdSenseScript() {
  if (!ADSENSE_CLIENT_ID) return null
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
    />
  )
}
