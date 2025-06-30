-- Add missing columns to existing tables

-- Add approved column to properties table if it doesn't exist
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;

-- Add verified column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- Add new fields to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add profile picture field to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Add premium field to users table for landlord premium status
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium BOOLEAN DEFAULT FALSE;

-- Create maintenance_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    landlord_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'medium',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    landlord_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'rent',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    due_date DATE NOT NULL,
    paid_date DATE,
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    commission_amount DECIMAL(10,2) DEFAULT 0,
    payout_status VARCHAR(20) DEFAULT 'pending'
);

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    last_message_id UUID,
    last_message_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id, property_id)
);

-- Create rentals table if it doesn't exist
CREATE TABLE IF NOT EXISTS rentals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    landlord_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    monthly_rent DECIMAL(10,2) NOT NULL,
    security_deposit DECIMAL(10,2),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    lease_terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_tenant_id ON maintenance_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_landlord_id ON maintenance_requests(landlord_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_property_id ON maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);

CREATE INDEX IF NOT EXISTS idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_landlord_id ON payments(landlord_id);
CREATE INDEX IF NOT EXISTS idx_payments_property_id ON payments(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payments(due_date);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_conversations_user1_id ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON conversations(user2_id);

CREATE INDEX IF NOT EXISTS idx_rentals_tenant_id ON rentals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rentals_landlord_id ON rentals(landlord_id);
CREATE INDEX IF NOT EXISTS idx_rentals_property_id ON rentals(property_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);

CREATE INDEX IF NOT EXISTS idx_properties_approved ON properties(approved);
CREATE INDEX IF NOT EXISTS idx_properties_landlord_id_approved ON properties(landlord_id, approved);

-- Update existing properties to be approved by default
UPDATE properties SET approved = true WHERE approved IS NULL;

-- Update existing users to be verified by default
UPDATE users SET verified = true WHERE verified IS NULL;

-- Update RLS policies for property approval
DROP POLICY IF EXISTS "Anyone can view available properties" ON properties;
CREATE POLICY "Anyone can view approved properties" ON properties
  FOR SELECT USING (approved = true AND available = true);

-- Landlords can view their own properties (approved or not)
DROP POLICY IF EXISTS "Landlords can manage own properties" ON properties;
CREATE POLICY "Landlords can manage own properties" ON properties
  FOR ALL USING (auth.uid() = landlord_id);

-- Admins can view all properties
CREATE POLICY "Admins can view all properties" ON properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create property-photos storage bucket (run this in Supabase dashboard)
-- Go to Storage > Create bucket named "property-photos"
-- Set it to public
