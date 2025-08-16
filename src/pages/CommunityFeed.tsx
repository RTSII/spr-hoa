import { motion } from 'framer-motion'

const CommunityFeed = () => {
  const posts = [
    {
      id: 1,
      title: 'Litchfield by the Sea Updates',
      content: 'New walking trails have been completed near the nature preserve...',
      author: 'Admin',
      date: '2 hours ago',
      category: 'Litchfield',
    },
    {
      id: 2,
      title: 'Local Restaurant Week',
      content: 'Pawleys Island restaurants are offering special menus this week...',
      author: 'Admin',
      date: '1 day ago',
      category: 'Pawleys Island',
    },
    {
      id: 3,
      title: 'Beach Turtle Nesting Season',
      content: 'Please remember to turn off lights facing the beach during nesting season...',
      author: 'Admin',
      date: '3 days ago',
      category: 'Sandpiper Run',
    },
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <h1 className="mb-6 font-display text-3xl font-bold text-white">Community Feed</h1>

        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-seafoam/20 px-3 py-1 text-sm text-seafoam">
                  {post.category}
                </span>
                <span className="text-sm text-white/60">{post.date}</span>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-white">{post.title}</h2>
              <p className="mb-4 text-white/80">{post.content}</p>
              <p className="text-sm text-white/60">Posted by {post.author}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default CommunityFeed
