"use client"

import { useAuth } from "@/hooks/use-auth"
import { AdminPropertyManagement } from "@/components/dashboard/admin-property-management"
import { LandlordDashboard } from "@/components/dashboard/landlord-dashboard"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function PropertiesPage() {
  const { user, refresh } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams.get("premium") === "success") {
      toast({
        title: "Premium Activated!",
        description: "You have successfully upgraded to premium. Enjoy unlimited listings!",
      })
      // Optionally refresh user data
      if (typeof refresh === "function") refresh()
      // Remove the query param from the URL
      router.replace("/dashboard/properties", { scroll: false })
    }
  }, [searchParams, toast, refresh, router])

  const renderContent = () => {
    if (user?.role === "admin") {
      return <AdminPropertyManagement />
    } else if (user?.role === "landlord") {
      return <LandlordDashboard />
    }
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Access denied</p>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user?.role === "admin" ? "Property Management" : "My Properties"}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === "admin" 
              ? "Review and approve property listings" 
              : "Manage your property listings"
            }
          </p>
        </div>
        {renderContent()}
      </div>
    </DashboardLayout>
  )
}
