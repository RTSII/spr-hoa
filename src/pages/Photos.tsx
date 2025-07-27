import { motion } from 'framer-motion'
import { useState } from 'react'

const Photos = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', 'beach', 'events', 'amenities', 'nature']

  // Sample photos - in production, these would come from Supabase
  const photos = [
    { id: 1, url: '🏖️', title: 'Sunrise at the Beach', category: 'beach' },
    { id: 2, url: '🎉', title: 'Summer BBQ Event', category: 'events' },
    { id: 3, url: '🏊', title: 'Pool Area', category: 'amenities' },
    { id: 4, url: '🌅', title: 'Sunset Views', category: 'beach' },
    { id: 5, url: '🦩', title: 'Local Wildlife', category: 'nature' },
    { id: 6, url: '🎆', title: '4th of July Celebration', category: 'events' },
  ]

  const filteredPhotos = selectedCategory === 'all'
    ? photos
    : photos.filter(photo => photo.category === selectedCategory)

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-display font-bold text-white mb-4 md:mb-0">
            Photo Gallery
          </h1>
          <button className="glass-button text-sm">
            📤 Upload Photo
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedCategory === category
                  ? 'bg-seafoam text-royal-blue'
                  : 'glass-button text-white'
                }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
            >
              <div className="aspect-square bg-white/10 rounded-lg flex items-center justify-center text-6xl mb-4 group-hover:scale-105 transition-transform duration-300">
                {photo.url}
              </div>
              <h3 className="text-white font-medium">{photo.title}</h3>
              <p className="text-white/60 text-sm">{photo.category}</p>
            </motion.div>
          ))}
        </div>

        {/* Upload Instructions */}
        <div className="mt-8 glass-card p-6 text-center">
          <p className="text-white/80">
            Want to share your photos? Click the upload button above to submit photos for review.
          </p>
          <p className="text-white/60 text-sm mt-2">
            All photos are reviewed before being added to the gallery.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Photos