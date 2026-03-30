import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useHotel } from '@/Hotelcontext';
import { motion, AnimatePresence } from 'motion/react';

const GalleryPage = () => {
  const { galleryPhotos, config } = useHotel();
  const [filter, setFilter] = useState('Tous');

  const categories = ['Tous', ...Array.from(new Set(galleryPhotos.map(p => p.category)))];
  
  const filteredPhotos = filter === 'Tous' 
    ? galleryPhotos 
    : galleryPhotos.filter(p => p.category === filter);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase tracking-[0.3em] text-zinc-400 font-bold mb-4">Galerie Complète</h2>
            <h1 className="text-5xl md:text-7xl font-bold text-zinc-900 mb-8 font-serif italic tracking-tight">
              {config.galleryTitle || "Immersion dans l'élégance"}
            </h1>
            <p className="text-zinc-500 max-w-2xl mx-auto leading-relaxed text-lg mb-12">
              {config.galleryDescription || "Découvrez chaque recoin de notre établissement à travers notre collection de photographies. Du raffinement de nos suites à la sérénité de nos jardins."}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                    filter === cat 
                      ? 'bg-zinc-900 text-white shadow-2xl scale-105' 
                      : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100 border border-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {galleryPhotos.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredPhotos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 bg-zinc-100"
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.caption} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-10 transform translate-y-4 group-hover:translate-y-0">
                      <p className="text-white font-serif italic text-2xl mb-2">{photo.caption}</p>
                      <div className="h-px w-12 bg-white/40 mb-4" />
                      <p className="text-white/60 text-xs uppercase tracking-[0.2em]">{photo.category}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-32 bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-200">
              <p className="text-zinc-400 font-medium">Aucune photo dans la galerie pour le moment.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GalleryPage;
