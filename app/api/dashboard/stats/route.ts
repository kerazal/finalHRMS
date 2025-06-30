import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const role = searchParams.get("role")

    if (!userId || !role) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    let stats = {}

    switch (role) {
      case "admin":
        // Get admin stats
        const [usersCount, propertiesCount, paymentsSum] = await Promise.all([
          supabase.from("users").select("id", { count: "exact" }),
          supabase.from("properties").select("id", { count: "exact" }),
          supabase.from("payments").select("amount").eq("status", "completed"),
        ])

        const totalRevenue = paymentsSum.data?.reduce((sum, payment) => sum + payment.amount, 0) || 0

        stats = {
          totalUsers: usersCount.count || 0,
          activeProperties: propertiesCount.count || 0,
          monthlyRevenue: totalRevenue,
        }
        break

      case "landlord":
        // Get landlord stats
        const [myProperties, rentals, tenants] = await Promise.all([
          supabase.from("properties").select("id", { count: "exact" }).eq("landlord_id", userId),
          supabase.from("rentals").select("monthly_rent").eq("landlord_id", userId).eq("status", "active"),
          supabase
            .from("rentals")
            .select("tenant_id", { count: "exact" })
            .eq("landlord_id", userId)
            .eq("status", "active"),
        ])

        const monthlyIncome = rentals.data?.reduce((sum, rental) => sum + rental.monthly_rent, 0) || 0

        stats = {
          myProperties: myProperties.count || 0,
          monthlyIncome,
          activeTenants: tenants.count || 0,
          pendingBookings: 3, // Mock data
        }
        break

      case "tenant":
        // Get tenant stats
        const [rental, maintenanceRequests] = await Promise.all([
          supabase.from("rentals").select("monthly_rent").eq("tenant_id", userId).eq("status", "active").single(),
          supabase.from("maintenance_requests").select("id", { count: "exact" }).eq("tenant_id", userId),
        ])

        stats = {
          monthlyRent: rental.data?.monthly_rent || 0,
          maintenanceRequests: maintenanceRequests.count || 0,
          unreadMessages: 3, // Mock data
        }
        break
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Stats fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
