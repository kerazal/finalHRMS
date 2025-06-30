import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || process.env.CHAPA_TEST_SECRET || "test_CHAPA_SECRET_KEY"
const CHAPA_BASE_URL = "https://api.chapa.co/v1/transaction/initialize"
const PREMIUM_AMOUNT = 100000

export async function POST(request: NextRequest) {
  try {
    const { userId, email, name } = await request.json()
    if (!userId || !email || !name) {
      return NextResponse.json({ error: "Missing user info" }, { status: 400 })
    }

    // Check if user is already premium
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("premium")
      .eq("id", userId)
      .single()

    if (userError) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (existingUser.premium) {
      return NextResponse.json({ error: "User is already premium" }, { status: 400 })
    }

    // Create a payment record in DB (status: pending)
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        landlord_id: userId,
        amount: PREMIUM_AMOUNT,
        type: "premium",
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (paymentError) {
      console.error("Payment creation error:", paymentError)
      return NextResponse.json({ error: "Failed to create payment record" }, { status: 500 })
    }

    // Prepare Chapa payload
    const tx_ref = `premium_${userId}_${Date.now()}`
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || "http://localhost:3000"
    const chapaPayload = {
      amount: PREMIUM_AMOUNT,
      currency: "ETB",
      email,
      first_name: name,
      tx_ref,
      callback_url: `${baseUrl}/api/payments/premium/callback`,
      return_url: `${baseUrl}/dashboard/properties?premium=success`,
      customization: {
        title: "Premium Listing Upgrade",
        description: "Unlock unlimited property listings."
      }
    }

    // Call Chapa API
    const chapaRes = await fetch(CHAPA_BASE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(chapaPayload)
    })
    
    if (!chapaRes.ok) {
      console.error("Chapa API error:", await chapaRes.text())
      return NextResponse.json({ error: "Payment gateway error" }, { status: 500 })
    }
    
    const chapaData = await chapaRes.json()
    if (!chapaData.status || !chapaData.data?.checkout_url) {
      console.error("Chapa response error:", chapaData)
      return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 })
    }

    // Save tx_ref to payment record
    await supabase.from("payments").update({ transaction_id: tx_ref }).eq("id", payment.id)

    return NextResponse.json({ checkout_url: chapaData.data.checkout_url })
  } catch (error) {
    console.error("Premium payment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 