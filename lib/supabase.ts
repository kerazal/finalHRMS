import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nuhheqtivaihpyqmyung.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51aGhlcXRpdmFpaHB5cW15dW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTMxMzcsImV4cCI6MjA2NjU4OTEzN30.f9WnwzVSW01uc16a_597KcoAoyaBXRWxIKyMHSyrDi4'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client for frontend operations (subject to RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client for backend operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types
export interface DatabaseUser {
  id: string
  email: string
  name: string
  phone?: string
  role: "admin" | "landlord" | "tenant"
  about?: string
  id_front_url?: string
  id_back_url?: string
  verified: boolean
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  title: string
  description: string
  location: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  type: string
  images: string[]
  amenities: string[]
  landlord_id: string
  available: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

export interface Rental {
  id: string
  property_id: string
  tenant_id: string
  landlord_id: string
  start_date: string
  end_date: string
  monthly_rent: number
  deposit: number
  status: "active" | "pending" | "expired" | "terminated"
  created_at: string
  updated_at: string
}

export interface MaintenanceRequest {
  id: string
  property_id: string
  tenant_id: string
  landlord_id: string
  title: string
  description: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in-progress" | "completed" | "cancelled"
  images?: string[]
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  rental_id: string
  tenant_id: string
  landlord_id: string
  amount: number
  type: "rent" | "deposit" | "fee"
  status: "pending" | "completed" | "failed" | "refunded"
  payment_method: string
  transaction_id?: string
  due_date: string
  paid_date?: string
  created_at: string
  updated_at: string
  commission_amount?: number
  payout_status?: string
}
