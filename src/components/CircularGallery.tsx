import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { searchPhotos } from '../lib/supermemory';

interface GalleryItem {
  id: string;
  image: string;
  title: string;
  category: string;
  description?: string;
}

interface CategoryData {
  name: string;
  count: number;
  thumbnail: string;
  color: string;
}

interface CircularGalleryProps {
  items: GalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  scrollSpeed?: number;
  scrollEase?: number;
}

const CircularGallery: React.FC<CircularGalleryProps> = ({
  items = [],
  bend = 3,
  textColor = "#ffffff",
  borderRadius = 0.05,
  scrollSpeed = 2,
  scrollEase = 0.05
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [supermemoryQuery, setSupermemoryQuery] = useState('');
  const [supermemoryResults, setSupermemoryResults] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Group items by category and create category data
  const categories: CategoryData[] = React.useMemo(() => {
    const categoryMap = new Map<string, GalleryItem[]>();

    items.forEach(item => {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, []);
      }
      categoryMap.get(item.category)?.push(item);
    });

    return Array.from(categoryMap.entries()).map(([name, categoryItems], index) => ({
      name,
      count: categoryItems.length,
      thumbnail: categoryItems[0]?.image || '',
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    }));
  }, [items]);

  // Get items for selected category
  const categoryItems = React.useMemo(() => {
    if (!selectedCategory) return [];
    return items.filter(item => item.category === selectedCategory);
  }, [items, selectedCategory]);

  // Handle wheel scroll for circular rotation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return;
      e.preventDefault();

      setScrollPosition(prev => {
        const newPos = prev + (e.deltaY * scrollSpeed * 0.01);
        return newPos;
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [scrollSpeed]);

  // Calculate circular positions
  const getCircularPosition = (index: number, total: number) => {
    const angle = (2 * Math.PI * index) / total + scrollPosition;
    const radius = 200;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * (bend / 10);
    const scale = 0.8 + 0.2 * Math.cos(angle + Math.PI / 2);
    const zIndex = Math.round(50 + 50 * Math.cos(angle + Math.PI / 2));

    return { x, y, scale, zIndex, angle };
  };

  const openLightbox = (item: GalleryItem) => {
    const index = categoryItems.findIndex(i => i.id === item.id);
    setSelectedImage(item);
    setLightboxIndex(index);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? (lightboxIndex + 1) % categoryItems.length
      : (lightboxIndex - 1 + categoryItems.length) % categoryItems.length;

    setLightboxIndex(newIndex);
    setSelectedImage(categoryItems[newIndex]);
  };

  const handleSupermemorySearch = async () => {
    try {
      if (!supermemoryQuery) return;
      const results = await searchPhotos(supermemoryQuery);
      setSupermemoryResults(results?.results || []);
    } catch (error) {
      console.error('Supermemory search error:', error);
      setSupermemoryResults([]);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Supermemory AI Search */}
      <div className="mb-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">AI-Powered Photo Search</h2>
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search photos by description, category, or other metadata..."
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            value={supermemoryQuery}
            onChange={e => setSupermemoryQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSupermemorySearch()}
          />
          <button
            onClick={handleSupermemorySearch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            disabled={!supermemoryQuery}
          >
            Search
          </button>
        </div>
        
        {supermemoryResults.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-white mb-2">AI Search Results:</h3>
            <div className="space-y-2">
              {supermemoryResults.map((res, i) => (
                <div key={i} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600">
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
            className="relative h-[500px] flex items-center justify-center"
            ref={containerRef}
          >
            <div className="relative w-full h-full">
              {categories.map((category, index) => {
                const position = getCircularPosition(index, categories.length);

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
                      className="relative w-32 h-32 rounded-lg overflow-hidden shadow-2xl border-4 border-white/20"
                      style={{
                        borderRadius: `${borderRadius * 100}px`,
                        transform: `rotateY(${Math.sin(position.angle) * 15}deg) rotateX(${Math.cos(position.angle) * 5}deg)`,
                      }}
                    >
                      {/* Category thumbnail */}
                      <img
                        src={category.thumbnail}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Gradient overlay */}
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
                        style={{ backgroundColor: `${category.color}20` }}
                      />

                      {/* Category info */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3
                          className="font-bold text-sm leading-tight"
                          style={{ color: textColor }}
                        >
                          {category.name}
                        </h3>
                        <p
                          className="text-xs opacity-80"
                          style={{ color: textColor }}
                        >
                          {category.count} photos
                        </p>
                      </div>

                      {/* Shine effect */}
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"
                        style={{
                          transform: `translateX(-100%) skewX(-15deg)`,
                          animation: 'shine 2s infinite',
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-white/80 text-sm">
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
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back to Categories</span>
                </button>
                <h2 className="text-2xl font-bold text-white capitalize">
                  {selectedCategory} Gallery
                </h2>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                  {categoryItems.length} photos
                </span>
              </div>
            </div>

            {/* Masonry Grid */}
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {categoryItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="break-inside-avoid mb-4 group cursor-pointer"
                  onClick={() => openLightbox(item)}
                >
                  <div className="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-300 group-hover:scale-[1.02]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-semibold text-sm mb-1">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-white/80 text-xs line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Zoom icon */}
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
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
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[80vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation buttons */}
              {categoryItems.length > 1 && (
                <>
                  <button
                    onClick={() => navigateLightbox('prev')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-10"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => navigateLightbox('next')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-10"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Close button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Image */}
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full h-full object-contain rounded-lg"
              />

              {/* Image info */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-white font-semibold text-lg mb-1">
                  {selectedImage.title}
                </h3>
                {selectedImage.description && (
                  <p className="text-white/80 text-sm">
                    {selectedImage.description}
                  </p>
                )}
                <p className="text-white/60 text-xs mt-2">
                  {lightboxIndex + 1} of {categoryItems.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
      `}</style>
    </div>
  );
};

export default CircularGallery;
