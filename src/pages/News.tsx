import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'

const News = () => {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [supermemoryQuery, setSupermemoryQuery] = useState('')
  const [supermemoryResults, setSupermemoryResults] = useState<any[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiSearched, setAiSearched] = useState(false)

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true)
      let query = supabase.from('news_posts').select('*').order('created_at', { ascending: false })
      if (search) {
        query = query.textSearch('search_vector', search, { type: 'plain' })
      }
      if (tagFilter) {
        query = query.contains('tags', [tagFilter])
      }
      const { data, error } = await query
      if (!error && data) {
        setPosts(data)
        // Collect unique tags
        const allTags = Array.from(new Set(data.flatMap((p: any) => p.tags || [])))
        setTags(allTags)
      }
      setLoading(false)
    }
    fetchPosts()
  }, [search, tagFilter])

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <h1 className="mb-6 font-display text-3xl font-bold text-white">News & Announcements</h1>
        {/* Supermemory AI Search Bar */}
        <form
          className="mb-6 flex flex-wrap gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!supermemoryQuery) return
            const { supermemorySearch } = await import('../lib/supermemoryClient')
            try {
              setAiError(null)
              setAiSearched(true)
              setAiLoading(true)
              setSupermemoryResults([])
              const result = await supermemorySearch(supermemoryQuery, 'news')
              const items = Array.isArray(result)
                ? result
                : Array.isArray(result?.results)
                ? result.results
                : []
              setSupermemoryResults(items)
            } catch (err) {
              const message = err instanceof Error ? err.message : 'Unknown error'
              setAiError(message)
              setSupermemoryResults([])
            } finally {
              setAiLoading(false)
            }
          }}
          role="search"
          aria-label="AI-powered news search"
        >
          <input
            type="text"
            placeholder="AI-powered news search (e.g. 'emergency repairs', 'pool schedule')"
            value={supermemoryQuery}
            onChange={(e) => setSupermemoryQuery(e.target.value)}
            className="min-w-[180px] flex-1 rounded border border-white/20 bg-white/10 p-2 text-white focus:ring-2 focus:ring-[var(--spr-blue)]"
            aria-label="AI-powered news search"
          />
          <button type="submit" className="glass-button text-sm" disabled={!supermemoryQuery}>
            🔍 AI Search
          </button>
        </form>
        {aiLoading && (
          <div className="mb-4 rounded border border-white/20 bg-white/10 p-3 text-white/80">
            Searching with AI...
          </div>
        )}
        {aiError && (
          <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 p-3 text-red-300">
            AI search failed: {aiError}
          </div>
        )}
        {aiSearched && !aiLoading && supermemoryResults.length === 0 && !aiError && (
          <div className="mb-4 rounded border border-white/20 bg-white/10 p-3 text-white/70">
            No AI results found.
          </div>
        )}
        {!aiLoading && supermemoryResults.length > 0 && (
          <div className="mb-6 text-white/80">
            <div className="mb-2 font-bold">AI Search Results</div>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {supermemoryResults.map((res: any, i: number) => {
                const content = typeof res === 'string' ? res : res?.content || ''
                const title = (content || '').split('\n')[0] || 'Result'
                const snippet = (content || '').split('\n')[1] || ''
                const score = typeof res?.score === 'number' ? res.score.toFixed(3) : undefined
                return (
                  <div key={i} className="rounded-lg border border-white/20 bg-white/10 p-3">
                    <div className="font-medium text-white">{title}</div>
                    {snippet && <div className="text-sm text-white/80">{snippet}</div>}
                    {score && <div className="mt-1 text-xs text-white/60">Score: {score}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}
        <form className="mb-8 flex flex-wrap gap-4" role="search" aria-label="Search news posts">
          <input
            type="text"
            placeholder="Search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[180px] flex-1 rounded border border-white/20 bg-white/10 p-2 text-white focus:ring-2 focus:ring-[var(--spr-blue)]"
            aria-label="Search news posts"
          />
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="min-w-[140px] rounded border border-white/20 bg-white/10 p-2 text-white focus:ring-2 focus:ring-[var(--spr-blue)]"
            aria-label="Filter by tag"
          >
            <option value="">All Tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </form>
        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-white/70">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-white/70">No news found.</div>
          ) : (
            posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                className="glass-card p-6"
                tabIndex={0}
                role="article"
                aria-label={post.title}
              >
                <div className="flex flex-col gap-2">
                  <div className="mb-2 flex items-center gap-4">
                    <h2 className="flex-1 text-2xl font-semibold text-white">{post.title}</h2>
                    <span className="text-xs text-white/50">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mb-2 flex items-center gap-4 text-sm text-white/60">
                    <span>By {post.author_id || 'Admin'}</span>
                    {post.tags && post.tags.length > 0 && (
                      <span className="flex flex-wrap gap-2">
                        {post.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="bg-[var(--spr-blue)]/20 rounded-full px-2 py-0.5 text-xs font-medium text-[var(--spr-blue)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                  <div
                    className="prose prose-invert max-w-none text-white/90"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(post.body || '', {
                        ALLOWED_TAGS: [
                          'p',
                          'br',
                          'strong',
                          'em',
                          'ul',
                          'ol',
                          'li',
                          'a',
                          'h1',
                          'h2',
                          'h3',
                          'h4',
                          'blockquote',
                        ],
                        ALLOWED_ATTR: ['href', 'target', 'rel'],
                        ALLOW_ARIA_ATTR: false,
                        ALLOW_DATA_ATTR: false,
                      }),
                    }}
                  />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default News
