-- Premium functionality setup script
-- Run this in your Supabase SQL editor

-- Ensure premium field exists in users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium BOOLEAN DEFAULT FALSE;

-- Create index for premium users for better performance
CREATE INDEX IF NOT EXISTS idx_users_premium ON users(premium);

-- Update payments table to support premium payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'rent';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);

-- Create index for premium payments
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(type);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- RLS policies for premium functionality

-- Users can view their own premium status
CREATE POLICY "Users can view own premium status" ON users
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all users' premium status
CREATE POLICY "Admins can view all premium status" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    auth.uid() = landlord_id OR 
    auth.uid() = tenant_id
  );

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Users can insert their own payments (for premium upgrades)
CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (
    auth.uid() = landlord_id OR 
    auth.uid() = tenant_id
  );

-- System can update payment status (for callbacks)
CREATE POLICY "System can update payments" ON payments
  FOR UPDATE USING (true);

-- System can update user premium status (for callbacks)
CREATE POLICY "System can update user premium" ON users
  FOR UPDATE USING (true);

-- Property listing limits based on premium status
-- This will be enforced in the application logic
-- Free users: 10 properties
-- Premium users: unlimited properties

-- Add a function to check if user can add more properties
CREATE OR REPLACE FUNCTION can_add_property(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_premium BOOLEAN;
  property_count INTEGER;
BEGIN
  -- Get user premium status
  SELECT premium INTO user_premium
  FROM users
  WHERE id = user_id;
  
  -- If premium, can add unlimited properties
  IF user_premium THEN
    RETURN TRUE;
  END IF;
  
  -- Count existing properties for non-premium users
  SELECT COUNT(*) INTO property_count
  FROM properties
  WHERE landlord_id = user_id;
  
  -- Free users can have up to 10 properties
  RETURN property_count < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION can_add_property(UUID) TO authenticated; 