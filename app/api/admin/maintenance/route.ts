import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("maintenance_requests")
      .select(`
        *,
        tenant:users!maintenance_requests_tenant_id_fkey(name),
        property:properties!maintenance_requests_property_id_fkey(title)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Transform data for easier use
    const transformedData = data.map((request) => ({
      ...request,
      tenant_name: request.tenant?.name,
      property_title: request.property?.title,
    }))

    return NextResponse.json({ requests: transformedData })
  } catch (error) {
    console.error("Maintenance requests fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
