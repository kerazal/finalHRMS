-- Create storage buckets for profile pictures and property photos
-- Note: This script should be run in the Supabase dashboard under Storage

-- Create profile-pictures bucket
-- Go to Storage > Create bucket
-- Name: profile-pictures
-- Public bucket: Yes
-- File size limit: 5MB
-- Allowed MIME types: image/*

-- Create property-photos bucket  
-- Go to Storage > Create bucket
-- Name: property-photos
-- Public bucket: Yes
-- File size limit: 10MB
-- Allowed MIME types: image/*

-- Set up RLS policies for profile-pictures bucket
CREATE POLICY "Users can upload their own profile picture" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-pictures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view profile pictures" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can update their own profile picture" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-pictures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile picture" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-pictures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Set up RLS policies for property-photos bucket
CREATE POLICY "Landlords can upload property photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'property-photos' AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'landlord'
    )
  );

CREATE POLICY "Anyone can view property photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-photos');

CREATE POLICY "Landlords can update their property photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'property-photos' AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'landlord'
    )
  );

CREATE POLICY "Landlords can delete their property photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'property-photos' AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'landlord'
    )
  ); 