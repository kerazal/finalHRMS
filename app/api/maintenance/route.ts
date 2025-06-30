import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const role = searchParams.get("role")
    const landlord_id = searchParams.get("landlord_id")

    let query = supabaseAdmin.from("maintenance_requests").select(`
        *,
        tenant:users!maintenance_requests_tenant_id_fkey(name),
        landlord:users!maintenance_requests_landlord_id_fkey(name),
        property:properties!maintenance_requests_property_id_fkey(title)
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

    // Transform data for easier use
    const transformedData = data.map((request) => ({
      ...request,
      tenant_name: request.tenant?.name,
      landlord_name: request.landlord?.name,
      property_title: request.property?.title,
    }))

    return NextResponse.json({ requests: transformedData })
  } catch (error) {
    console.error("Maintenance requests fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json()

    const { data, error } = await supabaseAdmin.from("maintenance_requests").insert(requestData).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ request: data })
  } catch (error) {
    console.error("Maintenance request creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
