import { useCallback } from "react"

interface ToastOptions {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export const useToast = () => {
  const toast = useCallback((options: ToastOptions) => {
    const { title, description, variant = "default" } = options
    console.log(`[Toast - ${variant}] ${title}: ${description || ""}`)
    // Replace this with actual toast implementation (e.g., using a library like react-toastify)
  }, [])

  return { toast }
}
