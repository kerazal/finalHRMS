import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()

    const { data, error } = await supabase
      .from("maintenance_requests")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ request: data })
  } catch (error) {
    console.error("Maintenance request update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
