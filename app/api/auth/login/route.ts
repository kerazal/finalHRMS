import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // First, check if the user exists in our users table and is verified by admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 400 })
    }

    // If user is not verified by admin, deny login
    if (!userData.verified) {
      return NextResponse.json({ 
        error: "Account not verified. Please wait for admin approval or contact support." 
      }, { status: 400 })
    }

    // Try to sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      // Handle specific error cases
      if (authError.message.includes("Email not confirmed")) {
        return NextResponse.json({ 
          error: "Email not confirmed. Please check your email and click the verification link, or contact admin for assistance." 
        }, { status: 400 })
      }
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
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "not set"
  });
}
