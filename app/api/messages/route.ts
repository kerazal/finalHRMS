import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const otherUserId = searchParams.get("otherUserId")

    if (!userId || !otherUserId) {
      return NextResponse.json({ error: "Both user IDs are required" }, { status: 400 })
    }

    // Get messages between the two users
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, name, email, profile_picture_url),
        receiver:users!messages_receiver_id_fkey(id, name, email, profile_picture_url)
      `)
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order("created_at", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ messages: data })
  } catch (error) {
    console.error("Messages fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { receiver_id, subject, content } = await request.json()

    if (!receiver_id || !content) {
      return NextResponse.json({ error: "Receiver ID and content are required" }, { status: 400 })
    }

    // Get the current user from the request headers
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header required" }, { status: 401 })
    }

    // Extract user ID from the authorization header
    // In a real implementation, you'd verify the JWT token
    const sender_id = authHeader.replace("Bearer ", "")

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id,
        receiver_id,
        subject: subject || "New message",
        content,
        read: false
      })
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, name, email, profile_picture_url),
        receiver:users!messages_receiver_id_fkey(id, name, email, profile_picture_url)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: data })
  } catch (error) {
    console.error("Message creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
