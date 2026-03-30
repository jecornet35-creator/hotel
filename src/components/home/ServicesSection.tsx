import React from 'react';
import { useHotel } from '@/Hotelcontext';
import { Wifi, Coffee, Utensils, Waves, Car, ShieldCheck } from 'lucide-react';

const ServicesSection = () => {
  const { services } = useHotel();

  const iconMap: Record<string, any> = {
    Wifi,
    Coffee,
    Utensils,
    Waves,
    Car,
    ShieldCheck
  };

  return (
    <section id="services" className="py-24 px-6 bg-zinc-50">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-xs uppercase tracking-[0.3em] text-zinc-400 font-bold mb-4">Expériences</h2>
        <h3 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 font-serif italic">Nos Services Exclusifs</h3>
      </div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.length > 0 ? (
          services.map((service) => {
            const Icon = service.icon && iconMap[service.icon] ? iconMap[service.icon] : ShieldCheck;
            return (
              <div key={service.id} className="bg-white p-10 rounded-2xl border border-zinc-100 hover:shadow-xl transition-shadow group">
                <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  <Icon size={32} />
                </div>
                <h4 className="text-xl font-bold text-zinc-900 mb-4">{service.name}</h4>
                <p className="text-zinc-500 leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })
        ) : (
          // Fallback if no services in context
          [
            { name: 'Spa & Bien-être', desc: 'Détendez-vous dans notre spa haut de gamme avec vue sur mer.', icon: Waves },
            { name: 'Gastronomie', desc: 'Découvrez une cuisine raffinée préparée par nos chefs étoilés.', icon: Utensils },
            { name: 'Service d\'étage', desc: 'Un service attentionné disponible 24h/24 pour votre confort.', icon: Coffee }
          ].map((s, i) => (
            <div key={i} className="bg-white p-10 rounded-2xl border border-zinc-100 hover:shadow-xl transition-shadow group">
              <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <s.icon size={32} />
              </div>
              <h4 className="text-xl font-bold text-zinc-900 mb-4">{s.name}</h4>
              <p className="text-zinc-500 leading-relaxed">{s.desc}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
