import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

const News = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [supermemoryQuery, setSupermemoryQuery] = useState('');
  const [supermemoryResults, setSupermemoryResults] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      let query = supabase.from('news_posts').select('*').order('created_at', { ascending: false });
      if (search) {
        query = query.textSearch('search_vector', search, { type: 'plain' });
      }
      if (tagFilter) {
        query = query.contains('tags', [tagFilter]);
      }
      const { data, error } = await query;
      if (!error && data) {
        setPosts(data);
        // Collect unique tags
        const allTags = Array.from(new Set(data.flatMap((p: any) => p.tags || [])));
        setTags(allTags);
      }
      setLoading(false);
    }
    fetchPosts();
  }, [search, tagFilter]);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <h1 className="text-3xl font-display font-bold text-white mb-6">
          News & Announcements
        </h1>
        {/* Supermemory AI Search Bar */}
        <form
          className="flex flex-wrap gap-4 mb-6"
          onSubmit={async e => {
            e.preventDefault();
            if (!supermemoryQuery) return;
            const { supermemorySearch } = await import('../lib/supermemoryClient');
            try {
              const result = await supermemorySearch(supermemoryQuery, 'news-section');
              setSupermemoryResults(result?.results || []);
            } catch (err) {
              setSupermemoryResults([]);
            }
          }}
          role="search"
          aria-label="AI-powered news search"
        >
          <input
            type="text"
            placeholder="AI-powered news search (e.g. 'emergency repairs', 'pool schedule')"
            value={supermemoryQuery}
            onChange={e => setSupermemoryQuery(e.target.value)}
            className="flex-1 min-w-[180px] p-2 rounded bg-white/10 text-white border border-white/20 focus:ring-2 focus:ring-[var(--spr-blue)]"
            aria-label="AI-powered news search"
          />
          <button
            type="submit"
            className="glass-button text-sm"
            disabled={!supermemoryQuery}
          >
            🔍 AI Search
          </button>
        </form>
        {supermemoryResults.length > 0 && (
          <div className="mb-6 text-white/80">
            <div className="font-bold mb-1">AI Search Results:</div>
            <ul className="list-disc ml-6">
              {supermemoryResults.map((res, i) => (
                <li key={i}>{typeof res === 'string' ? res : JSON.stringify(res)}</li>
              ))}
            </ul>
          </div>
        )}
        <form className="flex flex-wrap gap-4 mb-8" role="search" aria-label="Search news posts">
          <input
            type="text"
            placeholder="Search news..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] p-2 rounded bg-white/10 text-white border border-white/20 focus:ring-2 focus:ring-[var(--spr-blue)]"
            aria-label="Search news posts"
          />
          <select
            value={tagFilter}
            onChange={e => setTagFilter(e.target.value)}
            className="min-w-[140px] p-2 rounded bg-white/10 text-white border border-white/20 focus:ring-2 focus:ring-[var(--spr-blue)]"
            aria-label="Filter by tag"
          >
            <option value="">All Tags</option>
            {tags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </form>
        <div className="space-y-6">
          {loading ? (
            <div className="text-white/70 text-center">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="text-white/70 text-center">No news found.</div>
          ) : posts.map((post, index) => (
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
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-2xl font-semibold text-white flex-1">{post.title}</h2>
                  <span className="text-xs text-white/50">{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/60 mb-2">
                  <span>By {post.author_id || 'Admin'}</span>
                  {post.tags && post.tags.length > 0 && (
                    <span className="flex flex-wrap gap-2">
                      {post.tags.map((tag: string) => (
                        <span key={tag} className="bg-[var(--spr-blue)]/20 text-[var(--spr-blue)] px-2 py-0.5 rounded-full text-xs font-medium">{tag}</span>
                      ))}
                    </span>
                  )}
                </div>
                <div className="prose prose-invert max-w-none text-white/90" dangerouslySetInnerHTML={{ __html: post.body }} />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default News;