# Vercel Deployment Guide for Rental Management System

## Environment Variables Required

Set these environment variables in your Vercel project settings:

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### Chapa Payment Gateway
```
CHAPA_SECRET_KEY=your_chapa_secret_key_here
CHAPA_TEST_SECRET=your_chapa_test_secret_key_here
```

### Application Configuration
```
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://your-app.vercel.app
```

### Email Configuration (if using email verification)
```
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

## Database Setup

1. Run the SQL scripts in the `scripts/` folder in your Supabase SQL editor:
   - `create-tables.sql`
   - `update-tables.sql`
   - `fix-rls-policies.sql`
   - `setup-storage.sql`

2. Create storage buckets in Supabase:
   - `property-photos` (public)
   - `profile-pictures` (public)
   - `documents` (private)

## Chapa Payment Setup

1. Sign up for a Chapa account at https://chapa.co
2. Get your API keys from the dashboard
3. Set up webhook endpoints in Chapa dashboard pointing to:
   - `https://your-app.vercel.app/api/payments/premium/callback`

## Deployment Steps

1. Connect your GitHub repository to Vercel
2. Set all environment variables in Vercel project settings
3. Deploy the application
4. Test the premium upgrade functionality

## Premium Upgrade Flow

The premium upgrade system works as follows:

1. User clicks "Upgrade to Premium" button
2. System creates a payment record in the database
3. Chapa payment session is created
4. User is redirected to Chapa payment page
5. After successful payment, Chapa calls the callback URL
6. User premium status is updated in the database
7. User is redirected back to the dashboard with success message

## Testing Premium Functionality

1. Create a test landlord account
2. Try to add more than 10 properties (should show premium upgrade modal)
3. Click "Upgrade to Premium" button
4. Complete the payment flow
5. Verify premium status is updated
6. Test unlimited property listings

## Troubleshooting

### Payment Issues
- Check Chapa API keys are correct
- Verify callback URLs are properly configured
- Check Vercel function logs for errors

### Database Issues
- Ensure all SQL scripts have been run
- Check RLS policies are properly configured
- Verify Supabase connection strings

### Environment Variables
- Make sure all required variables are set in Vercel
- Check that variable names match exactly
- Restart deployment after adding new variables 