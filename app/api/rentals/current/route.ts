import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("rentals")
      .select(`
        *,
        property:properties(*),
        landlord:users!rentals_landlord_id_fkey(name)
      `)
      .eq("tenant_id", userId)
      .eq("status", "active")
      .single()

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ property: null })
    }

    // Transform data for easier use
    const transformedData = {
      ...data.property,
      monthly_rent: data.monthly_rent,
      start_date: data.start_date,
      end_date: data.end_date,
      landlord: data.landlord,
    }

    return NextResponse.json({ property: transformedData })
  } catch (error) {
    console.error("Current rental fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
