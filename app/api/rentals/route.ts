import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const role = searchParams.get("role")
    const landlord_id = searchParams.get("landlord_id")
    const tenant_id = searchParams.get("tenant_id")

    let query = supabaseAdmin.from("rentals").select(`
        *,
        tenant:users!rentals_tenant_id_fkey(name, email),
        landlord:users!rentals_landlord_id_fkey(name, email),
        property:properties!rentals_property_id_fkey(title)
      `)

    if (role === "tenant") {
      query = query.eq("tenant_id", userId)
    } else if (role === "landlord") {
      query = query.eq("landlord_id", userId)
    }

    // Filter by landlord if specified
    if (landlord_id) {
      query = query.eq("landlord_id", landlord_id)
    }

    // Filter by tenant if specified
    if (tenant_id) {
      query = query.eq("tenant_id", tenant_id)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Transform data for easier use
    const transformedData = data.map((rental) => ({
      ...rental,
      tenant_name: rental.tenant?.name,
      tenant_email: rental.tenant?.email,
      landlord_name: rental.landlord?.name,
      landlord_email: rental.landlord?.email,
      property_title: rental.property?.title,
    }))

    return NextResponse.json({ rentals: transformedData })
  } catch (error) {
    console.error("Rentals fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json()

    const { data, error } = await supabaseAdmin.from("rentals").insert(requestData).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ rental: data })
  } catch (error) {
    console.error("Rental creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 