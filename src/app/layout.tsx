import type { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner"
import { NextIntlClientProvider } from "next-intl"
import { getLocale } from "next-intl/server"
import "./globals.css"

export const metadata: Metadata = {
  title: "Schedule Manager",
  description: "Manage employee schedules with constraints and preferences",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <div className="min-h-screen bg-background">
            <header className="border-b">
              <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-semibold">Schedule Manager</h1>
              </div>
            </header>
            <main>{children}</main>
          </div>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
