import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get all conversations for the user (as sender or receiver)
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:users!messages_sender_id_fkey(id, name, email, profile_picture_url),
        receiver:users!messages_receiver_id_fkey(id, name, email, profile_picture_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Group messages by conversation
    const conversations = new Map()
    
    data.forEach((message) => {
      const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id
      const otherUser = message.sender_id === userId ? message.receiver : message.sender
      
      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, {
          otherUser,
          lastMessage: message,
          unreadCount: message.sender_id !== userId && !message.read ? 1 : 0
        })
      } else {
        const conversation = conversations.get(otherUserId)
        if (message.sender_id !== userId && !message.read) {
          conversation.unreadCount++
        }
      }
    })

    return NextResponse.json({ 
      conversations: Array.from(conversations.values())
    })
  } catch (error) {
    console.error("Conversations fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
