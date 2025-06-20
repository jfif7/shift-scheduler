"use client"

import React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLocale } from "@/contexts/LocaleContext"
import { Globe } from "lucide-react"

const languages = {
  en: { name: "English", flag: "🇺🇸" },
  "zh-TW": { name: "繁體中文", flag: "🇹🇼" },
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()

  const handleLanguageChange = (value: string) => {
    setLocale(value as "en" | "zh-TW")
  }

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-10 h-10 p-0 border-none hover:bg-muted/50 rounded-md">
        <SelectValue>
          <Globe className="h-5 w-5" />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">
          <span className="flex items-center gap-2">
            <span>{languages.en.flag}</span>
            <span>{languages.en.name}</span>
          </span>
        </SelectItem>
        <SelectItem value="zh-TW">
          <span className="flex items-center gap-2">
            <span>{languages["zh-TW"].flag}</span>
            <span>{languages["zh-TW"].name}</span>
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
