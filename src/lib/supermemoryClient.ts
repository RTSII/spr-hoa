// Supermemory.ai REST API client for Sandpiper Run Portal
// MCP URL and API key are injected from environment variables for security

const MCP_URL = process.env.NEXT_PUBLIC_SUPERMEMORY_MCP_URL || 'https://mcp.supermemory.ai/guyugQ3xRxBWjmW7izcQx/sse';
const API_KEY = process.env.NEXT_PUBLIC_SUPERMEMORY_API_KEY || 'sm_mTx77GLefaYFCKTRmJcKRh_JRTcGtPbVPmfcDrNmTBSmXKYuBbQGajHxxIfWQvWfiTGIUPBsWBZdQRZMugYPyPC';

export async function supermemorySearch(query: string, context?: string) {
  const body = {
    query,
    context,
    stream: false
  };
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('Supermemory.ai search failed');
  return res.json();
}
