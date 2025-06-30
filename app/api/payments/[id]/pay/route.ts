import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { paymentMethod } = await request.json()

    // Fetch payment to get amount and landlord
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("id, amount, landlord_id")
      .eq("id", params.id)
      .single()

    if (fetchError || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 400 })
    }

    // Calculate commission and payout
    const commission = Math.round(payment.amount * 0.10 * 100) / 100
    const payout = Math.round(payment.amount * 0.90 * 100) / 100

    // (Stub) Chapa payout integration
    // In real implementation, call Chapa API to transfer payout to landlord
    const payoutStatus = "completed"

    const { data, error } = await supabase
      .from("payments")
      .update({
        status: "completed",
        paid_date: new Date().toISOString(),
        payment_method: paymentMethod,
        transaction_id: `txn_${Date.now()}`,
        commission_amount: commission,
        payout_status: payoutStatus,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ payment: data, commission, payout, payoutStatus })
  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
