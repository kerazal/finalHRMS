"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, User, LogIn } from "lucide-react"

export function AuthStatus() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => window.location.href = "/auth/login"}>
          <LogIn className="h-4 w-4 mr-1" />
          Login
        </Button>
        <Button size="sm" onClick={() => window.location.href = "/auth/register"}>
          Sign Up
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <User className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium">{user.name || user.email}</span>
      </div>
      {user.premium && (
        <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
          <Crown className="h-3 w-3 mr-1" />
          Premium
        </Badge>
      )}
      <Badge variant="outline" className="text-xs">
        {user.role}
      </Badge>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => window.location.href = "/dashboard"}
      >
        Dashboard
      </Button>
    </div>
  )
} 