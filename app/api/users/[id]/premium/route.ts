import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    // Update user to premium status
    const { data, error } = await supabase
      .from("users")
      .update({ premium: true })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Premium activation error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      user: data,
      message: "Premium status activated successfully"
    })
  } catch (error) {
    console.error("Premium activation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 