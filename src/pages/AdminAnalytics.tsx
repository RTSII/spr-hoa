import React, { useEffect, useMemo, useState } from 'react'
import { searchAdminAnalytics } from '../lib/supermemory'

type ResultItem = {
  id?: string
  score?: number
  content?: string
  tags?: string[]
  metadata?: Record<string, any>
}

const TYPES = [
  { label: 'All', value: 'all' },
  { label: 'Page Views', value: 'page_view' },
  { label: 'Actions', value: 'action' },
  { label: 'Errors', value: 'error' },
] as const

const AdminAnalytics: React.FC = () => {
  const [type, setType] = useState<(typeof TYPES)[number]['value']>('all')
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<ResultItem[]>([])

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await searchAdminAnalytics({ query: q, type })
        const items: ResultItem[] = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.results)
          ? (data as any).results
          : []
        setResults(items)
      } catch (e: any) {
        setError(e?.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [type, q])

  const counts = useMemo(() => {
    const c = { page_view: 0, action: 0, error: 0 }
    for (const r of results) {
      const tags = r.tags || []
      if (tags.includes('page_view')) c.page_view++
      if (tags.includes('action')) c.action++
      if (tags.includes('error')) c.error++
    }
    return c
  }, [results])

  return (
    <div className="mx-auto max-w-5xl p-6 text-white">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">Admin Analytics</h1>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="text-sm opacity-70">Page Views</div>
          <div className="text-2xl font-bold">{counts.page_view}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="text-sm opacity-70">Actions</div>
          <div className="text-2xl font-bold">{counts.action}</div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="text-sm opacity-70">Errors</div>
          <div className="text-2xl font-bold">{counts.error}</div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="rounded border border-white/20 bg-white/10 px-3 py-2"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search keywords..."
          className="min-w-[240px] flex-1 rounded border border-white/20 bg-white/10 px-3 py-2 placeholder-white/50"
        />
      </div>

      {loading && (
        <div className="flex items-center gap-3 rounded border border-white/10 bg-white/5 p-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <div>Loading analytics...</div>
        </div>
      )}

      {error && (
        <div className="rounded border border-red-500/30 bg-red-900/20 p-3 text-red-200">{error}</div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="rounded border border-white/10 bg-white/5 p-4">No results</div>
      )}

      <div className="mt-4 space-y-3">
        {results.map((r, idx) => {
          const path = r.metadata?.path || (r.tags || []).find((t) => t.startsWith('/'))
          const time = r.metadata?.timestamp
          return (
            <div
              key={r.id || idx}
              className="rounded-lg border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-4"
            >
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm text-white/70">
                  {(r.tags || []).filter((t) => !t.startsWith('hoa')).join(' • ')}
                </div>
                {typeof r.score === 'number' && (
                  <div className="text-xs text-white/50">score {(r.score * 100).toFixed(0)}%</div>
                )}
              </div>
              <div className="font-medium">{r.content?.split('\n')[0] || 'Event'}</div>
              {path && <div className="text-sm text-white/70">Path: {path}</div>}
              {time && <div className="text-xs text-white/50">{time}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdminAnalytics
