"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FcGoogle } from "react-icons/fc"
import { ArrowLeft, Shield, RotateCcw, Cloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { user, signInWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
      toast.success("Successfully signed in!")
      router.push("/")
    } catch (error) {
      console.error("Sign in error:", error)
      toast.error("Failed to sign in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToApp = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToApp}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue without login
          </Button>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Sync your schedules across devices and never lose your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Benefits */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Cloud className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>Sync data across all your devices</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Secure cloud backup of your schedules</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <span>Real-time collaboration features</span>
              </div>
            </div>

            {/* Login Options */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-center">
                Choose your login method:
              </div>
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center gap-3 h-11"
                variant="outline"
              >
                <FcGoogle className="w-5 h-5" />
                {isLoading ? "Signing in..." : "Continue with Google"}
              </Button>

              {/* Future login methods placeholder */}
              <div className="text-xs text-muted-foreground text-center">
                More login options coming soon!
              </div>
            </div>

            {/* Footer */}
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Your data will be securely stored in the cloud</p>
              <p>You can continue using the app without signing in</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
