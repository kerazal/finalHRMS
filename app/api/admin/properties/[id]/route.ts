import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select(`
        *,
        landlord:users!properties_landlord_id_fkey(id, name, email, phone, profile_picture_url, created_at)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ property: data })
  } catch (error) {
    console.error("Admin property fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()
    
    const updates: any = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      location: formData.get("location") as string,
      price: Number(formData.get("price")),
      bedrooms: Number(formData.get("bedrooms")),
      bathrooms: Number(formData.get("bathrooms")),
      area: Number(formData.get("area")),
      type: formData.get("type") as string,
      landlord_id: formData.get("landlord_id") as string,
      available: formData.get("available") === "true",
      approved: formData.get("approved") === "true",
      featured: formData.get("featured") === "true",
    }

    // Handle property photos
    const photos = formData.getAll("photos") as File[]
    if (photos.length > 0) {
      const photoUrls: string[] = []

      // Upload new photos to Supabase Storage and store public URLs
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

      if (photoUrls.length > 0) {
        updates.images = photoUrls
      }
    }

    // Handle existing images (if provided as comma-separated string)
    const existingImages = formData.get("existingImages") as string
    if (existingImages) {
      const imageArray = existingImages.split(',').filter(img => img.trim())
      if (imageArray.length > 0) {
        updates.images = imageArray
      }
    }

    const { data, error } = await supabase
      .from("properties")
      .update(updates)
      .eq("id", params.id)
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
      message: "Property updated successfully"
    })
  } catch (error) {
    console.error("Admin property update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First, get the property to check if it has images to delete
    const { data: property, error: fetchError } = await supabase
      .from("properties")
      .select("images")
      .eq("id", params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 })
    }

    // Delete images from storage if they exist
    if (property.images && property.images.length > 0) {
      for (const imageUrl of property.images) {
        try {
          // Extract the file path from the URL
          const urlParts = imageUrl.split('/')
          const fileName = urlParts[urlParts.length - 1]
          
          await supabase.storage
            .from("property-photos")
            .remove([fileName])
        } catch (storageError) {
          console.error("Error deleting image from storage:", storageError)
          // Continue with property deletion even if image deletion fails
        }
      }
    }

    // Delete the property
    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      message: "Property deleted successfully"
    })
  } catch (error) {
    console.error("Admin property deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 