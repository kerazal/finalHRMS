import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Check if the user exists and is verified by admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 400 })
    }

    // Only allow admin-verified users
    if (!userData.verified) {
      return NextResponse.json({ 
        error: "Account not verified. Please wait for admin approval." 
      }, { status: 400 })
    }

    // Try to sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      // If email not confirmed but user is admin-verified, allow login
      if (authError.message.includes("Email not confirmed") && userData.verified) {
        // Create a custom session for admin-verified users
        return NextResponse.json({
          message: "Login successful (admin verified)",
          user: {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            verified: userData.verified,
            premium: userData.premium,
          },
          adminVerified: true,
          // Note: This is a special case for admin-verified users
        })
      }
      
      // Handle other auth errors
      if (authError.message.includes("Invalid login credentials")) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 400 })
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Login failed" }, { status: 400 })
    }

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        verified: userData.verified,
        premium: userData.premium,
      },
      session: authData.session,
      token: authData.session?.access_token,
    })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 