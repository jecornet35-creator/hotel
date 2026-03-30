import React from 'react';
import { useHotel } from '@/Hotelcontext';
import { Star, Quote } from 'lucide-react';

const AboutSection = () => {
  const { config, reviews } = useHotel();

  return (
    <section id="about" className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
          <div className="order-2 md:order-1">
            <h2 className="text-xs uppercase tracking-[0.3em] text-zinc-400 font-bold mb-4">Notre Histoire & Engagement</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-8 leading-tight italic font-serif">
              {config.hotelName} : L'art de vivre méditerranéen
            </h3>
            <p className="text-zinc-600 text-lg leading-relaxed mb-8">
              {config.aboutText}
            </p>
            <p className="text-zinc-500 mb-8 italic border-l-4 border-zinc-200 pl-6 py-2">
              "{config.tagline}"
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-3xl font-bold text-zinc-900 mb-1">25+</div>
                <div className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Chambres de luxe</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-zinc-900 mb-1">5*</div>
                <div className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Étoiles au guide</div>
              </div>
            </div>
          </div>
          <div className="relative order-1 md:order-2">
            <img 
              src={config.hotelImage} 
              alt="À propos de l'Hôtel" 
              className="rounded-2xl shadow-2xl w-full h-[600px] object-cover hover:scale-[1.02] transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-8 -left-8 bg-zinc-900 text-white p-8 rounded-2xl hidden md:block shadow-2xl max-w-xs">
              <Quote className="text-zinc-700 mb-4" size={32} />
              <p className="text-xl font-serif italic mb-2">"Un séjour inoubliable au cœur de la Croisette."</p>
              <p className="text-sm text-zinc-400">— Marie L., Cliente fidèle</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase tracking-[0.3em] text-zinc-400 font-bold mb-4">Avis Clients</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-zinc-900 font-serif italic">Ce que nos hôtes disent de nous</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, idx) => (
              <div key={idx} className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-zinc-300"} 
                    />
                  ))}
                </div>
                <p className="text-zinc-600 mb-6 italic leading-relaxed">"{review.text}"</p>
                <div>
                  <p className="font-bold text-zinc-900">{review.name}</p>
                  <p className="text-xs text-zinc-400 uppercase tracking-widest">{review.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
