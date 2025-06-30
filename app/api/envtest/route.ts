import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 })
    }

    // Try to get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: "Invalid token", 
        authError: authError?.message 
      }, { status: 400 })
    }

    // Get user profile from database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (userError) {
      return NextResponse.json({ 
        error: "User not found in database", 
        userError: userError.message 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        verified: userData.verified,
        premium: userData.premium,
      },
      message: "User authentication and role verification successful"
    })
  } catch (error) {
    console.error("Test endpoint error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}