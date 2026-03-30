import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useHotel } from '@/Hotelcontext';

const HeroSection = () => {
  const { config } = useHotel();

  return (
    <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src={config.heroImage} 
          alt="Hero" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
        >
          {config.hotelName}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-white/90 mb-10 font-light leading-relaxed"
        >
          {config.tagline}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link 
            to="/rooms"
            className="inline-block bg-white text-zinc-900 px-10 py-4 rounded-full text-lg font-medium hover:bg-zinc-100 transition-all shadow-2xl"
          >
            Découvrir nos chambres
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
