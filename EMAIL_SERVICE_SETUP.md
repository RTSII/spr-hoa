# Email Notification Service Setup Guide

This guide will help you set up the complete email notification system for SPR-HOA photo rejections using Supabase Edge Functions and Resend.

## 🚀 Quick Setup Overview

1. **Sign up for Resend** (or use existing account)
2. **Deploy Supabase Edge Function**
3. **Configure environment variables**
4. **Update database functions**
5. **Test the system**

## 📧 Step 1: Resend Setup

### Create Resend Account

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email address
3. Navigate to the API Keys section

### Get API Key

1. Click "Create API Key"
2. Name it "SPR-HOA-Notifications"
3. Copy the API key (starts with `re_`)
4. **Important**: Save this key securely - you won't see it again

### Domain Setup (Optional but Recommended)

1. Go to "Domains" in Resend dashboard
2. Add your domain (e.g., `sandpiperrun.com`)
3. Follow DNS verification steps
4. Use `noreply@yourdomain.com` as sender

## 🔧 Step 2: Deploy Edge Function

### Install Supabase CLI

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase
```

### Login and Link Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

### Set Environment Variables

```bash
# Set the Resend API key
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

### Deploy the Function

```bash
# Deploy the send-email function
supabase functions deploy send-email
```

### Verify Deployment

```bash
# Test that the function is deployed
supabase functions list
```

## 🗄️ Step 3: Database Configuration

### Update Database Settings

Run this in your Supabase SQL Editor:

```sql
-- Set your Supabase project URL for the email function
SELECT set_config('app.supabase_url', 'https://YOUR_PROJECT_REF.supabase.co', false);

-- Enable the http extension for calling Edge Functions
CREATE EXTENSION IF NOT EXISTS http;
```

### Update the Email Function

Execute the updated SQL from `send_photo_rejection_email_updated.sql`:

```bash
# Run the updated SQL file in Supabase SQL Editor
cat sql/send_photo_rejection_email_updated.sql
```

## 🧪 Step 4: Testing

### Test Email Function Directly

```bash
# Test the Edge Function directly
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello from SPR-HOA!</h1><p>This is a test email.</p>"
  }'
```

### Test Database Function

Run this in Supabase SQL Editor:

```sql
-- Test the complete workflow
SELECT test_email_function('your-test-email@example.com');

-- Check the logs
SELECT * FROM admin_logs
WHERE log_type IN ('email_sent', 'email_error')
ORDER BY created_at DESC
LIMIT 5;
```

### Test Full Rejection Workflow

1. Upload a photo as a regular user
2. Log in as admin and reject the photo with a reason
3. Check that the email was sent (check admin_logs)
4. Verify the email was received

## 🛠️ Step 5: Environment Configuration

### Required Environment Variables

Set these in your Supabase project:

```bash
# Required for email sending
RESEND_API_KEY=re_your_api_key_here

# Optional: Custom sender domain
DEFAULT_SENDER_EMAIL=noreply@yourdomain.com
```

### Database Settings

Update these in your database:

```sql
-- Your Supabase project URL
SELECT set_config('app.supabase_url', 'https://YOUR_PROJECT_REF.supabase.co', false);

-- Your service role key (for internal function calls)
SELECT set_config('app.supabase_service_role_key', 'YOUR_SERVICE_ROLE_KEY', false);
```

## 📋 Configuration Checklist

- [ ] Resend account created and API key obtained
- [ ] Domain added to Resend (optional but recommended)
- [ ] Supabase CLI installed and logged in
- [ ] Project linked to Supabase CLI
- [ ] RESEND_API_KEY environment variable set
- [ ] Edge Function deployed successfully
- [ ] HTTP extension enabled in database
- [ ] Database settings configured
- [ ] Updated SQL functions executed
- [ ] Email function tested directly
- [ ] Database function tested
- [ ] Full rejection workflow tested

## 🚨 Troubleshooting

### Common Issues

#### 1. "RESEND_API_KEY not found"

**Solution**: Set the environment variable:

```bash
supabase secrets set RESEND_API_KEY=your_key_here
```

#### 2. "HTTP extension not available"

**Solution**: Enable in Supabase dashboard:

- Go to Database → Extensions
- Search for "http"
- Enable the extension

#### 3. "Function deployment failed"

**Solution**: Check your CLI setup:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

#### 4. "Email not received"

**Solutions**:

- Check spam folder
- Verify Resend API key is correct
- Check admin_logs table for error details
- Ensure sender domain is verified in Resend

#### 5. "Permission denied calling function"

**Solution**: Update the database settings:

```sql
SELECT set_config('app.supabase_service_role_key', 'YOUR_SERVICE_ROLE_KEY', false);
```

### Debug Steps

1. **Check Function Logs**:

   ```bash
   supabase functions logs send-email
   ```

2. **Check Database Logs**:

   ```sql
   SELECT * FROM admin_logs
   WHERE log_type LIKE '%email%'
   ORDER BY created_at DESC;
   ```

3. **Test Components Separately**:
   - Test Edge Function directly with curl
   - Test database function with test_email_function
   - Test full workflow with photo rejection

## 🔐 Security Notes

- **Never commit API keys to version control**
- **Use environment variables for all secrets**
- **Regularly rotate API keys**
- **Monitor email sending logs for abuse**
- **Set up rate limiting if needed**

## 📈 Monitoring

### Track Email Sending

```sql
-- View email sending statistics
SELECT
  log_type,
  COUNT(*) as count,
  DATE(created_at) as date
FROM admin_logs
WHERE log_type IN ('email_sent', 'email_error')
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY log_type, DATE(created_at)
ORDER BY date DESC;
```

### Resend Dashboard

- Monitor email delivery rates
- Track bounces and complaints
- View sending volume

## 🎉 Success!

Once everything is configured:

1. **Photo rejections will automatically send emails** ✅
2. **Users will receive beautiful HTML emails** ✅
3. **All email activity is logged** ✅
4. **System is production-ready** ✅

Your SPR-HOA portal now has a complete email notification system! 🏖️✉️

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the Supabase and Resend documentation
3. Check the admin_logs table for detailed error information
4. Test each component separately to isolate issues

---

**Next Steps**: Consider adding email notifications for photo approvals, new user registrations, and other community events!
