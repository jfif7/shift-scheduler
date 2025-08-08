"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"
import { NextIntlClientProvider } from "next-intl"

type Locale = "en" | "zh-TW"

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh-TW")
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    // Load locale from localStorage on mount
    const savedLocale = localStorage.getItem("locale") as Locale
    if (savedLocale && (savedLocale === "en" || savedLocale === "zh-TW")) {
      setLocaleState(savedLocale)
    }
  }, [])

  useEffect(() => {
    // Load messages for the current locale
    const loadMessages = async () => {
      try {
        const messagesModule = await import(`../../messages/${locale}.json`)
        setMessages(messagesModule.default)
      } catch (error) {
        console.error("Failed to load messages:", error)
      }
    }
    loadMessages()
  }, [locale])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem("locale", newLocale)
  }

  if (!messages) {
    return <div>Loading...</div>
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }
  return context
}
