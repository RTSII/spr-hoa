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
  Archive
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
    status: 'draft' as NewsPost['status']
  })

  const [newTag, setNewTag] = useState('')

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'events', label: 'Events' },
    { value: 'community', label: 'Community' },
    { value: 'announcements', label: 'Announcements' },
    { value: 'emergency', label: 'Emergency' }
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
      status: 'draft'
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
      status: post.status
    })
    setEditingPost(post)
  }

  const addTag = () => {
    if (newTag.trim() && !postForm.tags.includes(newTag.trim())) {
      setPostForm({
        ...postForm,
        tags: [...postForm.tags, newTag.trim()]
      })
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setPostForm({
      ...postForm,
      tags: postForm.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const filteredPosts = posts
    .filter(post => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())

      if (filter === 'all') return matchesSearch
      return matchesSearch && post.status === filter
    })

  const statusColor = (status: NewsPost['status']) => {
    switch (status) {
      case 'draft': return 'text-yellow-400 bg-yellow-500/20'
      case 'published': return 'text-green-400 bg-green-500/20'
      case 'archived': return 'text-gray-400 bg-gray-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const statusIcon = (status: NewsPost['status']) => {
    switch (status) {
      case 'draft': return Clock
      case 'published': return CheckCircle
      case 'archived': return Archive
      default: return Clock
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/20 w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Newspaper className="h-6 w-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">News Management</h2>
            <span className="px-3 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full">
              {filteredPosts.length} posts
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreatePost(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Create Post</span>
            </motion.button>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-white/10 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                placeholder="Search news posts..."
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white focus:border-purple-400 focus:outline-none"
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
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/60">
              <Newspaper className="h-16 w-16 mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Posts Found</h3>
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
                    className="bg-black/20 rounded-lg border border-white/10 p-6 hover:border-purple-400/50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">{post.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded flex items-center space-x-1 ${statusColor(post.status)}`}>
                            <StatusIcon className="h-3 w-3" />
                            <span className="capitalize">{post.status}</span>
                          </span>
                          <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded capitalize">
                            {post.category}
                          </span>
                        </div>

                        <p className="text-white/80 mb-3 line-clamp-2">
                          {post.excerpt || post.content.substring(0, 150) + '...'}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-white/60">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {post.published_at
                                ? `Published ${new Date(post.published_at).toLocaleDateString()}`
                                : `Created ${new Date(post.created_at).toLocaleDateString()}`
                              }
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
                                  <span key={idx} className="px-1 py-0.5 bg-white/10 text-xs rounded">
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

                      <div className="flex items-center space-x-2 ml-4">
                        {post.status === 'draft' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePublishPost(post.id)}
                            disabled={loading}
                            className="p-2 bg-green-500/20 text-green-400 rounded border border-green-500/30 hover:bg-green-500/30 transition-all disabled:opacity-50"
                            title="Publish"
                          >
                            <Send className="h-4 w-4" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => startEditing(post)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30 hover:bg-blue-500/30 transition-all"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded border border-red-500/30 hover:bg-red-500/30 transition-all"
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
              className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-10"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90%] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
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
                      <label className="block text-white font-medium mb-2">Title</label>
                      <input
                        value={postForm.title}
                        onChange={(e) => setPostForm({...postForm, title: e.target.value})}
                        className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                        placeholder="Enter post title..."
                      />
                    </div>

                    {/* Category and Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Category</label>
                        <select
                          value={postForm.category}
                          onChange={(e) => setPostForm({...postForm, category: e.target.value})}
                          className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                        >
                          {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Status</label>
                        <select
                          value={postForm.status}
                          onChange={(e) => setPostForm({...postForm, status: e.target.value as NewsPost['status']})}
                          className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="block text-white font-medium mb-2">Excerpt</label>
                      <textarea
                        value={postForm.excerpt}
                        onChange={(e) => setPostForm({...postForm, excerpt: e.target.value})}
                        rows={2}
                        className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 resize-none focus:border-purple-400 focus:outline-none"
                        placeholder="Brief description or excerpt..."
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-white font-medium mb-2">Content</label>
                      <textarea
                        value={postForm.content}
                        onChange={(e) => setPostForm({...postForm, content: e.target.value})}
                        rows={10}
                        className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 resize-none focus:border-purple-400 focus:outline-none"
                        placeholder="Write your post content here..."
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-white font-medium mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {postForm.tags.map((tag, idx) => (
                          <span key={idx} className="flex items-center space-x-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm">
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
                          className="flex-1 p-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                          placeholder="Add tag..."
                        />
                        <button
                          onClick={addTag}
                          className="px-4 py-3 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-all"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Featured Image URL */}
                    <div>
                      <label className="block text-white font-medium mb-2">Featured Image URL</label>
                      <input
                        value={postForm.featured_image_url}
                        onChange={(e) => setPostForm({...postForm, featured_image_url: e.target.value})}
                        className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-purple-400 focus:outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={editingPost ? () => handleUpdatePost(editingPost.id) : handleCreatePost}
                        disabled={loading || !postForm.title.trim() || !postForm.content.trim()}
                        className="flex-1 py-3 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-all disabled:opacity-50 font-medium flex items-center justify-center space-x-2"
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
                        className="px-6 py-3 bg-gray-500/20 text-gray-400 rounded-lg border border-gray-500/30 hover:bg-gray-500/30 transition-all"
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
