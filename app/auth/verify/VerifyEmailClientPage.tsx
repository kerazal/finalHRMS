"use client"

import Link from "next/link"
import { Mail, RefreshCw } from "lucide-react"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

export default function VerifyEmailClientPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [isSending, setIsSending] = useState(false)

  const resend = async () => {
    if (!email) return
    setIsSending(true)
    const res = await fetch("/api/auth/resend-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    setIsSending(false)
    if (res.ok) {
      toast({ title: "Verification sent", description: "Check your inbox again." })
    } else {
      toast({ title: "Error", description: "Unable to resend verification email.", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <Mail className="mx-auto h-12 w-12 text-blue-600" />
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p>
          We’ve sent an email to <span className="font-medium">{email}</span> with a verification link. Click the link
          and come back to{" "}
          <Link className="text-blue-600 underline" href="/auth/login">
            sign in
          </Link>
          .
        </p>
        <Button disabled={isSending} onClick={resend}>
          <RefreshCw className="h-4 w-4 mr-2" /> {isSending ? "Resending…" : "Resend email"}
        </Button>
      </div>
    </div>
  )
}
