"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { LogOut, UserIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export function AuthStatus() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleLogin = () => {
    router.push("/login")
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast.info("Signed out successfully.")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to sign out. Please try again.")
    }
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.photoURL || ""}
                alt={user.displayName || "User"}
              />
              <AvatarFallback>
                {user.displayName ? (
                  user.displayName[0]
                ) : (
                  <UserIcon className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.displayName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      onClick={handleLogin}
      variant="outline"
      size="sm"
      title="Login to sync your data across devices"
    >
      <UserIcon className="mr-2 h-4 w-4" />
      Login
    </Button>
  )
}
