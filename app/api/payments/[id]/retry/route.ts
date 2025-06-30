import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from("payments")
      .update({ status: "pending" })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ payment: data })
  } catch (error) {
    console.error("Payment retry error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
