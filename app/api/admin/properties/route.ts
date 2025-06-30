import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const landlordId = searchParams.get("landlordId") || ""

    let query = supabase
      .from("properties")
      .select(`
        *,
        landlord:users!properties_landlord_id_fkey(id, name, email, phone, profile_picture_url)
      `)

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%,type.ilike.%${search}%`)
    }

    if (status) {
      if (status === "approved") {
        query = query.eq("approved", true)
      } else if (status === "pending") {
        query = query.eq("approved", false)
      }
    }

    if (landlordId) {
      query = query.eq("landlord_id", landlordId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ properties: data })
  } catch (error) {
    console.error("Admin properties fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const propertyData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      location: formData.get("location") as string,
      price: Number(formData.get("price")),
      bedrooms: Number(formData.get("bedrooms")),
      bathrooms: Number(formData.get("bathrooms")),
      area: Number(formData.get("area")),
      type: formData.get("type") as string,
      landlord_id: formData.get("landlord_id") as string,
      available: true,
      approved: true, // Admin-created properties are auto-approved
      featured: formData.get("featured") === "true",
    }

    // Validate required fields
    if (!propertyData.title || !propertyData.location || !propertyData.price || !propertyData.landlord_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Handle property photos
    const photos = formData.getAll("photos") as File[]
    const photoUrls: string[] = []

    if (photos.length === 0) {
      return NextResponse.json({ error: "At least one property photo is required" }, { status: 400 })
    }

    // Upload photos to Supabase Storage and store public URLs
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      if (photo && photo.size > 0) {
        const fileName = `${Date.now()}-${photo.name}`
        const { data, error } = await supabase.storage
          .from('property-photos')
          .upload(fileName, photo)

        if (error) {
          console.error('Image upload error:', error)
          return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
        }

        const { data: { publicUrl } } = supabase.storage
          .from('property-photos')
          .getPublicUrl(fileName)

        photoUrls.push(publicUrl)
      }
    }

    if (photoUrls.length === 0) {
      return NextResponse.json({ error: "Failed to process property photos" }, { status: 400 })
    }

    // Create property with photos
    const { data, error } = await supabase
      .from("properties")
      .insert({
        ...propertyData,
        images: photoUrls,
      })
      .select(`
        *,
        landlord:users!properties_landlord_id_fkey(id, name, email, phone, profile_picture_url)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      property: data,
      message: "Property created successfully"
    })
  } catch (error) {
    console.error("Admin property creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
