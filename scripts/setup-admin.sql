-- Insert admin user if not exists
INSERT INTO users (id, email, name, role, verified, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'kerazal71@gmail.com',
  'System Administrator',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  verified = true,
  updated_at = NOW();

-- You can also manually insert this user in Supabase Auth if needed
-- Go to Authentication > Users in your Supabase dashboard
-- Add user with email: kerazal71@gmail.com
-- Set password and confirm the user 