import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    // First, get the user's email from the users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update the verified status in the users table
    const { error: updateError } = await supabase
      .from("users")
      .update({ verified: true })
      .eq("id", userId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ 
      message: "User verified successfully. They can now log in to the system.",
      user: { id: userId, email: userData.email, verified: true }
    })
  } catch (error) {
    console.error("User verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
