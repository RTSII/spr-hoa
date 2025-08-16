import React, { useState, useEffect } from 'react'
import { useMCP, useMCPRPC } from '../contexts/MCPContext'

interface MCPDashboardProps {
  onClose?: () => void
}

// Removed unused icons

const MCPDashboard: React.FC<MCPDashboardProps> = ({ onClose }) => {
  const { client, isConnected, lastEvent } = useMCP()
  const { callRPC, loading, error } = useMCPRPC()

  const [events, setEvents] = useState<any[]>([])
  const [rpcMethod, setRpcMethod] = useState('ping')
  const [rpcParams, setRpcParams] = useState('{}')
  const [rpcResult, setRpcResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'events' | 'rpc'>('events')

  // Add events to the events array
  useEffect(() => {
    if (lastEvent) {
      setEvents((prev) => {
        // Keep only the last 10 events
        const newEvents = [lastEvent, ...prev.slice(0, 9)]
        return newEvents
      })
    }
  }, [lastEvent])

  // Function to handle RPC call
  const handleRpcCall = async () => {
    try {
      let params = {}
      try {
        params = JSON.parse(rpcParams)
      } catch (err) {
        console.error('Invalid JSON for params:', err)
        setRpcResult({ error: 'Invalid JSON for params' })
        return
      }

      const result = await callRPC(rpcMethod, params)
      setRpcResult(result)
    } catch (err) {
      console.error('RPC call failed:', err)
      setRpcResult({ error: String(err) })
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <div
            className={`mr-2 h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span className="text-white">
            {isConnected ? 'Connected to ReactBits MCP' : 'Disconnected from MCP'}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => client.connectSSE()}
            disabled={isConnected}
            className={`rounded px-3 py-1 text-sm ${
              isConnected
                ? 'cursor-not-allowed bg-gray-700 text-gray-400'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isConnected ? 'Connected' : 'Connect'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-sm text-white/70 hover:text-white"
              aria-label="Back to Dashboard"
            >
              Back
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'events'
                ? 'border-b-2 border-blue-400 text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab('rpc')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'rpc'
                ? 'border-b-2 border-blue-400 text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            RPC Calls
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'events' ? (
        <div>
          <div className="mb-2 font-semibold text-white">Recent Events</div>
          <div className="h-80 overflow-y-auto rounded-lg border border-gray-700 bg-gray-800/40 p-4">
            {events.length > 0 ? (
              <div className="space-y-3">
                {events.map((event, index) => (
                  <div key={index} className="rounded-lg border border-gray-700 bg-gray-800/60 p-3">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="font-medium text-white">{event.type || 'Unknown Event'}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(event.timestamp || Date.now()).toLocaleTimeString()}
                      </div>
                    </div>
                    <pre className="overflow-x-auto rounded bg-gray-900/50 p-2 text-xs text-gray-300">
                      {JSON.stringify(event, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-400">No events received yet</div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-2 font-semibold text-white">RPC Call</div>
          <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-4">
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-300">Method</label>
              <input
                type="text"
                value={rpcMethod}
                onChange={(e) => setRpcMethod(e.target.value)}
                placeholder="Method name"
                className="w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-white"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Parameters (JSON)
              </label>
              <textarea
                value={rpcParams}
                onChange={(e) => setRpcParams(e.target.value)}
                placeholder="{}"
                className="w-full rounded-md border border-gray-700 bg-gray-800 p-2 font-mono text-sm text-white"
                rows={4}
              />
            </div>

            <button
              onClick={handleRpcCall}
              disabled={loading || !isConnected}
              className={`w-full rounded-md px-4 py-2 ${
                loading || !isConnected
                  ? 'cursor-not-allowed bg-gray-700 text-gray-400'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Calling...' : 'Call RPC Method'}
            </button>

            {error && (
              <div className="mt-4 rounded-md border border-red-700 bg-red-900/30 p-3 text-sm text-red-400">
                Error: {error.message}
              </div>
            )}

            {rpcResult && (
              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-gray-300">Result</label>
                <pre className="overflow-x-auto rounded-md bg-gray-900/50 p-3 text-xs text-gray-300">
                  {JSON.stringify(rpcResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MCPDashboard
