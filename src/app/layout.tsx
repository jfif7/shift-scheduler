import type { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner"
import { LocaleProvider } from "@/contexts/LocaleContext"
import "./globals.css"

export const metadata: Metadata = {
  title: "班表管理系統",
  description: "管理員工班表，非常好設定",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <LocaleProvider>
          <div className="min-h-screen bg-background">
            <main>{children}</main>
          </div>
          <Toaster />
        </LocaleProvider>
      </body>
    </html>
  )
}
