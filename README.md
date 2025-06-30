# Rental Management System

A comprehensive rental management system built with Next.js, TypeScript, and Supabase. The system supports landlords, tenants, and administrators with full property management, messaging, and approval workflows.

## Features

### For Landlords
- **Property Management**: Submit properties for admin approval with photo uploads
- **Dashboard**: View property status, maintenance requests, and rental analytics
- **Messaging**: Chat with tenants and admin
- **Profile Management**: Update profile information and pictures
- **Analytics**: View revenue charts and property performance metrics

### For Tenants
- **Property Search**: Browse approved properties with filters
- **Property Details**: View full property information and photos
- **Contact Landlords**: Send messages to property owners
- **Rental Applications**: Apply for properties
- **Maintenance Requests**: Submit and track maintenance issues

### For Administrators
- **User Management**: Verify landlords and tenants
- **Property Approval**: Review and approve/reject property submissions
- **System Analytics**: Monitor system-wide metrics and performance
- **Maintenance Oversight**: Track and manage maintenance requests
- **Communication**: Message any user in the system

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **UI Components**: shadcn/ui
- **Charts**: Recharts

## Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd rental-management-system
pnpm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

1. Go to your Supabase dashboard > SQL Editor
2. Run the scripts in the following order:

```sql
-- 1. Create tables
\i scripts/create-tables.sql

-- 2. Update tables with new fields
\i scripts/update-tables.sql

-- 3. Seed initial data
\i scripts/seed-data.sql

-- 4. Set up admin user
\i scripts/setup-admin.sql
```

### 5. Storage Setup

1. Go to Supabase dashboard > Storage
2. Create two buckets:
   - **profile-pictures** (public, 5MB limit, image/*)
   - **property-photos** (public, 10MB limit, image/*)
3. Run the storage policies:

```sql
\i scripts/setup-storage.sql
```

### 6. Admin User Setup

1. Create an admin user in Supabase Auth:
   - Go to Authentication > Users
   - Add user with email: `kerazal71@gmail.com`
   - Set password

2. The admin user will be automatically created in the database when you run the setup-admin.sql script

### 7. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### Admin Login
- Email: `kerazal71@gmail.com`
- Password: (set during Supabase Auth setup)

### User Registration Flow
1. Users register with email and password
2. Admin verifies users in the admin dashboard
3. Verified users can log in and access their respective dashboards

### Property Submission Flow
1. Landlords submit properties with photos
2. Properties remain in "pending" status
3. Admin reviews and approves/rejects properties
4. Approved properties become visible to tenants

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login (bypasses email confirmation)

### Properties
- `GET /api/properties` - Get properties (public: approved only, admin: all)
- `POST /api/properties` - Submit new property (landlords only)
- `GET /api/properties/[id]` - Get property details
- `PATCH /api/admin/properties/[id]/approve` - Approve/reject property (admin only)

### Users
- `GET /api/admin/users` - Get all users (admin only)
- `PATCH /api/admin/users/[id]/verify` - Verify user (admin only)
- `PATCH /api/users/[id]/profile` - Update user profile

### Messages
- `GET /api/messages/conversations` - Get user conversations
- `GET /api/messages` - Get messages between users
- `POST /api/messages` - Send message
- `POST /api/messages/read` - Mark messages as read

### Maintenance
- `GET /api/maintenance` - Get maintenance requests
- `POST /api/maintenance` - Submit maintenance request
- `PATCH /api/maintenance/[id]` - Update maintenance status

## File Structure

```
rental-management-system/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── properties/        # Property pages
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── layout/           # Layout components
│   ├── ui/               # UI components
│   └── providers/        # Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── scripts/              # Database scripts
└── public/               # Static assets
```

## Key Features Implementation

### Property Approval Workflow
- Properties submitted by landlords start with `approved: false`
- Only approved properties are visible to the public
- Admin can approve/reject with reasons
- Email notifications sent to landlords

### Photo Upload System
- Required property photos (minimum 1)
- Profile picture uploads for users
- Supabase Storage integration with RLS policies
- Image preview and management

### Messaging System
- Real-time conversations between users
- Unread message indicators
- Message history and search
- System notifications for property status changes

### Chart Visualizations
- Monthly revenue tracking
- Property status distribution
- User role analytics
- Maintenance request statistics

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env.local` is in the root directory
   - Restart the development server after adding variables

2. **Database Connection Errors**
   - Verify Supabase URL and anon key
   - Check if all SQL scripts have been executed
   - Ensure RLS policies are properly configured

3. **File Upload Issues**
   - Verify storage buckets are created
   - Check storage policies are applied
   - Ensure file size limits are appropriate

4. **Authentication Problems**
   - Verify user is created in Supabase Auth
   - Check if user is verified in the database
   - Ensure proper role assignment

### Development Tips

- Use the Supabase dashboard to monitor database changes
- Check the browser console for client-side errors
- Monitor API responses in the Network tab
- Use Supabase logs for backend debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 