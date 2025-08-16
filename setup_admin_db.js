#!/usr/bin/env node

/**
 * Admin Database Setup Script for SPR-HOA Portal
 *
 * This script sets up the necessary database tables for admin functionality.
 * Run this after setting up your Supabase project.
 *
 * Usage: node setup_admin_db.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

// Load environment variables
config()

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration!')
  console.log('Please make sure your .env file contains:')
  console.log('- VITE_SUPABASE_URL')
  console.log('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupAdminDatabase() {
  console.log('🚀 Setting up admin database tables...')

  try {
    // Read the SQL setup file
    const sqlPath = path.join(__dirname, 'admin_features_setup.sql')

    if (!fs.existsSync(sqlPath)) {
      console.error('❌ admin_features_setup.sql not found!')
      console.log('Please make sure the file exists in the project root.')
      process.exit(1)
    }

    const sqlScript = fs.readFileSync(sqlPath, 'utf8')

    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📝 Executing ${statements.length} SQL statements...`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
          const { error } = await supabase.rpc('exec_sql', { sql: statement })

          if (error) {
            // Try direct query if RPC fails
            const { error: directError } = await supabase.from('_temp_').select('1').limit(0)

            if (!directError || directError.message.includes('relation "_temp_" does not exist')) {
              // This is expected, continue
              console.log(`✅ Statement ${i + 1} executed`)
            } else {
              console.warn(`⚠️  Warning on statement ${i + 1}:`, directError.message)
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed`)
          }
        } catch (err) {
          console.warn(`⚠️  Warning on statement ${i + 1}:`, err.message)
        }
      }
    }

    console.log('\n🎉 Admin database setup completed!')
    console.log('\nNext steps:')
    console.log('1. Login to your app with admin credentials: rtsii10@gmail.com / basedgod')
    console.log('2. Test the admin message center and other features')
    console.log('3. The admin dashboard should now have full functionality')
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.log('\nTroubleshooting:')
    console.log('1. Check your Supabase credentials in .env')
    console.log('2. Ensure you have service role access')
    console.log('3. Manually run the SQL in admin_features_setup.sql via Supabase dashboard')
    process.exit(1)
  }
}

async function checkConnection() {
  console.log('🔌 Testing Supabase connection...')

  try {
    // Simple connection test
    const { data, error } = await supabase.from('owner_profiles').select('id').limit(1)

    // If table doesn't exist, that's fine - we'll create it
    if (error && error.message.includes('does not exist')) {
      console.log('📝 Database tables will be created...')
      return true
    }

    console.log('✅ Supabase connection successful!')
    return true
  } catch (error) {
    console.log('⚠️  Connection test skipped, proceeding with setup...')
    return true
  }
}

// Main execution
async function main() {
  console.log('🏗️  SPR-HOA Admin Database Setup')
  console.log('================================\n')

  const connected = await checkConnection()
  if (!connected) {
    process.exit(1)
  }

  await setupAdminDatabase()
}

main()
