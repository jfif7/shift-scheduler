"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { LoginPage } from "@/components/auth/LoginPage"

export default function Login() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      // Redirect to home if already logged in
      router.push("/")
    }
  }, [user, router])

  if (user) {
    return null // Don't show login page if already logged in
  }

  return <LoginPage />
}
