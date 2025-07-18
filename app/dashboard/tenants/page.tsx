"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"

export default function TenantsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground">
            Manage your tenants and view their information here.
          </p>
        </div>
        {/* Add tenant management UI here */}
      </div>
    </DashboardLayout>
  )
} 