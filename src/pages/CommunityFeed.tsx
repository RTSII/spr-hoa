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
        <h1 className="text-3xl font-display font-bold text-white mb-6">
          Community Feed
        </h1>

        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-seafoam/20 text-seafoam rounded-full text-sm">
                  {post.category}
                </span>
                <span className="text-white/60 text-sm">{post.date}</span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">{post.title}</h2>
              <p className="text-white/80 mb-4">{post.content}</p>
              <p className="text-white/60 text-sm">Posted by {post.author}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default CommunityFeed