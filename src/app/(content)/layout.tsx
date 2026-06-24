import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Link from "next/link"
import { AdSenseScript } from "@/components/ads/AdSenseScript"
import { Footer } from "@/components/layout/Footer"
import "../globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "班表管理系統 — 醫院人力排班系統",
    template: "%s — 班表管理系統",
  },
  description:
    "醫院人力排班系統的說明文件、運作原理、常見問題與政策說明。免費線上產生每月班表並匯出。",
}

/**
 * Root layout for the documentation and legal pages. Deliberately does NOT wrap
 * children in the auth/locale providers used by the tool — those gate rendering
 * behind client-side state, which would leave these pages as an empty shell to
 * crawlers. Here everything is server-rendered so the text is in the static HTML.
 */
export default function ContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-Hant-TW" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <AdSenseScript />
      </head>
      <body className="font-sans antialiased">
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <header className="border-b">
            <div className="container mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
              <Link href="/" className="font-semibold">
                班表管理系統
              </Link>
              <nav className="flex gap-4 text-sm text-muted-foreground">
                <Link href="/how-it-works" className="hover:text-foreground">
                  運作原理
                </Link>
                <Link href="/faq" className="hover:text-foreground">
                  常見問題
                </Link>
                <Link href="/about" className="hover:text-foreground">
                  關於
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
