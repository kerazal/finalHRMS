import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()

    const { data, error } = await supabase.from("properties").update(updates).eq("id", params.id).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ property: data })
  } catch (error) {
    console.error("Property update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from("properties").delete().eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: "Property deleted successfully" })
  } catch (error) {
    console.error("Property deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: property, error } = await supabase
      .from("properties")
      .select(`*, landlord:users!properties_landlord_id_fkey(id, name, email, phone, profile_picture_url)`)
      .eq("id", params.id)
      .single()

    if (error || !property) {
      return NextResponse.json({ error: error?.message || "Property not found" }, { status: 404 })
    }

    return NextResponse.json({ property })
  } catch (error) {
    console.error("Property fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
