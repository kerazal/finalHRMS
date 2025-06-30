"use client"

import DashboardLayout from "@/components/layout/dashboard-layout"
import { TenantDashboard } from "@/components/dashboard/tenant-dashboard"

export default function DocumentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Access your rental documents, leases, and important files
          </p>
        </div>
        <TenantDashboard />
      </div>
    </DashboardLayout>
  )
} 