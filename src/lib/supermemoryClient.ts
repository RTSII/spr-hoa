// Supermemory.ai REST API client for Sandpiper Run Portal
// MCP URL and API key are injected from environment variables for security

const SUPERMEMORY_URL = import.meta.env.VITE_SUPERMEMORY_URL as string | undefined
const SUPERMEMORY_API_KEY = import.meta.env.VITE_SUPERMEMORY_API_KEY as string | undefined

export async function supermemorySearch(query: string, context?: string) {
  if (!SUPERMEMORY_URL) {
    throw new Error('VITE_SUPERMEMORY_URL is not set')
  }

  // Determine if provided URL is a base REST URL or a streaming/MCP endpoint
  const isRestBase = !SUPERMEMORY_URL.endsWith('/sse') && !SUPERMEMORY_URL.endsWith('/mcp')
  const endpoint = isRestBase
    ? `${SUPERMEMORY_URL.replace(/\/$/, '')}/search`
    : SUPERMEMORY_URL

  // Build request body depending on endpoint style
  const body = isRestBase
    ? { ...(context ? { tags: [context] } : {}), query }
    : { query, context, stream: false }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (SUPERMEMORY_API_KEY) headers['Authorization'] = `Bearer ${SUPERMEMORY_API_KEY}`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Supermemory.ai search failed (${res.status}): ${text}`)
  }
  return res.json()
}
