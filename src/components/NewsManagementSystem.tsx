import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Newspaper,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Search,
  Filter,
  Calendar,
  Tag,
  BarChart3,
  Send,
  Save,
  X,
  CheckCircle,
  Clock,
  Archive,
} from 'lucide-react'
import { adminService, NewsPost } from '@/lib/adminService'

interface NewsManagementSystemProps {
  onClose: () => void
}

const NewsManagementSystem: React.FC<NewsManagementSystemProps> = ({ onClose }) => {
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null)
  const [showCreatePost, setShowCreatePost] = useState(false)

  // Create/Edit form state
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'general',
    featured_image_url: '',
    tags: [] as string[],
    status: 'draft' as NewsPost['status'],
  })

  const [newTag, setNewTag] = useState('')

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'events', label: 'Events' },
    { value: 'community', label: 'Community' },
    { value: 'announcements', label: 'Announcements' },
    { value: 'emergency', label: 'Emergency' },
  ]

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAllNewsPosts()
      setPosts(data || [])
    } catch (error) {
      console.error('Error loading news posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    try {
      setLoading(true)
      await adminService.createNewsPost(postForm)
      resetForm()
      setShowCreatePost(false)
      await loadPosts()
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePost = async (postId: string) => {
    try {
      setLoading(true)
      await adminService.updateNewsPost(postId, postForm)
      resetForm()
      setEditingPost(null)
      await loadPosts()
    } catch (error) {
      console.error('Error updating post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublishPost = async (postId: string) => {
    try {
      setLoading(true)
      await adminService.publishNewsPost(postId)
      await loadPosts()
    } catch (error) {
      console.error('Error publishing post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      await adminService.deleteNewsPost(postId)
      await loadPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setPostForm({
      title: '',
      content: '',
      excerpt: '',
      category: 'general',
      featured_image_url: '',
      tags: [],
      status: 'draft',
    })
    setNewTag('')
  }

  const startEditing = (post: NewsPost) => {
    setPostForm({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      category: post.category,
      featured_image_url: post.featured_image_url || '',
      tags: post.tags || [],
      status: post.status,
    })
    setEditingPost(post)
  }

  const addTag = () => {
    if (newTag.trim() && !postForm.tags.includes(newTag.trim())) {
      setPostForm({
        ...postForm,
        tags: [...postForm.tags, newTag.trim()],
      })
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setPostForm({
      ...postForm,
      tags: postForm.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())

    if (filter === 'all') return matchesSearch
    return matchesSearch && post.status === filter
  })

  const statusColor = (status: NewsPost['status']) => {
    switch (status) {
      case 'draft':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'published':
        return 'text-green-400 bg-green-500/20'
      case 'archived':
        return 'text-gray-400 bg-gray-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  const statusIcon = (status: NewsPost['status']) => {
    switch (status) {
      case 'draft':
        return Clock
      case 'published':
        return CheckCircle
      case 'archived':
        return Archive
      default:
        return Clock
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-slate-900/95 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div className="flex items-center space-x-3">
            <Newspaper className="h-6 w-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">News Management</h2>
            <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-300">
              {filteredPosts.length} posts
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreatePost(true)}
              className="flex items-center space-x-2 rounded-lg border border-purple-500/30 bg-purple-500/20 px-4 py-2 text-purple-400 transition-all hover:bg-purple-500/30"
            >
              <Plus className="h-4 w-4" />
              <span>Create Post</span>
            </motion.button>
            <button onClick={onClose} className="text-white/70 transition-colors hover:text-white">
              ✕
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 border-b border-white/10 p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-white/50" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-black/30 py-3 pl-10 pr-4 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                placeholder="Search news posts..."
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="rounded-lg border border-white/20 bg-black/30 px-4 py-3 text-white focus:border-purple-400 focus:outline-none"
            >
              <option value="all">All Posts</option>
              <option value="draft">Drafts</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Posts List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-400"></div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-white/60">
              <Newspaper className="mb-4 h-16 w-16 opacity-50" />
              <h3 className="mb-2 text-xl font-semibold">No Posts Found</h3>
              <p>Create your first news post to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => {
                const StatusIcon = statusIcon(post.status)
                return (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-white/10 bg-black/20 p-6 transition-all hover:border-purple-400/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                          <span
                            className={`flex items-center space-x-1 rounded px-2 py-1 text-xs ${statusColor(post.status)}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            <span className="capitalize">{post.status}</span>
                          </span>
                          <span className="rounded bg-blue-500/20 px-2 py-1 text-xs capitalize text-blue-300">
                            {post.category}
                          </span>
                        </div>

                        <p className="mb-3 line-clamp-2 text-white/80">
                          {post.excerpt || post.content.substring(0, 150) + '...'}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-white/60">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {post.published_at
                                ? `Published ${new Date(post.published_at).toLocaleDateString()}`
                                : `Created ${new Date(post.created_at).toLocaleDateString()}`}
                            </span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <BarChart3 className="h-4 w-4" />
                            <span>{post.views_count} views</span>
                          </span>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Tag className="h-4 w-4" />
                              <div className="flex space-x-1">
                                {post.tags.slice(0, 3).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="rounded bg-white/10 px-1 py-0.5 text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {post.tags.length > 3 && (
                                  <span className="text-xs">+{post.tags.length - 3}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="ml-4 flex items-center space-x-2">
                        {post.status === 'draft' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePublishPost(post.id)}
                            disabled={loading}
                            className="rounded border border-green-500/30 bg-green-500/20 p-2 text-green-400 transition-all hover:bg-green-500/30 disabled:opacity-50"
                            title="Publish"
                          >
                            <Send className="h-4 w-4" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => startEditing(post)}
                          className="rounded border border-blue-500/30 bg-blue-500/20 p-2 text-blue-400 transition-all hover:bg-blue-500/30"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeletePost(post.id)}
                          className="rounded border border-red-500/30 bg-red-500/20 p-2 text-red-400 transition-all hover:bg-red-500/30"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Create/Edit Post Modal */}
        <AnimatePresence>
          {(showCreatePost || editingPost) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="max-h-[90%] w-full max-w-4xl overflow-y-auto rounded-xl bg-slate-800"
              >
                <div className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">
                      {editingPost ? 'Edit Post' : 'Create New Post'}
                    </h3>
                    <button
                      onClick={() => {
                        resetForm()
                        setShowCreatePost(false)
                        setEditingPost(null)
                      }}
                      className="text-white/70 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="mb-2 block font-medium text-white">Title</label>
                      <input
                        value={postForm.title}
                        onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                        className="w-full rounded-lg border border-white/20 bg-black/30 p-3 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                        placeholder="Enter post title..."
                      />
                    </div>

                    {/* Category and Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block font-medium text-white">Category</label>
                        <select
                          value={postForm.category}
                          onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                          className="w-full rounded-lg border border-white/20 bg-black/30 p-3 text-white focus:border-purple-400 focus:outline-none"
                        >
                          {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block font-medium text-white">Status</label>
                        <select
                          value={postForm.status}
                          onChange={(e) =>
                            setPostForm({
                              ...postForm,
                              status: e.target.value as NewsPost['status'],
                            })
                          }
                          className="w-full rounded-lg border border-white/20 bg-black/30 p-3 text-white focus:border-purple-400 focus:outline-none"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="mb-2 block font-medium text-white">Excerpt</label>
                      <textarea
                        value={postForm.excerpt}
                        onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                        rows={2}
                        className="w-full resize-none rounded-lg border border-white/20 bg-black/30 p-3 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                        placeholder="Brief description or excerpt..."
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label className="mb-2 block font-medium text-white">Content</label>
                      <textarea
                        value={postForm.content}
                        onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                        rows={10}
                        className="w-full resize-none rounded-lg border border-white/20 bg-black/30 p-3 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                        placeholder="Write your post content here..."
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="mb-2 block font-medium text-white">Tags</label>
                      <div className="mb-2 flex flex-wrap gap-2">
                        {postForm.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="flex items-center space-x-1 rounded bg-purple-500/20 px-2 py-1 text-sm text-purple-300"
                          >
                            <span>{tag}</span>
                            <button
                              onClick={() => removeTag(tag)}
                              className="text-purple-300 hover:text-white"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addTag()}
                          className="flex-1 rounded-lg border border-white/20 bg-black/30 p-3 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                          placeholder="Add tag..."
                        />
                        <button
                          onClick={addTag}
                          className="rounded-lg border border-purple-500/30 bg-purple-500/20 px-4 py-3 text-purple-400 transition-all hover:bg-purple-500/30"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Featured Image URL */}
                    <div>
                      <label className="mb-2 block font-medium text-white">
                        Featured Image URL
                      </label>
                      <input
                        value={postForm.featured_image_url}
                        onChange={(e) =>
                          setPostForm({ ...postForm, featured_image_url: e.target.value })
                        }
                        className="w-full rounded-lg border border-white/20 bg-black/30 p-3 text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={
                          editingPost ? () => handleUpdatePost(editingPost.id) : handleCreatePost
                        }
                        disabled={loading || !postForm.title.trim() || !postForm.content.trim()}
                        className="flex flex-1 items-center justify-center space-x-2 rounded-lg border border-purple-500/30 bg-purple-500/20 py-3 font-medium text-purple-400 transition-all hover:bg-purple-500/30 disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        <span>{editingPost ? 'Update Post' : 'Create Post'}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          resetForm()
                          setShowCreatePost(false)
                          setEditingPost(null)
                        }}
                        className="rounded-lg border border-gray-500/30 bg-gray-500/20 px-6 py-3 text-gray-400 transition-all hover:bg-gray-500/30"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default NewsManagementSystem
