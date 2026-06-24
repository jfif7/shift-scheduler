import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { LocaleProvider } from "@/contexts/LocaleContext"
import { AuthProvider } from "@/contexts/AuthContext"
import { AuthGuard } from "@/components/auth/AuthGuard"
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
  title: "班表管理系統",
  description: "管理員工班表，非常好設定",
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <AdSenseScript />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <LocaleProvider>
            <AuthGuard>
              <div className="min-h-screen bg-background">
                <main>{children}</main>
              </div>
            </AuthGuard>
            <Footer />
            <Toaster />
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
