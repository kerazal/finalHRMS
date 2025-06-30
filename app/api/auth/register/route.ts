import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const userData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      role: formData.get("role") as string,
      about: formData.get("about") as string,
    }

    // Validate required fields
    if (!userData.email || !userData.password || !userData.name || !userData.role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const idFront = formData.get("idFront") as File
    const idBack = formData.get("idBack") as File
    const landlordDocuments = formData.getAll("landlordDocuments") as File[]

    // Create user account with email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 400 })
    }

    // Upload ID documents
    let idFrontUrl = ""
    let idBackUrl = ""
    const landlordDocumentUrls: string[] = []

    if (idFront && idFront.size > 0) {
      const { data: frontData, error: frontError } = await supabase.storage
        .from("id-documents")
        .upload(`${authData.user.id}/id-front-${Date.now()}`, idFront)

      if (!frontError && frontData) {
        const { data: frontUrlData } = supabase.storage.from("id-documents").getPublicUrl(frontData.path)
        idFrontUrl = frontUrlData.publicUrl
      }
    }

    if (idBack && idBack.size > 0) {
      const { data: backData, error: backError } = await supabase.storage
        .from("id-documents")
        .upload(`${authData.user.id}/id-back-${Date.now()}`, idBack)

      if (!backError && backData) {
        const { data: backUrlData } = supabase.storage.from("id-documents").getPublicUrl(backData.path)
        idBackUrl = backUrlData.publicUrl
      }
    }

    // Upload landlord documents if role is landlord
    if (userData.role === "landlord" && landlordDocuments.length > 0) {
      for (let i = 0; i < landlordDocuments.length; i++) {
        const doc = landlordDocuments[i]
        if (doc && doc.size > 0) {
          const { data: docData, error: docError } = await supabase.storage
            .from("landlord-documents")
            .upload(`${authData.user.id}/document-${i}-${Date.now()}`, doc)

          if (!docError && docData) {
            const { data: docUrlData } = supabase.storage.from("landlord-documents").getPublicUrl(docData.path)
            landlordDocumentUrls.push(docUrlData.publicUrl)
          }
        }
      }
    }

    // Create user profile
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
      about: userData.about,
      id_front_url: idFrontUrl,
      id_back_url: idBackUrl,
      landlord_documents: landlordDocumentUrls,
      verified: false,
    })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({
      message: "User created successfully. Please check your email to verify your account.",
      user: {
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
