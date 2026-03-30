import React from 'react';
import { useHotel } from '@/Hotelcontext';
import { 
  Wifi, 
  Car, 
  Waves, 
  Coffee, 
  Utensils, 
  Flower2, 
  Tv, 
  AirVent, 
  Wind, 
  ShieldCheck, 
  ParkingCircle, 
  Zap, 
  Dumbbell, 
  Baby, 
  Dog, 
  Briefcase, 
  Smartphone 
} from 'lucide-react';

const iconMap: { [key: string]: any } = {
  Wifi,
  Car,
  Waves,
  Coffee,
  Utensils,
  Flower2,
  Tv,
  AirVent,
  Wind,
  ShieldCheck,
  ParkingCircle,
  Zap,
  Dumbbell,
  Baby,
  Dog,
  Briefcase,
  Smartphone
};

const AmenitiesSection = () => {
  const { amenities } = useHotel();

  if (amenities.length === 0) return null;

  return (
    <section id="amenities" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-xs uppercase tracking-[0.3em] text-zinc-400 font-bold mb-4">Équipements</h2>
          <h3 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 font-serif italic">Tout pour votre confort</h3>
          <p className="text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Nous avons pensé à chaque détail pour rendre votre séjour inoubliable. 
            Découvrez les équipements et services inclus dans votre expérience.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {amenities.map((amenity) => {
            const Icon = iconMap[amenity.icon] || Wifi;
            return (
              <div key={amenity.id} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1">
                  <Icon size={24} />
                </div>
                <h4 className="text-sm font-bold text-zinc-900 mb-1">{amenity.name}</h4>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">{amenity.description ? 'Inclus' : ''}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AmenitiesSection;
