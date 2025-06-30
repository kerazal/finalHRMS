"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Crown, CheckCircle, AlertCircle } from "lucide-react"

export function PremiumTest() {
  const { user, refresh } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)

  const testPremiumStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token: localStorage.getItem("auth_token") || 
                 document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setTestResults({
          user: data.user,
          premium: data.user.premium,
          timestamp: new Date().toISOString()
        })
        toast({
          title: "Test Complete",
          description: `Premium status: ${data.user.premium ? 'Active' : 'Inactive'}`,
        })
      }
    } catch (error) {
      console.error("Test error:", error)
      toast({
        title: "Test Failed",
        description: "Failed to test premium status",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testPaymentCreation = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const response = await fetch("/api/payments/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.name || user.email?.split('@')[0] || 'User'
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Payment Session Created",
          description: "Payment session created successfully. Check console for details.",
        })
        console.log("Payment session:", data)
      } else {
        toast({
          title: "Payment Creation Failed",
          description: data.error || "Failed to create payment session",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Payment test error:", error)
      toast({
        title: "Test Failed",
        description: "Failed to test payment creation",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUserData = async () => {
    if (typeof refresh === "function") {
      await refresh()
      toast({
        title: "User Data Refreshed",
        description: "User data has been updated",
      })
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Premium Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please log in to test premium functionality.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Premium Functionality Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <p className="font-medium">Current Status</p>
            <p className="text-sm text-muted-foreground">
              User: {user.name} ({user.email})
            </p>
          </div>
          <Badge variant={user.premium ? "default" : "secondary"}>
            {user.premium ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Premium
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1" />
                Premium
              </>
            )}
          </Badge>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="font-medium text-blue-900 dark:text-blue-100">Test Results</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Premium: {testResults.premium ? 'Active' : 'Inactive'}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Tested at: {new Date(testResults.timestamp).toLocaleString()}
            </p>
          </div>
        )}

        {/* Test Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={testPremiumStatus} 
            disabled={isLoading}
            variant="outline"
          >
            Test Premium Status
          </Button>
          
          <Button 
            onClick={testPaymentCreation} 
            disabled={isLoading || user.premium}
            variant="outline"
          >
            Test Payment Creation
          </Button>
          
          <Button 
            onClick={refreshUserData} 
            disabled={isLoading}
            variant="outline"
          >
            Refresh User Data
          </Button>
        </div>

        {/* Environment Info */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="font-medium text-sm">Environment Info</p>
          <p className="text-xs text-muted-foreground">
            Base URL: {process.env.NEXT_PUBLIC_BASE_URL || 'Not set'}
          </p>
          <p className="text-xs text-muted-foreground">
            Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 