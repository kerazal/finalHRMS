"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function AuthCallbackPage() {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth callback error:", error)
          toast({
            title: "Verification failed",
            description: "There was an error verifying your email. Please try again.",
            variant: "destructive",
          })
          router.push("/auth/login")
          return
        }

        if (data.session) {
          toast({
            title: "Email verified!",
            description: "Your email has been verified. You can now sign in.",
          })
          router.push("/auth/login")
        } else {
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("Callback error:", error)
        router.push("/auth/login")
      }
    }

    handleAuthCallback()
  }, [router, toast])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verifying your email...</p>
      </div>
    </div>
  )
}
