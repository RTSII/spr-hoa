import { motion } from 'framer-motion'

const News = () => {
  const newsArticles = [
    {
      id: 1,
      title: 'Beach Restoration Project Complete',
      date: 'December 15, 2024',
      author: 'HOA Board',
      content: 'We are pleased to announce that the beach restoration project has been successfully completed...',
      image: '🏖️',
    },
    {
      id: 2,
      title: 'New Security Measures Implemented',
      date: 'December 10, 2024',
      author: 'Security Committee',
      content: 'Enhanced security protocols have been put in place to ensure the safety of all residents...',
      image: '🔒',
    },
    {
      id: 3,
      title: '2025 Budget Approved',
      date: 'December 5, 2024',
      author: 'Finance Committee',
      content: 'The 2025 budget has been approved with no increase in HOA fees...',
      image: '💰',
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
          News & Announcements
        </h1>

        <div className="space-y-6">
          {newsArticles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex gap-6">
                <div className="text-6xl">{article.image}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-white mb-2">{article.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>By {article.author}</span>
                  </div>
                  <p className="text-white/80">{article.content}</p>
                  <button className="mt-4 text-seafoam hover:text-seafoam/80 font-medium">
                    Read full article →
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default News