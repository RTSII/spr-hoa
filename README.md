# Sandpiper Run Owners Portal

A premium web portal exclusively for owners at Sandpiper Run, a luxury oceanfront development in Pawleys Island, SC.

## Features

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
   VITE_SUPERMEMORY_API_KEY=sm_mTx77GLefaYFCKTRmJcKRh_JRTcGtPbVPmfcDrNmTBSmXKYuBbQGajHxxIfWQvWfiTGIUPBsWBZdQRZMugYPyPC
   ```

6. Set up Supabase tables (see Database Schema section)

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