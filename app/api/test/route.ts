import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.from("users").select("count").limit(1)
    
    if (error) {
      return NextResponse.json({ 
        status: "error", 
        message: "Supabase connection failed", 
        error: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      status: "success", 
      message: "Supabase connection working",
      env: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "not set",
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "not set"
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      status: "error", 
      message: "Test failed", 
      error: String(error) 
    }, { status: 500 })
  }
} 