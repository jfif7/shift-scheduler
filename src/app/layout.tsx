import type { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner"
import { LocaleProvider } from "@/contexts/LocaleContext"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { useTranslations } from "next-intl"
import "./globals.css"

export const metadata: Metadata = {
  title: "Schedule Manager",
  description: "Manage employee schedules with constraints and preferences",
}

function AppHeader() {
  const t = useTranslations("app")

  return (
    <header className="border-b">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <LanguageSwitcher />
      </div>
    </header>
  )
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
            <AppHeader />
            <main>{children}</main>
          </div>
          <Toaster />
        </LocaleProvider>
      </body>
    </html>
  )
}
