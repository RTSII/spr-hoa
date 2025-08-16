import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { MCPClient, mcpClient } from '../lib/mcp-client'

// Define the context type
interface MCPContextType {
  client: MCPClient
  isConnected: boolean
  lastEvent: any | null
}

// Create the context with default values
const MCPContext = createContext<MCPContextType>({
  client: mcpClient,
  isConnected: false,
  lastEvent: null,
})

interface MCPProviderProps {
  children: ReactNode
}

export const MCPProvider: React.FC<MCPProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<any | null>(null)

  useEffect(() => {
    // Check if we're in a browser environment before connecting
    if (typeof window !== 'undefined') {
      // Connect to the SSE endpoint
      mcpClient.connectSSE()

      // Setup a status listener
      const statusListener = (data: any) => {
        setIsConnected(true)
        setLastEvent(data)
      }

      // Listen for status events
      mcpClient.on('status', statusListener)

      // Listen for all events to update lastEvent
      const anyEventListener = (data: any) => {
        setLastEvent(data)
      }
      mcpClient.on('*', anyEventListener)

      // Cleanup on unmount
      return () => {
        mcpClient.off('status', statusListener)
        mcpClient.off('*', anyEventListener)
        mcpClient.disconnect()
      }
    }
  }, [])

  // Context value
  const contextValue: MCPContextType = {
    client: mcpClient,
    isConnected,
    lastEvent,
  }

  return <MCPContext.Provider value={contextValue}>{children}</MCPContext.Provider>
}

// Custom hook to use the MCP context
export const useMCP = () => useContext(MCPContext)

// Hook to subscribe to specific event types
export const useMCPEvent = <T,>(eventType: string) => {
  const { client } = useMCP()
  const [eventData, setEventData] = useState<T | null>(null)

  useEffect(() => {
    const handleEvent = (data: T) => {
      setEventData(data)
    }

    client.on(eventType, handleEvent)

    return () => {
      client.off(eventType, handleEvent)
    }
  }, [client, eventType])

  return eventData
}

// Hook to call RPC methods
export const useMCPRPC = () => {
  const { client } = useMCP()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const callRPC = async <T,>(method: string, params: any = {}) => {
    setLoading(true)
    setError(null)

    try {
      const result = await client.callRPC(method, params)
      setLoading(false)
      return result as T
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      setLoading(false)
      throw err
    }
  }

  return { callRPC, loading, error }
}
