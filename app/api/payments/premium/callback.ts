import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tx_ref, status } = body
    
    console.log("Premium callback received:", { tx_ref, status })
    
    if (!tx_ref || !status) {
      console.error("Missing tx_ref or status in callback")
      return NextResponse.json({ error: "Missing tx_ref or status" }, { status: 400 })
    }

    // Find the payment by tx_ref
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("id, landlord_id, status")
      .eq("transaction_id", tx_ref)
      .single()
      
    if (paymentError || !payment) {
      console.error("Payment not found for tx_ref:", tx_ref)
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Only update if not already completed
    if (payment.status !== "completed" && status === "success") {
      console.log("Processing successful payment for user:", payment.landlord_id)
      
      // Mark payment as completed
      const { error: updatePaymentError } = await supabase
        .from("payments")
        .update({ 
          status: "completed", 
          paid_date: new Date().toISOString() 
        })
        .eq("id", payment.id)

      if (updatePaymentError) {
        console.error("Error updating payment:", updatePaymentError)
        return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
      }

      // Set user as premium
      const { error: updateUserError } = await supabase
        .from("users")
        .update({ premium: true })
        .eq("id", payment.landlord_id)

      if (updateUserError) {
        console.error("Error updating user premium status:", updateUserError)
        return NextResponse.json({ error: "Failed to update user premium status" }, { status: 500 })
      }

      console.log("Successfully upgraded user to premium:", payment.landlord_id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Premium callback error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 