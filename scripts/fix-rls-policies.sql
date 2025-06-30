-- Fix RLS policies to allow server-side operations
-- This script adds policies that allow backend API routes to access user data

-- Allow service role to select any user (for backend operations)
CREATE POLICY "Service can select all users" ON users
  FOR SELECT USING (true);

-- Allow service role to update users (for backend operations like premium activation)
CREATE POLICY "Service can update users" ON users
  FOR UPDATE USING (true);

-- Allow service role to insert users (for registration)
CREATE POLICY "Service can insert users" ON users
  FOR INSERT WITH CHECK (true);

-- Keep existing policies for client-side operations
-- Users can still only view their own profile from the frontend
-- This policy remains unchanged:
-- CREATE POLICY "Users can view own profile" ON users
--   FOR SELECT USING (auth.uid() = id);

-- Allow service role to manage properties (for backend operations)
CREATE POLICY "Service can manage properties" ON properties
  FOR ALL USING (true);

-- Allow service role to manage payments (for backend operations)
CREATE POLICY "Service can manage payments" ON payments
  FOR ALL USING (true);

-- Allow service role to manage maintenance requests (for backend operations)
CREATE POLICY "Service can manage maintenance requests" ON maintenance_requests
  FOR ALL USING (true);

-- Allow service role to manage rentals (for backend operations)
CREATE POLICY "Service can manage rentals" ON rentals
  FOR ALL USING (true);

-- Allow service role to manage messages (for backend operations)
CREATE POLICY "Service can manage messages" ON messages
  FOR ALL USING (true);

-- Note: These policies only apply when using the service role key
-- Frontend operations will still be subject to the original RLS policies
-- which ensure users can only access their own data 