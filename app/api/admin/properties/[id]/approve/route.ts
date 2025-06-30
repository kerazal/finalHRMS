import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id
    const { approved, reason } = await request.json()

    if (typeof approved !== 'boolean') {
      return NextResponse.json({ error: "Approval status is required" }, { status: 400 })
    }

    // Update property approval status
    const { data, error } = await supabase
      .from("properties")
      .update({ 
        approved,
        approved_at: approved ? new Date().toISOString() : null,
        rejection_reason: !approved ? reason : null
      })
      .eq("id", propertyId)
      .select(`
        *,
        landlord:users!properties_landlord_id_fkey(name, email)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Send notification to landlord
    if (data.landlord) {
      try {
        await supabase.from("messages").insert({
          sender_id: null, // System message
          receiver_id: data.landlord_id,
          subject: `Property ${approved ? 'Approved' : 'Rejected'}`,
          content: approved 
            ? `Your property "${data.title}" has been approved and is now visible to tenants.`
            : `Your property "${data.title}" has been rejected. Reason: ${reason || 'No reason provided'}`
        })
      } catch (messageError) {
        console.error("Failed to send notification:", messageError)
      }
    }

    return NextResponse.json({ 
      property: data,
      message: `Property ${approved ? 'approved' : 'rejected'} successfully`
    })
  } catch (error) {
    console.error("Property approval error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
