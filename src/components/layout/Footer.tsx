import Link from "next/link"

const LINKS = [
  { href: "/", label: "排班工具" },
  { href: "/how-it-works", label: "運作原理" },
  { href: "/faq", label: "常見問題" },
  { href: "/about", label: "關於" },
  { href: "/privacy", label: "隱私權政策" },
  { href: "/terms", label: "使用條款" },
]

/**
 * Site footer with navigation to the documentation and legal pages.
 * Server-rendered (no translations) so its links land in the static HTML and
 * the site reads as a coherent, navigable property.
 */
export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-12">
      <div className="container mx-auto max-w-5xl px-6 py-8 text-sm text-muted-foreground">
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-foreground transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <p className="mt-4">© 2026 班表管理系統 · 醫院人力排班系統</p>
      </div>
    </footer>
  )
}
