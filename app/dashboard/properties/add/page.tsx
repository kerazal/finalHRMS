"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { LandlordDashboard } from "@/components/dashboard/landlord-dashboard"

export default function AddPropertyPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Property</h1>
          <p className="text-muted-foreground">
            List a new property for rent
          </p>
        </div>
        <LandlordDashboard />
      </div>
    </DashboardLayout>
  )
} 