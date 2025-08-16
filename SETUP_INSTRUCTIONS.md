# Sandpiper Run Portal - Setup Instructions

**2025-07-27 Update:**

- All major build errors are fixed and project is ready for onboarding/admin demo.
- Directory and Inbox are luxury-branded and privacy-first.
- For troubleshooting, see DEV_SERVER_TROUBLESHOOTING.md.

## Prerequisites Completed

- Created `.env` file with Supabase credentials
- Created `database-setup.sql` with all tables and unit/account data
- Created `database-directory-update.sql` with enhanced directory privacy controls

## Next Steps

### 1. Copy the SPR Logo and Aerial Photo

Copy your files to:

```
sandpiper-portal/src/assets/images/spr_logo.jpg
sandpiper-portal/src/assets/images/spr_aerial.jpg (if you want to use the aerial photo)
```

### 2. Set Up Database Tables

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/ukortnwfrzxlslbhlmro
2. Navigate to the SQL Editor
3. First, run the entire contents of `database-setup.sql`
4. Then, run the contents of `database-directory-update.sql` to add the enhanced privacy controls
5. This will create all necessary tables and populate the owners_master table with unit/account data

### 3. Enable Authentication

In your Supabase dashboard:

1. Go to Authentication → Providers
2. Ensure Email provider is enabled ✅
3. Configure email templates if desired

### 4. Start the Development Server

```bash
cd sandpiper-portal
yarn dev
```

The application will be available at http://localhost:5173

---

### [2025-08-11] CSS/Tailwind/Styling Not Loading? (Resolved)

If the app loads with only browser default styles and no Tailwind/custom CSS:

- Check that `index.css` is imported in `main.tsx`
- Check for syntax errors in CSS/Tailwind files
- Delete `.vite`, `dist`, `node_modules`, and lock files, then reinstall and restart the dev server
- Check all config files for typos/misconfigurations
- Always restart the dev server after major changes

If styles are missing, check browser dev tools for stylesheet loading and restart the dev server if needed.

### 5. Test the Registration Flow

1. Navigate to the registration page
2. Use any unit number and account number from the database (e.g., Unit: A1A, Account: 3298)
3. Complete the registration form
4. Notice the new "Resident Directory Options" section where users can:
   - Opt in/out of the directory
   - Choose what information to display (unit, email, phone)
5. You should be redirected to the dashboard

## New Directory Features

### Privacy Controls

- **Granular Opt-in**: Users can choose to be in the directory and select what information to share
- **Show/Hide Options**:
  - Unit Number (default: shown)
  - Email Address (default: hidden)
  - Phone Number (default: hidden)
- **Profile Settings Page**: Users can update their directory preferences anytime at `/profile`
- **Remove from Directory**: One-click option to completely remove from directory

### Directory Page Features

- **Privacy-Respecting Display**: Only shows information users have chosen to share
- **Search Functionality**: Search by name or unit number
- **Export to CSV**: Download the directory (respects privacy settings)
- **Opt-in Notice**: Shows personalized message if user hasn't opted in

### Database Schema Updates

Added to `owner_profiles` table:

- `show_email` (boolean) - Whether to show email in directory
- `show_phone` (boolean) - Whether to show phone in directory
- `show_unit` (boolean) - Whether to show unit number in directory

## Unit/Account Data

The system now uses the Supabase database for verification. All 165 units and their corresponding HOA account numbers have been imported from your index.html file.

## Testing Directory Features

1. **Register Multiple Test Accounts**: Create a few test accounts with different directory settings
2. **Test Privacy Settings**:
   - Some with full info displayed
   - Some with only name
   - Some not in directory at all
3. **Test Profile Updates**: Go to `/profile` and change directory settings
4. **Test Directory Export**: Export CSV and verify privacy settings are respected

## Troubleshooting

### If you get a "Cannot find module" error:

```bash
cd sandpiper-portal
yarn install
```

### If the logo doesn't appear:

Make sure you've copied `spr_logo.jpg` to `sandpiper-portal/src/assets/images/`

### If registration fails:

1. Check that the database tables were created successfully
2. Verify the unit and account numbers match exactly (unit numbers are case-insensitive)
3. Check the browser console for any error messages

### If directory features don't work:

1. Make sure you ran both SQL scripts
2. Check that the new columns were added to owner_profiles table
3. Verify RLS policies are enabled

## Next Development Tasks

1. Migrate the Unit Access Request form from index.html
2. Create Pet Registration form
3. Build admin interfaces for content management
4. Implement real-time features
5. Add Supermemory.ai integration
6. Add email notifications for directory changes
