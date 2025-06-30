"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { TenantDashboard } from "@/components/dashboard/tenant-dashboard"

export default function RentalsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Rentals</h1>
          <p className="text-muted-foreground">
            View your current rental properties and lease information
          </p>
        </div>
        <TenantDashboard />
      </div>
    </DashboardLayout>
  )
} 