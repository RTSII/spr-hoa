import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('../components/RichTextEditor'), { ssr: false });

const NewsAdmin: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setSuccess('');
    setError('');
    try {
      const { error } = await supabase.from('news_posts').insert({
        title,
        body,
        tags: tags.split(',').map(t => t.trim()),
        is_published: true,
      });
      if (error) throw error;
      setSuccess('News post published!');
      setTitle('');
      setBody('');
      setTags('');
    } catch (err: any) {
      setError(err.message || 'Failed to publish news post');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 glass-card animate-fadeInUp">
      <h2 className="text-2xl font-bold text-white mb-6">Admin News Posting</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white mb-1 font-medium">Title</label>
          <input
            className="w-full p-2 rounded bg-white/10 text-white border border-white/20 focus:ring-2 focus:ring-[var(--spr-blue)]"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            maxLength={120}
          />
        </div>
        <div>
          <label className="block text-white mb-1 font-medium">Body</label>
          <RichTextEditor value={body} onChange={setBody} />
        </div>
        <div>
          <label className="block text-white mb-1 font-medium">Tags (comma separated)</label>
          <input
            className="w-full p-2 rounded bg-white/10 text-white border border-white/20 focus:ring-2 focus:ring-[var(--spr-blue)]"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="e.g. announcement, board"
          />
        </div>
        <button
          type="submit"
          disabled={isPublishing}
          className="bg-[var(--spr-blue)] text-white font-bold rounded px-6 py-2 shadow hover:bg-blue-800 transition"
        >
          {isPublishing ? 'Publishing...' : 'Publish News'}
        </button>
        {success && <div className="text-green-400 font-semibold">{success}</div>}
        {error && <div className="text-red-400 font-semibold">{error}</div>}
      </form>
    </div>
  );
};

export default NewsAdmin;
