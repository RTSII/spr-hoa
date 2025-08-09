import axios from 'axios';

const SUPERMEMORY_URL = import.meta.env.VITE_SUPERMEMORY_URL;
const SUPERMEMORY_API_KEY = import.meta.env.VITE_SUPERMEMORY_API_KEY;

export async function storeAdminMessage({ title, body, type, building, urgent, sentAt }: {
  title: string;
  body: string;
  type: string;
  building?: string;
  urgent?: boolean;
  sentAt?: string;
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
          'Authorization': `Bearer ${SUPERMEMORY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Supermemory store error:', error);
    return null;
  }
}

export async function searchAdminMessages(query: string) {
  try {
    const response = await axios.post(
      SUPERMEMORY_URL + '/search',
      { query, tags: ['hoa', 'admin_message'] },
      {
        headers: {
          'Authorization': `Bearer ${SUPERMEMORY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Supermemory search error:', error);
    return [];
  }
}

export async function storePhotoMetadata({ title, description, category, photoUrl, userId, status }: {
  title: string;
  description?: string;
  category: string;
  photoUrl: string;
  userId: string;
  status: string;
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
          'Authorization': `Bearer ${SUPERMEMORY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Supermemory photo store error:', error);
    return null;
  }
}

export async function searchPhotos(query: string, category?: string) {
  try {
    const tags = ['hoa', 'photo'];
    if (category) tags.push(category);
    
    const response = await axios.post(
      SUPERMEMORY_URL + '/search',
      { query, tags },
      {
        headers: {
          'Authorization': `Bearer ${SUPERMEMORY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Supermemory photo search error:', error);
    return [];
  }
}
