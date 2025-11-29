"use client"

import { useAuth } from "@/contexts/AuthContext"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { loading } = useAuth()

  // Show loading spinner only during Firebase auth initialization
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Allow access regardless of authentication state
  // The app works with localStorage for anonymous users
  // and Firestore for authenticated users
  return <>{children}</>
}
