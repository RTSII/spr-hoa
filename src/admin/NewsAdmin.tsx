import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('../components/RichTextEditor'), { ssr: false })

const NewsAdmin: React.FC = () => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPublishing(true)
    setSuccess('')
    setError('')
    try {
      const { error } = await supabase.from('news_posts').insert({
        title,
        body,
        tags: tags.split(',').map((t) => t.trim()),
        is_published: true,
      })
      if (error) throw error
      setSuccess('News post published!')
      setTitle('')
      setBody('')
      setTags('')
    } catch (err: any) {
      setError(err.message || 'Failed to publish news post')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="glass-card animate-fadeInUp mx-auto mt-10 max-w-2xl p-6">
      <h2 className="mb-6 text-2xl font-bold text-white">Admin News Posting</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1 block font-medium text-white">Title</label>
          <input
            className="w-full rounded border border-white/20 bg-white/10 p-2 text-white focus:ring-2 focus:ring-[var(--spr-blue)]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={120}
          />
        </div>
        <div>
          <label className="mb-1 block font-medium text-white">Body</label>
          <RichTextEditor value={body} onChange={setBody} />
        </div>
        <div>
          <label className="mb-1 block font-medium text-white">Tags (comma separated)</label>
          <input
            className="w-full rounded border border-white/20 bg-white/10 p-2 text-white focus:ring-2 focus:ring-[var(--spr-blue)]"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. announcement, board"
          />
        </div>
        <button
          type="submit"
          disabled={isPublishing}
          className="rounded bg-[var(--spr-blue)] px-6 py-2 font-bold text-white shadow transition hover:bg-blue-800"
        >
          {isPublishing ? 'Publishing...' : 'Publish News'}
        </button>
        {success && <div className="font-semibold text-green-400">{success}</div>}
        {error && <div className="font-semibold text-red-400">{error}</div>}
      </form>
    </div>
  )
}

export default NewsAdmin
