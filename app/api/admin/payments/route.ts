import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        tenant:users!payments_tenant_id_fkey(name, email),
        landlord:users!payments_landlord_id_fkey(name, email),
        rental:rentals!payments_rental_id_fkey(
          property:properties!rentals_property_id_fkey(title)
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ payments: data })
  } catch (error) {
    console.error("Payments fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
