import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const role = searchParams.get("role")
    const timeRange = searchParams.get("timeRange") || "30d"

    if (!userId || !role) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7)
        break
      case "30d":
        startDate.setDate(endDate.getDate() - 30)
        break
      case "90d":
        startDate.setDate(endDate.getDate() - 90)
        break
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }

    let analytics = {
      revenue: { current: 0, previous: 0, change: 0 },
      properties: { current: 0, previous: 0, change: 0 },
      tenants: { current: 0, previous: 0, change: 0 },
      occupancy: { current: 0, previous: 0, change: 0 },
    }

    if (role === "admin") {
      // Admin analytics - platform-wide stats
      const [usersCount, propertiesCount, paymentsSum] = await Promise.all([
        supabase.from("users").select("id", { count: "exact" }),
        supabase.from("properties").select("id", { count: "exact" }),
        supabase
          .from("payments")
          .select("amount")
          .eq("status", "completed")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString()),
      ])

      const totalRevenue = paymentsSum.data?.reduce((sum, payment) => sum + payment.amount, 0) || 0
      const occupiedProperties = await supabase
        .from("properties")
        .select("id", { count: "exact" })
        .eq("available", false)
      const occupancyRate = propertiesCount.count
        ? Math.round((occupiedProperties.count / propertiesCount.count) * 100)
        : 0

      analytics = {
        revenue: { current: totalRevenue, previous: totalRevenue * 0.9, change: 11 },
        properties: { current: propertiesCount.count || 0, previous: (propertiesCount.count || 0) * 0.95, change: 5 },
        tenants: { current: usersCount.count || 0, previous: (usersCount.count || 0) * 0.92, change: 8 },
        occupancy: { current: occupancyRate, previous: occupancyRate - 3, change: 3 },
      }
    } else if (role === "landlord") {
      // Landlord analytics - their properties only
      const [myProperties, rentals] = await Promise.all([
        supabase.from("properties").select("id", { count: "exact" }).eq("landlord_id", userId),
        supabase.from("rentals").select("monthly_rent").eq("landlord_id", userId).eq("status", "active"),
      ])

      const monthlyIncome = rentals.data?.reduce((sum, rental) => sum + rental.monthly_rent, 0) || 0
      const activeTenants = rentals.data?.length || 0
      const occupancyRate = myProperties.count ? Math.round((activeTenants / myProperties.count) * 100) : 0

      analytics = {
        revenue: { current: monthlyIncome, previous: monthlyIncome * 0.88, change: 12 },
        properties: { current: myProperties.count || 0, previous: (myProperties.count || 0) - 1, change: 1 },
        tenants: { current: activeTenants, previous: activeTenants - 1, change: 1 },
        occupancy: { current: occupancyRate, previous: occupancyRate - 5, change: 5 },
      }
    }

    // Generate mock chart data
    const chartData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i, 1).toLocaleDateString("en", { month: "short" }),
      revenue: Math.floor(Math.random() * 10000) + 5000,
      properties: Math.floor(Math.random() * 50) + 10,
    }))

    return NextResponse.json({ analytics, chartData })
  } catch (error) {
    console.error("Analytics fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
