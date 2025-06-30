import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const security = await request.json()

    // In a real app, you would save these to a user_settings table
    // For now, we'll just return success

    return NextResponse.json({ success: true, security })
  } catch (error) {
    console.error("Security update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
