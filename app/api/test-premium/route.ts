import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Check environment variables first
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasChapaKey: !!process.env.CHAPA_SECRET_KEY,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || "localhost"
    }

    // If Supabase is not configured, return error
    if (!envCheck.hasSupabaseUrl || !envCheck.hasSupabaseKey) {
      return NextResponse.json({
        error: "Supabase not configured",
        details: "Missing Supabase environment variables",
        environment: envCheck
      }, { status: 500 })
    }

    // Test database connection
    let users: any[] = []
    let payments: any[] = []
    let dbError: string | null = null

    try {
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, email, name, role, premium")
        .limit(5)

      if (usersError) {
        dbError = `Users query error: ${usersError.message}`
      } else {
        users = usersData || []
      }
    } catch (error) {
      dbError = `Users query exception: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    try {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("id, type, status, amount")
        .limit(5)

      if (paymentsError) {
        dbError = dbError ? `${dbError}; Payments query error: ${paymentsError.message}` : `Payments query error: ${paymentsError.message}`
      } else {
        payments = paymentsData || []
      }
    } catch (error) {
      dbError = dbError ? `${dbError}; Payments query exception: ${error instanceof Error ? error.message : 'Unknown error'}` : `Payments query exception: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    if (dbError) {
      return NextResponse.json({
        error: "Database connection issues",
        details: dbError,
        environment: envCheck,
        partialData: { users, payments }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      users: users,
      payments: payments,
      environment: envCheck
    })
  } catch (error) {
    console.error("Test premium error:", error)
    return NextResponse.json({ 
      error: "Test failed", 
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 