// Admin Setup Helper Script
// Run this in your browser console after logging into the portal

async function setupAdmin() {
  console.log('🔧 Setting up admin access...');

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('❌ No user logged in. Please log in first.');
      return;
    }

    console.log('✅ Found user:', user.email);
    console.log('📋 User ID:', user.id);

    // Make this user an admin
    const { error } = await supabase
      .from('admin_users')
      .insert({
        user_id: user.id,
        role: 'admin'
      });

    if (error) {
      if (error.code === '23505') {
        console.log('ℹ️ User is already an admin');
      } else {
        console.error('❌ Error making admin:', error);
      }
    } else {
      console.log('✅ Successfully made user admin');
    }

    // Verify admin status
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (adminData) {
      console.log('✅ Admin confirmed with role:', adminData.role);
    }

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Usage: Copy this entire script and paste in browser console after logging in
// Then run: setupAdmin()