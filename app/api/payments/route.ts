import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const role = searchParams.get("role")
    const landlord_id = searchParams.get("landlord_id")

    let query = supabaseAdmin.from("payments").select(`
      *,
      tenant:users!payments_tenant_id_fkey(name, email),
      landlord:users!payments_landlord_id_fkey(name, email),
      rental:rentals!payments_rental_id_fkey(
        property:properties!rentals_property_id_fkey(title)
      )
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

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Transform data for easier use in dashboard
    const transformedData = data.map((payment) => ({
      ...payment,
      tenant_name: payment.tenant?.name,
      landlord_name: payment.landlord?.name,
      property_title: payment.rental?.property?.title,
    }))

    return NextResponse.json({ payments: transformedData })
  } catch (error) {
    console.error("Payments fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 