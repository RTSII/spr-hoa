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
