import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { userId, otherUserId } = await request.json()

    if (!userId || !otherUserId) {
      return NextResponse.json({ error: "User ID and other user ID are required" }, { status: 400 })
    }

    // Mark all unread messages from otherUserId to userId as read
    const { error } = await supabase
      .from("messages")
      .update({ read: true })
      .eq("sender_id", otherUserId)
      .eq("receiver_id", userId)
      .eq("read", false)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: "Messages marked as read" })
  } catch (error) {
    console.error("Mark messages as read error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 