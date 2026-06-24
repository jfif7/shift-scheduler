"use client"

import { useEffect } from "react"
import { ADSENSE_CLIENT_ID } from "./adsense"

interface AdUnitProps {
  /** AdSense ad-unit slot id (create the unit in the AdSense dashboard). */
  slot: string
  /** AdSense ad format. Defaults to responsive "auto". */
  format?: string
  className?: string
}

/**
 * A single responsive AdSense display unit. Place ONLY on content pages
 * (docs / legal), never on the scheduling tool screens — placing ads on
 * behavioral/navigation screens is the policy violation that got the site
 * rejected.
 */
export function AdUnit({ slot, format = "auto", className }: AdUnitProps) {
  useEffect(() => {
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] }
      w.adsbygoogle = w.adsbygoogle || []
      w.adsbygoogle.push({})
    } catch {
      // AdSense script unavailable (not loaded / blocked) — render nothing useful, ignore.
    }
  }, [])

  return (
    <ins
      className={`adsbygoogle block ${className ?? ""}`}
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
