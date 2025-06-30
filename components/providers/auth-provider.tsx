"use client"

import type React from "react"

import { createContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "landlord" | "tenant"
  verified?: boolean
  premium?: boolean
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (formData: FormData) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        // Check both localStorage and cookies for token
        const token = localStorage.getItem("auth_token") || 
                     document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]
        
        if (token) {
          // Verify token with backend
          const response = await fetch("/api/auth/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          })

          if (response.ok) {
            const userData = await response.json()
            setUser(userData.user)
          } else {
            // Clear invalid tokens
            localStorage.removeItem("auth_token")
            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict"
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        // Clear any invalid tokens
        localStorage.removeItem("auth_token")
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict"
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      // First try normal login
      let response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      let data = await response.json()

      // If normal login fails due to email not confirmed, try admin login
      if (!response.ok && data.error && data.error.includes("Email not confirmed")) {
        response = await fetch("/api/auth/admin-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })
        data = await response.json()
      }

      if (!response.ok) {
        if (data.error === "Email not confirmed") {
          toast({
            title: "Email Not Verified",
            description: "Please check your email and verify your account before logging in.",
            variant: "destructive",
          })
          router.push("/auth/verify")
          return
        }
        throw new Error(data.error || "Login failed")
      }

      // Handle admin-verified users without email confirmation
      if (data.adminVerified) {
        localStorage.setItem("auth_token", "admin_verified_" + data.user.id)
        // Set cookie for better session management
        document.cookie = `auth_token=admin_verified_${data.user.id}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`
        setUser(data.user)
        
        toast({
          title: "Login Successful",
          description: "Welcome! Your account has been verified by admin.",
        })
        
        router.push("/dashboard")
        return
      }

      // Normal login flow
      localStorage.setItem("auth_token", data.token)
      // Set cookie for better session management
      document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`
      setUser(data.user)

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })

      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (formData: FormData) => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }
      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account.",
      })
      router.push("/auth/verify")
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear all authentication data
    localStorage.removeItem("auth_token")
    sessionStorage.clear() // Clear any session storage data
    
    // Clear cookies
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict"
    
    // Clear user state
    setUser(null)
    
    // Show logout success message
    toast({
      title: "Successfully Logged Out",
      description: "You have been signed out. Thank you for using our rental management system.",
    })
    
    // Force redirect to home page and prevent back navigation
    router.push("/")
    
    // Additional cleanup to ensure no cached data remains
    setTimeout(() => {
      // Clear any remaining auth-related data
      localStorage.removeItem("user_preferences")
      localStorage.removeItem("dashboard_settings")
      
      // Force a page reload to ensure complete logout
      window.location.href = "/"
    }, 100)
  }

  const refresh = async () => {
    try {
      const token = localStorage.getItem("auth_token") || 
                   document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]
      
      if (token) {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        }
      }
    } catch (error) {
      console.error("Refresh failed:", error)
    }
  }

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    refresh,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
