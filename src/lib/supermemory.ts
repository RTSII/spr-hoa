import axios from 'axios'

const SUPERMEMORY_URL = import.meta.env.VITE_SUPERMEMORY_URL
const SUPERMEMORY_API_KEY = import.meta.env.VITE_SUPERMEMORY_API_KEY

export async function storeAdminMessage({
  title,
  body,
  type,
  building,
  urgent,
  sentAt,
}: {
  title: string
  body: string
  type: string
  building?: string
  urgent?: boolean
  sentAt?: string
}) {
  try {
    const response = await axios.post(
      SUPERMEMORY_URL + '/memory',
      {
        content: `${type.toUpperCase()} | ${title}\n${body}\nBuilding: ${building || 'ALL'} | Urgent: ${urgent ? 'Yes' : 'No'} | Sent: ${sentAt || new Date().toISOString()}`,
        tags: ['hoa', 'admin_message', type, building || 'all'],
        metadata: { urgent, sentAt, building },
      },
      {
        headers: {
          Authorization: `Bearer ${SUPERMEMORY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Supermemory store error:', error)
    return null
  }
}

export async function searchAdminMessages(query: string) {
  try {
    const response = await axios.post(
      SUPERMEMORY_URL + '/search',
      { query, tags: ['hoa', 'admin_message'] },
      {
        headers: {
          Authorization: `Bearer ${SUPERMEMORY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Supermemory search error:', error)
    return null
  }
}

export async function storePhotoMetadata({
  title,
  description,
  category,
  photoUrl,
  userId,
  status,
}: {
  title: string
  description?: string
  category: string
  photoUrl: string
  userId: string
  status: string
}) {
  try {
    const response = await axios.post(
      SUPERMEMORY_URL + '/memory',
      {
        content: `Photo | ${title}\n${description || ''}\nCategory: ${category} | Status: ${status} | Uploaded by: ${userId}\nPhoto URL: ${photoUrl}`,
        tags: ['hoa', 'photo', category, status],
        metadata: { title, description, category, photoUrl, userId, status },
      },
      {
        headers: {
          Authorization: `Bearer ${SUPERMEMORY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Supermemory photo store error:', error)
    return null
  }
}

export async function searchPhotos(query: string, category?: string) {
  try {
    const tags = ['hoa', 'photo']
    if (category) tags.push(category)

    const response = await axios.post(
      SUPERMEMORY_URL + '/search',
      { query, tags },
      {
        headers: {
          Authorization: `Bearer ${SUPERMEMORY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Supermemory photo search error:', error)
    return []
  }
}

export async function storeProfileData({
  userId,
  firstName,
  lastName,
  email,
  phone,
  directoryOptIn,
  showEmail,
  showPhone,
  showUnit,
}: {
  userId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  directoryOptIn: boolean
  showEmail: boolean
  showPhone: boolean
  showUnit: boolean
}) {
  try {
    const response = await axios.post(
      SUPERMEMORY_URL + '/memory',
      {
        content: `PROFILE UPDATE | User: ${firstName} ${lastName} (${email})\nUnit: ${showUnit ? 'Visible' : 'Hidden'} | Email: ${showEmail ? 'Visible' : 'Hidden'} | Phone: ${showPhone ? 'Visible' : 'Hidden'}\nDirectory Opt-In: ${directoryOptIn ? 'Yes' : 'No'} | Phone: ${phone || 'Not provided'}`,
        tags: ['hoa', 'profile', 'profile_update', userId],
        metadata: {
          userId,
          firstName,
          lastName,
          email,
          phone,
          directoryOptIn,
          showEmail,
          showPhone,
          showUnit,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${SUPERMEMORY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Supermemory profile store error:', error)
    return null
  }
}

export async function searchProfiles(query: string) {
  try {
    const response = await axios.post(
      SUPERMEMORY_URL + '/search',
      { query, tags: ['hoa', 'profile'] },
      {
        headers: {
          Authorization: `Bearer ${SUPERMEMORY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Supermemory profile search error:', error)
    return null
  }
}

export async function storeProfileSettings({
  userId,
  firstName,
  lastName,
  email,
  phone,
  directoryOptIn,
  showEmail,
  showPhone,
  showUnit,
  receiveAlerts,
}: {
  userId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  directoryOptIn: boolean
  showEmail: boolean
  showPhone: boolean
  showUnit: boolean
  receiveAlerts?: boolean
}) {
  try {
    const response = await axios.post(
      SUPERMEMORY_URL + '/memory',
      {
        content: `PROFILE SETTINGS | User: ${firstName} ${lastName} (${email})\nUnit: ${showUnit ? 'Visible' : 'Hidden'} | Email: ${showEmail ? 'Visible' : 'Hidden'} | Phone: ${showPhone ? 'Visible' : 'Hidden'}\nDirectory Opt-In: ${directoryOptIn ? 'Yes' : 'No'} | Alerts: ${receiveAlerts ? 'Enabled' : 'Disabled'}\nPhone: ${phone || 'Not provided'}`,
        tags: ['hoa', 'profile', 'profile_settings', userId],
        metadata: {
          userId,
          firstName,
          lastName,
          email,
          phone,
          directoryOptIn,
          showEmail,
          showPhone,
          showUnit,
          receiveAlerts,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${SUPERMEMORY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Supermemory profile settings store error:', error)
    return null
  }
}

export async function searchProfileSettings(query: string) {
  try {
    const response = await axios.post(
      SUPERMEMORY_URL + '/search',
      { query, tags: ['hoa', 'profile', 'profile_settings'] },
      {
        headers: {
          Authorization: `Bearer ${SUPERMEMORY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Supermemory profile settings search error:', error)
    return null
  }
}

export async function storeDevAction({
  action,
  details,
  timestamp,
}: {
  action: string
  details: string
  timestamp: string
}) {
  try {
    const response = await axios.post(
      SUPERMEMORY_URL + '/memory',
      {
        content: `DEV ACTION | ${action}\n${details}\nTimestamp: ${timestamp}`,
        tags: ['hoa', 'dev', 'dev_action', action],
        metadata: { action, details, timestamp },
      },
      {
        headers: {
          Authorization: `Bearer ${SUPERMEMORY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Supermemory dev action store error:', error)
    return null
  }
}

export async function searchDevActions(query: string) {
  try {
    const response = await axios.post(
      SUPERMEMORY_URL + '/search',
      { query, tags: ['hoa', 'dev'] },
      {
        headers: {
          Authorization: `Bearer ${SUPERMEMORY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Supermemory dev actions search error:', error)
    return null
  }
}

export async function storeInviteRequest({
  name,
  unitNumber,
  purchaseDate,
  email,
  timestamp,
}: {
  name: string
  unitNumber: string
  purchaseDate: string
  email: string
  timestamp: string
}) {
  try {
    const response = await axios.post(
      SUPERMEMORY_URL + '/memory',
      {
        content: `INVITE REQUEST | Name: ${name} | Unit: ${unitNumber} | Purchase Date: ${purchaseDate} | Email: ${email}\nTimestamp: ${timestamp}`,
        tags: ['hoa', 'invite', 'invite_request', unitNumber],
        metadata: { name, unitNumber, purchaseDate, email, timestamp },
      },
      {
        headers: {
          Authorization: `Bearer ${SUPERMEMORY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Supermemory invite request store error:', error)
    return null
  }
}

export async function searchInviteRequests(query: string) {
  try {
    const response = await axios.post(
      SUPERMEMORY_URL + '/search',
      { query, tags: ['hoa', 'invite'] },
      {
        headers: {
          Authorization: `Bearer ${SUPERMEMORY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Supermemory invite requests search error:', error)
    return null
  }
}

export async function storeAdminDashboardEvent({
  eventType,
  details,
  timestamp,
}: {
  eventType: string
  details: string
  timestamp: string
}) {
  try {
    const response = await axios.post(
      SUPERMEMORY_URL + '/memory',
      {
        content: `ADMIN DASHBOARD | Event: ${eventType}\n${details}\nTimestamp: ${timestamp}`,
        tags: ['hoa', 'admin', 'dashboard', eventType],
        metadata: { eventType, details, timestamp },
      },
      {
        headers: {
          Authorization: `Bearer ${SUPERMEMORY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Supermemory admin dashboard store error:', error)
    return null
  }
}

export async function searchAdminDashboardEvents(query: string) {
  try {
    const response = await axios.post(
      SUPERMEMORY_URL + '/search',
      { query, tags: ['hoa', 'admin', 'dashboard'] },
      {
        headers: {
          Authorization: `Bearer ${SUPERMEMORY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Supermemory admin dashboard search error:', error)
    return null
  }
}
