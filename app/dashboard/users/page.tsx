"use client"

import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users and approve new registrations
          </p>
        </div>
        <AdminDashboard />
      </div>
    </DashboardLayout>
  )
} 