-- Insert sample users
INSERT INTO users (id, email, name, phone, role, about, verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@rentease.com', 'Admin User', '+1-555-0001', 'admin', 'Platform administrator with full access to all features.', true),
('550e8400-e29b-41d4-a716-446655440002', 'john.landlord@example.com', 'John Smith', '+1-555-0002', 'landlord', 'Experienced property manager with 10+ years in real estate.', true),
('550e8400-e29b-41d4-a716-446655440003', 'sarah.tenant@example.com', 'Sarah Johnson', '+1-555-0003', 'tenant', 'Young professional looking for a comfortable place to call home.', true),
('550e8400-e29b-41d4-a716-446655440004', 'mike.landlord@example.com', 'Mike Wilson', '+1-555-0004', 'landlord', 'Real estate investor specializing in luxury properties.', true),
('550e8400-e29b-41d4-a716-446655440005', 'emma.tenant@example.com', 'Emma Davis', '+1-555-0005', 'tenant', 'Graduate student seeking affordable housing near campus.', true);

-- Insert sample properties
INSERT INTO properties (id, title, description, location, price, bedrooms, bathrooms, area, type, images, amenities, landlord_id, available, featured) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Modern Downtown Apartment', 'Beautiful modern apartment in the heart of downtown with stunning city views.', 'Downtown, City Center', 2500.00, 2, 2, 1200, 'apartment', ARRAY['/placeholder.svg?height=400&width=600'], ARRAY['Air Conditioning', 'Dishwasher', 'In-unit Laundry', 'Balcony', 'Gym Access'], '550e8400-e29b-41d4-a716-446655440002', true, true),
('660e8400-e29b-41d4-a716-446655440002', 'Luxury Waterfront Condo', 'Stunning waterfront condominium with panoramic ocean views and premium amenities.', 'Waterfront District', 3200.00, 3, 2, 1500, 'condo', ARRAY['/placeholder.svg?height=400&width=600'], ARRAY['Ocean View', 'Concierge', 'Pool', 'Spa', 'Parking'], '550e8400-e29b-41d4-a716-446655440004', true, true),
('660e8400-e29b-41d4-a716-446655440003', 'Cozy Suburban House', 'Charming family home in quiet suburban neighborhood with large backyard.', 'Maple Street, Suburbs', 1800.00, 3, 2, 1800, 'house', ARRAY['/placeholder.svg?height=400&width=600'], ARRAY['Backyard', 'Garage', 'Fireplace', 'Hardwood Floors'], '550e8400-e29b-41d4-a716-446655440002', true, false),
('660e8400-e29b-41d4-a716-446655440004', 'Studio Apartment Downtown', 'Efficient studio apartment perfect for young professionals.', 'Downtown Core', 1200.00, 1, 1, 600, 'studio', ARRAY['/placeholder.svg?height=400&width=600'], ARRAY['High-speed Internet', 'Fitness Center', 'Rooftop Terrace'], '550e8400-e29b-41d4-a716-446655440002', true, false),
('660e8400-e29b-41d4-a716-446655440005', 'Luxury Villa with Pool', 'Exclusive villa with private pool and premium finishes.', 'Uptown Hills', 5000.00, 4, 3, 2500, 'villa', ARRAY['/placeholder.svg?height=400&width=600'], ARRAY['Private Pool', 'Garden', 'Wine Cellar', 'Smart Home'], '550e8400-e29b-41d4-a716-446655440004', false, true);

-- Insert sample rentals
INSERT INTO rentals (id, property_id, tenant_id, landlord_id, start_date, end_date, monthly_rent, deposit, status) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '2024-01-01', '2024-12-31', 2500.00, 5000.00, 'active'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', '2024-02-01', '2025-01-31', 5000.00, 10000.00, 'active');

-- Insert sample maintenance requests
INSERT INTO maintenance_requests (id, property_id, tenant_id, landlord_id, title, description, priority, status) VALUES
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Kitchen Faucet Leak', 'The kitchen faucet has been leaking for the past few days. Water is dripping constantly.', 'medium', 'in-progress'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Air Conditioning Not Working', 'The AC unit stopped working yesterday. It''s getting quite warm in the apartment.', 'high', 'completed'),
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 'Pool Cleaning Required', 'The pool needs cleaning and chemical balancing.', 'low', 'pending');

-- Insert sample payments
INSERT INTO payments (id, rental_id, tenant_id, landlord_id, amount, type, status, payment_method, due_date, paid_date) VALUES
('990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 2500.00, 'rent', 'completed', 'credit_card', '2024-01-01', '2024-01-01'),
('990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 2500.00, 'rent', 'completed', 'bank_transfer', '2024-02-01',  '550e8400-e29b-41d4-a716-446655440002', 2500.00, 'rent', 'completed', 'bank_transfer', '2024-02-01', '2024-02-01'),
('990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 5000.00, 'rent', 'completed', 'credit_card', '2024-02-01', '2024-02-01'),
('990e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 2500.00, 'rent', 'pending', 'credit_card', '2024-03-01', NULL);

-- Insert sample messages
INSERT INTO messages (id, sender_id, recipient_id, property_id, subject, content, read) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Maintenance Request Follow-up', 'Hi John, just wanted to follow up on the kitchen faucet repair. When can we expect the plumber?', false),
('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Re: Maintenance Request Follow-up', 'Hi Sarah, the plumber will be there tomorrow between 10 AM and 2 PM. Please make sure someone is available.', true),
('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440005', 'Pool Maintenance Schedule', 'Hi Mike, could you please let me know the regular pool maintenance schedule?', false);
