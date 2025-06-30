"use client"

import { useContext } from "react"
import { AuthContext, type AuthContextType } from "@/components/providers/auth-provider"

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

// Default export for compatibility
export default useAuth

// Re-export types for convenience
export type { User, AuthContextType } from "@/components/providers/auth-provider"
