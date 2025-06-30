import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const landlordId = searchParams.get("landlordId")

    if (!landlordId) {
      return NextResponse.json({ error: "Landlord ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("rentals")
      .select(`
        *,
        tenant:users!rentals_tenant_id_fkey(id, name, email),
        property:properties(title)
      `)
      .eq("landlord_id", landlordId)
      .eq("status", "active")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Transform data for easier use
    const transformedData = data.map((rental) => ({
      ...rental.tenant,
      property_title: rental.property?.title,
      monthly_rent: rental.monthly_rent,
      start_date: rental.start_date,
      end_date: rental.end_date,
    }))

    return NextResponse.json({ tenants: transformedData })
  } catch (error) {
    console.error("Tenants fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
