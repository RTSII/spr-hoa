import { supabase } from './supabase'

export interface AdminMessage {
  id: string
  admin_user_id: string
  message_type: 'emergency' | 'general' | 'maintenance' | 'event'
  title: string
  content: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  recipients_count: number
  sent_at: string
  created_at: string
}

export interface PhotoSubmission {
  id: string
  user_id: string
  title: string
  description?: string
  file_path: string
  file_url?: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string
  admin_notes?: string
  reviewed_by?: string
  reviewed_at?: string
  category: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface ProfilePicture {
  profile_id: string
  user_id: string
  profile_picture_url: string
  profile_picture_status: 'idle' | 'pending' | 'approved' | 'rejected'
  profile_picture_submitted_at?: string
  profile_picture_reviewed_at?: string
  profile_picture_rejection_reason?: string
  profile_picture_admin_notes?: string
  first_name: string
  last_name: string
  unit_number: string
}

export interface NewsPost {
  id: string
  admin_user_id: string
  title: string
  content: string
  excerpt?: string
  category: string
  status: 'draft' | 'published' | 'archived'
  featured_image_url?: string
  tags?: string[]
  views_count: number
  published_at?: string
  created_at: string
  updated_at: string
}

export interface AdminStats {
  active_users: number
  total_users: number
  pending_photos: number
  published_news: number
  messages_sent: number
  recent_activity: number
}

export interface SystemSetting {
  id: string
  setting_key: string
  setting_value: string
  setting_type: 'string' | 'number' | 'boolean' | 'json'
  description?: string
  is_public: boolean
  updated_by?: string
  created_at: string
  updated_at: string
}

// Message Center Functions
export const adminService = {
  // Send admin message/announcement
  async sendMessage(messageData: {
    message_type: AdminMessage['message_type']
    title: string
    content: string
    priority?: AdminMessage['priority']
  }) {
    const { data, error } = await supabase.rpc('send_admin_message', {
      p_message_type: messageData.message_type,
      p_title: messageData.title,
      p_content: messageData.content,
      p_priority: messageData.priority || 'medium',
    })

    if (error) throw error
    return data
  },

  // Get recent admin messages
  async getRecentMessages(limit = 10) {
    const { data, error } = await supabase
      .from('admin_messages')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as AdminMessage[]
  },

  // User Management Functions
  async getAllUsers() {
    const { data, error } = await supabase
      .from('owner_profiles')
      .select(
        `
        *,
        user:auth.users(email, created_at)
      `,
      )
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async updateUserStatus(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('owner_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()

    if (error) throw error
    return data
  },

  // Photo Management Functions
  async getPendingPhotoSubmissions() {
    const { data, error } = await supabase
      .from('photo_submissions')
      .select(
        `
        *,
        user:auth.users(email),
        profile:owner_profiles(first_name, last_name, unit_number)
      `,
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getAllPhotoSubmissions() {
    const { data, error } = await supabase
      .from('photo_submissions')
      .select(
        `
        *,
        user:auth.users(email),
        profile:owner_profiles(first_name, last_name, unit_number)
      `,
      )
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async reviewPhotoSubmission(
    submissionId: string,
    status: 'approved' | 'rejected',
    adminNotes?: string,
    rejectionReason?: string,
  ) {
    const { data, error } = await supabase.rpc('admin_review_photo', {
      p_submission_id: submissionId,
      p_status: status,
      p_admin_notes: adminNotes,
      p_rejection_reason: rejectionReason,
    })

    if (error) throw error
    return data
  },

  // Profile Picture Management
  async getPendingProfilePictures() {
    const { data, error } = await supabase
      .from('owner_profiles')
      .select(
        `
        id,
        user_id,
        first_name,
        last_name,
        unit_number,
        profile_picture_url,
        profile_picture_status,
        profile_picture_submitted_at,
        profile_picture_reviewed_at,
        profile_picture_rejection_reason,
        profile_picture_admin_notes
      `,
      )
      .eq('profile_picture_status', 'pending')
      .order('profile_picture_submitted_at', { ascending: false })

    if (error) throw error
    return data
  },

  async reviewProfilePicture(
    profileId: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string,
    adminNotes?: string,
  ) {
    const { data, error } = await supabase.rpc('admin_review_profile_picture', {
      p_profile_id: profileId,
      p_status: status,
      p_rejection_reason: rejectionReason,
      p_admin_notes: adminNotes,
    })

    if (error) throw error
    return data
  },

  // News Management Functions
  async createNewsPost(newsData: {
    title: string
    content: string
    excerpt?: string
    category?: string
    status?: NewsPost['status']
    featured_image_url?: string
    tags?: string[]
  }) {
    const { data, error } = await supabase
      .from('news_posts')
      .insert({
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        ...newsData,
      })
      .select()

    if (error) throw error
    return data[0] as NewsPost
  },

  async updateNewsPost(postId: string, updates: Partial<NewsPost>) {
    const { data, error } = await supabase
      .from('news_posts')
      .update(updates)
      .eq('id', postId)
      .select()

    if (error) throw error
    return data[0] as NewsPost
  },

  async deleteNewsPost(postId: string) {
    const { data, error } = await supabase.from('news_posts').delete().eq('id', postId)

    if (error) throw error
    return data
  },

  async getAllNewsPosts() {
    const { data, error } = await supabase
      .from('news_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as NewsPost[]
  },

  async publishNewsPost(postId: string) {
    const { data, error } = await supabase
      .from('news_posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .select()

    if (error) throw error
    return data[0] as NewsPost
  },

  // Analytics Functions
  async getAdminDashboardStats(): Promise<AdminStats> {
    const { data, error } = await supabase.rpc('get_admin_dashboard_stats')

    if (error) throw error
    return data as AdminStats
  },

  async logUserActivity(activityData: {
    activity_type: string
    page_visited?: string
    action_taken?: string
    metadata?: any
  }) {
    const { data, error } = await supabase.from('user_activity_logs').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      ...activityData,
    })

    if (error) throw error
    return data
  },

  async getUserActivityLogs(limit = 50) {
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select(
        `
        *,
        user:auth.users(email),
        profile:owner_profiles(first_name, last_name, unit_number)
      `,
      )
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  // System Settings Functions
  async getSystemSettings() {
    const { data, error } = await supabase.from('system_settings').select('*').order('setting_key')

    if (error) throw error
    return data as SystemSetting[]
  },

  async updateSystemSetting(settingKey: string, settingValue: string) {
    const { data, error } = await supabase
      .from('system_settings')
      .update({
        setting_value: settingValue,
        updated_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .eq('setting_key', settingKey)
      .select()

    if (error) throw error
    return data[0] as SystemSetting
  },

  async getPublicSettings() {
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value')
      .eq('is_public', true)

    if (error) throw error
    return data
  },

  // Bulk Operations
  async bulkApprovePhotos(submissionIds: string[]) {
    const promises = submissionIds.map((id) =>
      this.reviewPhotoSubmission(id, 'approved', 'Bulk approved by admin'),
    )

    return Promise.all(promises)
  },

  async bulkRejectPhotos(submissionIds: string[], reason: string) {
    const promises = submissionIds.map((id) =>
      this.reviewPhotoSubmission(id, 'rejected', 'Bulk rejected by admin', reason),
    )

    return Promise.all(promises)
  },

  async bulkApproveProfilePictures(profileIds: string[]) {
    const promises = profileIds.map((id) =>
      this.reviewProfilePicture(id, 'approved', undefined, 'Bulk approved by admin'),
    )

    return Promise.all(promises)
  },

  async bulkRejectProfilePictures(profileIds: string[], reason: string) {
    const promises = profileIds.map((id) =>
      this.reviewProfilePicture(id, 'rejected', reason, 'Bulk rejected by admin'),
    )

    return Promise.all(promises)
  },
}

// Utility functions
export const formatMessageType = (type: AdminMessage['message_type']) => {
  const types = {
    emergency: 'Emergency Alert',
    general: 'General Notice',
    maintenance: 'Maintenance Notice',
    event: 'Event Announcement',
  }
  return types[type] || type
}

export const formatPriority = (priority: AdminMessage['priority']) => {
  const priorities = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  }
  return priorities[priority] || priority
}

export const getPriorityColor = (priority: AdminMessage['priority']) => {
  const colors = {
    low: 'text-green-400',
    medium: 'text-blue-400',
    high: 'text-orange-400',
    urgent: 'text-red-400',
  }
  return colors[priority] || 'text-gray-400'
}
