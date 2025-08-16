import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { searchPhotos } from '../lib/supermemory'

interface GalleryItem {
  id: string
  image: string
  title: string
  category: string
  description?: string
}

interface CategoryData {
  name: string
  count: number
  thumbnail: string
  color: string
}

interface CircularGalleryProps {
  items: GalleryItem[]
  bend?: number
  textColor?: string
  borderRadius?: number
  scrollSpeed?: number
  scrollEase?: number
}

const CircularGallery: React.FC<CircularGalleryProps> = ({
  items = [],
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.05,
  scrollSpeed = 2,
  scrollEase = 0.05,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [supermemoryQuery, setSupermemoryQuery] = useState('')
  const [supermemoryResults, setSupermemoryResults] = useState<any[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)

  // Group items by category and create category data
  const categories: CategoryData[] = React.useMemo(() => {
    const categoryMap = new Map<string, GalleryItem[]>()

    items.forEach((item) => {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, [])
      }
      categoryMap.get(item.category)?.push(item)
    })

    return Array.from(categoryMap.entries()).map(([name, categoryItems], index) => ({
      name,
      count: categoryItems.length,
      thumbnail: categoryItems[0]?.image || '',
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    }))
  }, [items])

  // Get items for selected category
  const categoryItems = React.useMemo(() => {
    if (!selectedCategory) return []
    return items.filter((item) => item.category === selectedCategory)
  }, [items, selectedCategory])

  // Handle wheel scroll for circular rotation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return
      e.preventDefault()

      setScrollPosition((prev) => {
        const newPos = prev + e.deltaY * scrollSpeed * 0.01
        return newPos
      })
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [scrollSpeed])

  // Calculate circular positions
  const getCircularPosition = (index: number, total: number) => {
    const angle = (2 * Math.PI * index) / total + scrollPosition
    const radius = 200
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius * (bend / 10)
    const scale = 0.8 + 0.2 * Math.cos(angle + Math.PI / 2)
    const zIndex = Math.round(50 + 50 * Math.cos(angle + Math.PI / 2))

    return { x, y, scale, zIndex, angle }
  }

  const openLightbox = (item: GalleryItem) => {
    const index = categoryItems.findIndex((i) => i.id === item.id)
    setSelectedImage(item)
    setLightboxIndex(index)
  }

  const navigateLightbox = (direction: 'prev' | 'next') => {
    const newIndex =
      direction === 'next'
        ? (lightboxIndex + 1) % categoryItems.length
        : (lightboxIndex - 1 + categoryItems.length) % categoryItems.length

    setLightboxIndex(newIndex)
    setSelectedImage(categoryItems[newIndex])
  }

  const handleSupermemorySearch = async () => {
    try {
      if (!supermemoryQuery) return
      const results = await searchPhotos(supermemoryQuery)
      setSupermemoryResults(results?.results || [])
    } catch (error) {
      console.error('Supermemory search error:', error)
      setSupermemoryResults([])
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Supermemory AI Search */}
      <div className="mb-8 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">AI-Powered Photo Search</h2>
        </div>
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Search photos by description, category, or other metadata..."
            className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400"
            value={supermemoryQuery}
            onChange={(e) => setSupermemoryQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSupermemorySearch()}
          />
          <button
            onClick={handleSupermemorySearch}
            className="rounded-lg bg-blue-600 px-4 py-2 transition-colors hover:bg-blue-700"
            disabled={!supermemoryQuery}
          >
            Search
          </button>
        </div>

        {supermemoryResults.length > 0 && (
          <div>
            <h3 className="mb-2 text-lg font-medium text-white">AI Search Results:</h3>
            <div className="space-y-2">
              {supermemoryResults.map((res, i) => (
                <div key={i} className="rounded-lg border border-gray-600 bg-gray-700/50 p-3">
                  <p className="text-white">{res.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Circular Category Selector */}
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div
            key="categories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex h-[500px] items-center justify-center"
            ref={containerRef}
          >
            <div className="relative h-full w-full">
              {categories.map((category, index) => {
                const position = getCircularPosition(index, categories.length)

                return (
                  <motion.div
                    key={category.name}
                    className="absolute cursor-pointer"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
                      zIndex: position.zIndex,
                    }}
                    animate={{
                      scale: position.scale,
                    }}
                    whileHover={{ scale: position.scale * 1.1 }}
                    whileTap={{ scale: position.scale * 0.95 }}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <div
                      className="relative h-32 w-32 overflow-hidden rounded-lg border-4 border-white/20 shadow-2xl"
                      style={{
                        borderRadius: `${borderRadius * 100}px`,
                        transform: `rotateY(${Math.sin(position.angle) * 15}deg) rotateX(${Math.cos(position.angle) * 5}deg)`,
                      }}
                    >
                      {/* Category thumbnail */}
                      <img
                        src={category.thumbnail}
                        alt={category.name}
                        className="h-full w-full object-cover"
                      />

                      {/* Gradient overlay */}
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
                        style={{ backgroundColor: `${category.color}20` }}
                      />

                      {/* Category info */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3
                          className="text-sm font-bold leading-tight"
                          style={{ color: textColor }}
                        >
                          {category.name}
                        </h3>
                        <p className="text-xs opacity-80" style={{ color: textColor }}>
                          {category.count} photos
                        </p>
                      </div>

                      {/* Shine effect */}
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100"
                        style={{
                          transform: `translateX(-100%) skewX(-15deg)`,
                          animation: 'shine 2s infinite',
                        }}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform text-center">
              <p className="text-sm text-white/80">
                Scroll to rotate • Click a category to view photos
              </p>
            </div>
          </motion.div>
        ) : (
          /* Masonry Gallery View */
          <motion.div
            key="gallery"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Gallery Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center space-x-2 rounded-lg bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Categories</span>
                </button>
                <h2 className="text-2xl font-bold capitalize text-white">
                  {selectedCategory} Gallery
                </h2>
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-300">
                  {categoryItems.length} photos
                </span>
              </div>
            </div>

            {/* Masonry Grid */}
            <div className="columns-1 gap-4 space-y-4 md:columns-2 lg:columns-3 xl:columns-4">
              {categoryItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group mb-4 cursor-pointer break-inside-avoid"
                  onClick={() => openLightbox(item)}
                >
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/30 group-hover:scale-[1.02]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="mb-1 text-sm font-semibold text-white">{item.title}</h3>
                        {item.description && (
                          <p className="line-clamp-2 text-xs text-white/80">{item.description}</p>
                        )}
                      </div>

                      {/* Zoom icon */}
                      <div className="absolute right-4 top-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                          <ZoomIn className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-[80vh] w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation buttons */}
              {categoryItems.length > 1 && (
                <>
                  <button
                    onClick={() => navigateLightbox('prev')}
                    className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 transform items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => navigateLightbox('next')}
                    className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 transform items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Close button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Image */}
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="h-full w-full rounded-lg object-contain"
              />

              {/* Image info */}
              <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-black/50 p-4 backdrop-blur-sm">
                <h3 className="mb-1 text-lg font-semibold text-white">{selectedImage.title}</h3>
                {selectedImage.description && (
                  <p className="text-sm text-white/80">{selectedImage.description}</p>
                )}
                <p className="mt-2 text-xs text-white/60">
                  {lightboxIndex + 1} of {categoryItems.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }
      `}</style>
    </div>
  )
}

export default CircularGallery
