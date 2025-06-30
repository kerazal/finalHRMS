import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: user, error } = await supabase.from("users").select("*").eq("id", params.id).single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Mock settings data - in a real app, these would be stored in separate tables
    const settings = {
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        about: user.about || "",
        profile_picture_url: user.profile_picture_url || "",
        id_front_url: user.id_front_url || "",
        id_back_url: user.id_back_url || "",
        landlord_documents: user.landlord_documents || [],
      },
      notifications: {
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
        maintenance_alerts: true,
        payment_reminders: true,
        marketing_emails: false,
      },
      security: {
        two_factor_enabled: false,
        login_alerts: true,
        session_timeout: "30",
      },
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
