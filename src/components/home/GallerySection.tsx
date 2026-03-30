import React from 'react';
import { Link } from 'react-router-dom';
import { useHotel } from '@/Hotelcontext';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const GallerySection = () => {
  const { galleryPhotos, config } = useHotel();
  
  // Show only the first 6 photos on the homepage
  const teaserPhotos = galleryPhotos.slice(0, 6);

  if (galleryPhotos.length === 0) return <div id="gallery" />;

  return (
    <section id="gallery" className="py-24 px-6 bg-zinc-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-xs uppercase tracking-[0.3em] text-zinc-400 font-bold mb-4">Galerie</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-zinc-900 font-serif italic">
              {config.galleryTitle || "Aperçu de l'élégance"}
            </h3>
          </div>
          <Link 
            to="/gallery" 
            className="group flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white rounded-full font-bold text-sm hover:bg-zinc-800 transition-all shadow-xl hover:shadow-2xl"
          >
            Voir toute la galerie
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teaserPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative aspect-[4/5] overflow-hidden rounded-3xl shadow-lg bg-white"
            >
              <img 
                src={photo.url} 
                alt={photo.caption} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <p className="text-white font-serif italic text-xl">{photo.caption}</p>
                <p className="text-white/60 text-xs uppercase tracking-widest mt-2">{photo.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
