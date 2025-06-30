"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { User, Shield, AlertCircle } from "lucide-react"

export function DebugAuth() {
  const { user, isLoading } = useAuth()
  const { toast } = useToast()
  const [testResult, setTestResult] = useState<any>(null)
  const [isTesting, setIsTesting] = useState(false)

  const testAuth = async () => {
    setIsTesting(true)
    try {
      // First check environment
      const envResponse = await fetch("/api/env-check")
      const envData = await envResponse.json()
      
      if (!envResponse.ok) {
        toast({
          title: "Environment Check Failed",
          description: envData.error || "Failed to check environment",
          variant: "destructive"
        })
        setTestResult({ error: "Environment check failed", envData })
        return
      }

      // Then test premium functionality
      const response = await fetch("/api/test-premium")
      const data = await response.json()
      setTestResult({ ...data, envData })
      
      if (response.ok) {
        toast({
          title: "Test Successful",
          description: "Premium functionality is working correctly",
        })
      } else {
        toast({
          title: "Test Failed",
          description: data.error || "Failed to test premium functionality",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Test error:", error)
      toast({
        title: "Test Error",
        description: "Failed to run test",
        variant: "destructive"
      })
    } finally {
      setIsTesting(false)
    }
  }

  const checkToken = () => {
    const token = localStorage.getItem("auth_token") || 
                 document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1]
    
    toast({
      title: "Token Status",
      description: token ? "Token found" : "No token found",
    })
    
    console.log("Auth token:", token)
    console.log("User object:", user)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Debug Auth</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Authentication Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current User Status */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">User Status</span>
            <Badge variant={user ? "default" : "destructive"}>
              {user ? "Logged In" : "Not Logged In"}
            </Badge>
          </div>
          
          {user ? (
            <div className="space-y-1 text-sm">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Verified:</strong> {user.verified ? "Yes" : "No"}</p>
              <p><strong>Premium:</strong> {user.premium ? "Yes" : "No"}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">No user data available</p>
          )}
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">Test Results</p>
            <div className="text-sm space-y-1">
              <p><strong>Success:</strong> {testResult.success ? "Yes" : "No"}</p>
              {testResult.error && (
                <p><strong>Error:</strong> {testResult.error}</p>
              )}
              {testResult.details && (
                <p><strong>Details:</strong> {testResult.details}</p>
              )}
              <p><strong>Users Found:</strong> {testResult.users?.length || 0}</p>
              <p><strong>Payments Found:</strong> {testResult.payments?.length || 0}</p>
              {testResult.envData?.environment && (
                <div className="mt-2">
                  <p><strong>Environment Variables:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>Supabase URL: {testResult.envData.environment.NEXT_PUBLIC_SUPABASE_URL}</li>
                    <li>Supabase Key: {testResult.envData.environment.NEXT_PUBLIC_SUPABASE_ANON_KEY}</li>
                    <li>Service Role Key: {testResult.envData.environment.SUPABASE_SERVICE_ROLE_KEY}</li>
                    <li>Chapa Key: {testResult.envData.environment.CHAPA_SECRET_KEY}</li>
                    <li>Base URL: {testResult.envData.environment.NEXT_PUBLIC_BASE_URL}</li>
                    <li>Node Env: {testResult.envData.environment.NODE_ENV}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={testAuth} 
            disabled={isTesting}
            variant="outline"
          >
            {isTesting ? "Testing..." : "Test Premium System"}
          </Button>
          
          <Button 
            onClick={checkToken}
            variant="outline"
          >
            Check Token
          </Button>
        </div>

        {/* Debug Info */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            Debug Info
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Check browser console for detailed logs. If you see "authentication required" 
            but you're logged in, the issue might be with the user object not being 
            properly populated with premium status.
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 