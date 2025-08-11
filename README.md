# Sandpiper Run Owners Portal

A premium web portal exclusively for owners at Sandpiper Run, a luxury oceanfront development in Pawleys Island, SC.

## Features

**2025-08-09 Update:**
- All critical TypeScript and React lint errors are now resolved in ProfileCard, Directory, OwnerInbox, and related files
- The luxury ProfileCard thumbnail and expanded modal are fully integrated and error-free in the Resident Directory
- The codebase is ready for production, documentation updates, and onboarding flow finalization
- Directory and Inbox are fully functional and luxury-branded
- The project uses a solo admin model for maximum control and privacy-first resident directory controls
- Integrated Supermemory.ai AI-powered search across all major site components:
  - Profile.tsx: Search user profile changes/history and audit logs
  - ProfileSettings.tsx: Search profile setting changes and preferences
  - DevPortal.tsx: Search developer/admin actions, site configuration changes, and system logs
  - InviteRequest.tsx: Search invite requests
  - AdminDashboardMagicBento.tsx: Search admin dashboard events
- See DEV_SERVER_TROUBLESHOOTING.md for troubleshooting

---

## CSS/Tailwind/Styling Not Loading? (2025-08-11)

### Issue
After some edits, the local dev server (localhost) was not loading any custom CSS/Tailwind styling—only browser defaults appeared. This was due to either a missing or broken stylesheet injection from Vite, usually caused by:
- Incorrect or missing import of `index.css` in `main.tsx`
- Syntax errors in Tailwind/CSS files
- Corrupted Vite cache or build artifacts
- Misconfiguration in `vite.config.js`, `tailwind.config.js`, or `postcss.config.js`

### Solution Steps
1. **Verify** `index.css` is imported in `main.tsx`.
2. **Check** all config files (`vite.config.js`, `tailwind.config.js`, `postcss.config.js`) for typos or misconfigurations after any dependency or config change.
3. **Clear build artifacts**: Delete `.vite`, `dist`, `node_modules`, and lock files, then reinstall dependencies and restart the dev server.
4. **Fix silent CSS errors**: Even a single typo in a Tailwind or custom CSS file can prevent the stylesheet from loading. Check for errors in your editor or terminal.
5. **Restart** the dev server after any major change.

### Prevention Tips
- After any edit to config or dependencies, always:
  - Re-check your CSS import and config files
  - Clear Vite cache and rebuild if styles suddenly disappear
  - Use your editor’s error highlighting for CSS/Tailwind
- If styles are missing, check browser dev tools: is your CSS file loaded? If not, restart the dev server and check for errors in the terminal.

---

## AI Agent QA & Feature Verification

Whenever new features, major changes, or new pages are introduced, the AI Agent (Cascade) must:
- Fully test and verify all new functionality using the full scope of its tools.
- Access the Windsurf Chrome Browser to load, inspect, and interact with all relevant pages.
- Simulate realistic user flows (registration, login, onboarding, directory, inbox, etc.) using test data as needed.
- Check for UI/UX consistency, accessibility, error-free operation, and that all requirements are met.
- Capture screenshots, console logs, and DOM structure as needed for thorough QA.
- Report any issues, blockers, or mismatches between implementation and requirements.
- Always use the best available tools and methods to ensure the portal matches the intended design and functionality.

This process should be performed for every major update, and results should be documented or communicated to the project owner.

---


- **Secure Authentication**: Unit number and HOA account verification system
- **Dashboard**: Personalized home page with quick access to all features
- **Calendar**: Interactive community calendar with events and activities
- **Community Feed**: Stay updated with local happenings in Sandpiper Run, Litchfield, and Pawleys Island
- **News**: Admin-posted news and announcements
- **Online Forms**: Digital forms including Unit Access Request and Pet Registration
- **Photo Gallery**: Community photo sharing with admin review
- **Resident Directory**: Opt-in directory of owners with contact information

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS with custom coastal theme
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Routing**: React Router
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **AI Integration**: Supermemory.ai

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd sandpiper-portal
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Copy the SPR logo to the assets folder:
   - Place `spr_logo.jpg` in `src/assets/images/`

5. Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SUPERMEMORY_URL=https://mcp.supermemory.ai/guyugQ3xRxBWjmW7izcQx/sse
   VITE_SUPERMEMORY_API_KEY=your_supermemory_api_key
   ```

6. **Database Setup:**
   - Use the unified setup script: `spr_hoa_unified_setup.sql` (see Supabase Setup Guide)
   - This script creates all tables, onboarding logic, and a solo admin model.
   - After registering your admin email (`rtsii10@gmail.com`), insert yourself as admin (see below).

### Solo Admin Setup

- Register with your admin email in the app or Supabase Auth UI.
- Get your user UUID:
  ```sql
  SELECT id, email FROM auth.users WHERE email = 'rtsii10@gmail.com';
  ```
- Insert yourself as admin:
  ```sql
  INSERT INTO admin_users (user_id, email, role) VALUES ('YOUR-USER-UUID', 'rtsii10@gmail.com', 'admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin', email = 'rtsii10@gmail.com';
  ```

### Onboarding Flow
- Owners register with their unit number and last 4 digits of their HOA account number (must match `owners_master` table and account must start with '7').
- The onboarding validation is performed by the `validate_owner_onboarding` Supabase function.

### Project Cleanliness
- All old SQL setup files have been removed for clarity and maintainability.
- Use only `spr_hoa_unified_setup.sql` for future database setup or migrations.

7. Run the development server:
   ```bash
   npm run dev
   ```

## Database Schema

### owners_master
- `id` (uuid, primary key)
- `unit_number` (text, unique)
- `hoa_account_number` (text)
- `is_verified` (boolean)
- `created_at` (timestamp)

### owner_profiles
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `unit_number` (text)
- `first_name` (text)
- `last_name` (text)
- `email` (text)
- `phone` (text, nullable)
- `directory_opt_in` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Design System

- **Primary Color**: Royal Blue (#003366)
- **Accent Color**: Seafoam (#7FCDCD)
- **Typography**: 
  - Headers: Playfair Display
  - Body: Inter
- **Effects**: Glass-morphism with backdrop blur
- **Animations**: Smooth transitions with Framer Motion

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run lint
```

## License

Private - For Sandpiper Run HOA use only