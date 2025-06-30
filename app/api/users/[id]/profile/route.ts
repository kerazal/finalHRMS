import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData()

    const updates: any = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      about: formData.get("about") as string,
    }

    // Handle profile picture upload
    const profilePicture = formData.get("profilePicture")
    console.log("Received profilePicture:", profilePicture)
    if (profilePicture && typeof profilePicture === "object" && "size" in profilePicture && profilePicture.size > 0) {
      const fileName = `profile-${params.id}-${Date.now()}.${(profilePicture as File).name.split('.').pop()}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(fileName, profilePicture)

      if (uploadError) {
        console.error("Upload error:", uploadError)
        return NextResponse.json({ error: "Failed to upload profile picture" }, { status: 500 })
      }

      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from("profile-pictures")
          .getPublicUrl(uploadData.path)
        updates.profile_picture_url = urlData.publicUrl
        console.log("Generated public URL:", urlData.publicUrl)
      }
    }
    console.log("Final updates object:", updates)
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user: data })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
