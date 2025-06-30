import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const approved = searchParams.get('approved')
    const featured = searchParams.get('featured')
    const landlordId = searchParams.get('landlord_id')
    const limit = searchParams.get('limit')
    const adminView = searchParams.get('adminView')

    let query = supabase
      .from('properties')
      .select(`
        *,
        landlords:users!properties_landlord_id_fkey(
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    // For admin view, don't filter by approval status (show all properties)
    if (adminView !== 'true') {
      // Filter by approval status for non-admin views
    if (approved === 'true') {
        query = query.eq('approved', true)
    } else if (approved === 'false') {
        query = query.eq('approved', false)
      }
    }

    // Filter by landlord
    if (landlordId) {
      query = query.eq('landlord_id', landlordId)
    }

    // Apply limit if specified
    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data: properties, error } = await query

    if (error) {
      console.error('Error fetching properties:', error)
      return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
    }

    // For featured properties, return only approved ones
    if (featured === 'true') {
      const featuredProperties = properties?.filter(property => property.approved) || []
      return NextResponse.json({ properties: featuredProperties })
    }

    return NextResponse.json({ properties: properties || [] })
  } catch (error) {
    console.error('Properties API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form data
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const location = formData.get('location') as string
    const bedrooms = parseInt(formData.get('bedrooms') as string)
    const bathrooms = parseInt(formData.get('bathrooms') as string)
    const area = parseInt(formData.get('area') as string)
    const landlordId = formData.get('landlord_id') as string
    const type = formData.get('type') as string

    // Validate required fields
    if (!title || !description || !price || !location || !landlordId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check landlord's property count and premium status
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, premium')
      .eq('id', landlordId)
      .single()
    if (userError || !user) {
      return NextResponse.json({ error: 'Landlord not found' }, { status: 404 })
    }
    const { count, error: countError } = await supabase
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('landlord_id', landlordId)
    if (countError) {
      return NextResponse.json({ error: 'Failed to check property count' }, { status: 500 })
    }
    if (!user.premium && (count ?? 0) >= 10) {
      return NextResponse.json({ error: 'Free plan limit reached. Upgrade to premium to list more than 10 properties.' }, { status: 403 })
    }

    // Handle image uploads
    const images: string[] = []
    const imageFiles = formData.getAll('photos') as File[]
    
    for (const file of imageFiles) {
      if (file.size > 0) {
        const fileName = `${Date.now()}-${file.name}`
        const { data, error } = await supabase.storage
          .from('property-photos')
          .upload(fileName, file)

        if (error) {
          console.error('Image upload error:', error)
          return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
        }

        const { data: { publicUrl } } = supabase.storage
          .from('property-photos')
          .getPublicUrl(fileName)

        images.push(publicUrl)
      }
    }

    // Create property record
    const { data: property, error } = await supabase
      .from('properties')
      .insert({
        title,
        description,
        price,
        location,
        bedrooms,
        bathrooms,
        area,
        type,
        images,
        landlord_id: landlordId,
        approved: false, // Default to false, requires admin approval
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Property creation error:', error)
      return NextResponse.json({ error: 'Failed to create property' }, { status: 500 })
    }

    return NextResponse.json({ 
      property,
      message: 'Property created successfully. It will be reviewed by admin before approval.'
    })
  } catch (error) {
    console.error('Property creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
