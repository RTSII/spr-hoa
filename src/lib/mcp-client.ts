// MCP Client for SPR-HOA Portal
// This service handles connections to the ReactBits MCP server

// Endpoint URLs
export const MCP_SSE_ENDPOINT = 'https://react-bits-mcp.davidhzdev.workers.dev/sse'
export const MCP_JSON_RPC_ENDPOINT = 'https://react-bits-mcp.davidhzdev.workers.dev/mcp'

// Event callback type
type EventCallback = (data: any) => void

// MCP Client class
export class MCPClient {
  private eventSource: EventSource | null = null
  private eventListeners: Map<string, Set<EventCallback>> = new Map()
  private reconnectTimeout: number = 2000 // Initial reconnect timeout in ms
  private maxReconnectTimeout: number = 30000 // Max reconnect timeout in ms
  private isConnected: boolean = false

  // Method to connect to the SSE endpoint
  public connectSSE(): void {
    if (this.eventSource) {
      this.eventSource.close()
    }

    try {
      this.eventSource = new EventSource(MCP_SSE_ENDPOINT)

      this.eventSource.onopen = () => {
        console.log('Connected to MCP SSE endpoint')
        this.isConnected = true
        this.reconnectTimeout = 2000 // Reset reconnect timeout on successful connection
      }

      this.eventSource.onerror = (error) => {
        console.error('MCP SSE connection error:', error)
        this.isConnected = false
        this.eventSource?.close()
        this.eventSource = null

        // Implement exponential backoff for reconnection
        setTimeout(() => this.connectSSE(), this.reconnectTimeout)
        this.reconnectTimeout = Math.min(this.reconnectTimeout * 1.5, this.maxReconnectTimeout)
      }

      // Listen for messages and dispatch to registered callbacks
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type) {
            this.dispatchEvent(data.type, data)
            // Also dispatch to wildcard listeners
            this.dispatchEvent('*', data)
          }
        } catch (error) {
          console.error('Error parsing SSE event data:', error)
        }
      }
    } catch (error) {
      console.error('Failed to connect to MCP SSE endpoint:', error)
    }
  }

  // Method to make JSON RPC calls
  public async callRPC(method: string, params: any = {}): Promise<any> {
    try {
      const response = await fetch(MCP_JSON_RPC_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now().toString(),
          method,
          params,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(`RPC error: ${data.error.message || JSON.stringify(data.error)}`)
      }

      return data.result
    } catch (error) {
      console.error(`MCP RPC call failed for method '${method}':`, error)
      throw error
    }
  }

  // Register event listener
  public on(eventType: string, callback: EventCallback): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set())
    }

    this.eventListeners.get(eventType)!.add(callback)
  }

  // Remove event listener
  public off(eventType: string, callback: EventCallback): void {
    if (this.eventListeners.has(eventType)) {
      this.eventListeners.get(eventType)!.delete(callback)
    }
  }

  // Dispatch event to registered callbacks
  private dispatchEvent(eventType: string, data: any): void {
    if (this.eventListeners.has(eventType)) {
      this.eventListeners.get(eventType)!.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event handler for '${eventType}':`, error)
        }
      })
    }
  }

  // Check connection status
  public isConnectedToSSE(): boolean {
    return this.isConnected
  }

  // Disconnect from SSE endpoint
  public disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
      this.isConnected = false
    }
  }
}

// Singleton instance
export const mcpClient = new MCPClient()
