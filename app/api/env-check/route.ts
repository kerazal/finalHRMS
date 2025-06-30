import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not Set",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not Set",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not Set",
      CHAPA_SECRET_KEY: process.env.CHAPA_SECRET_KEY ? "Set" : "Not Set",
      CHAPA_TEST_SECRET: process.env.CHAPA_TEST_SECRET ? "Set" : "Not Set",
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "Not Set",
      VERCEL_URL: process.env.VERCEL_URL || "Not Set",
      NODE_ENV: process.env.NODE_ENV || "Not Set"
    }

    return NextResponse.json({
      success: true,
      environment: envVars,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Environment check error:", error)
    return NextResponse.json({ 
      error: "Environment check failed", 
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
} 