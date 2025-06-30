"use client"

import { useAuth } from "@/hooks/use-auth"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { LandlordDashboard } from "@/components/dashboard/landlord-dashboard"
import { TenantDashboard } from "@/components/dashboard/tenant-dashboard"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { DebugAuth } from "@/components/debug-auth"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  const renderContent = () => {
    if (user?.role === "admin") {
      return <AdminDashboard />
    } else if (user?.role === "landlord") {
      return <LandlordDashboard />
    } else if (user?.role === "tenant") {
      return <TenantDashboard />
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || user?.email}
          </p>
        </div>
        
        {/* Temporary Debug Component */}
        <DebugAuth />
        
        {renderContent()}
      </div>
    </DashboardLayout>
  )
}
