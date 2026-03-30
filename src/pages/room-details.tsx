import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHotel } from '@/Hotelcontext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'motion/react';
import { 
  Users, 
  Maximize, 
  BedDouble, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft,
  Wifi,
  Wind,
  Coffee,
  Tv,
  Car,
  Waves
} from 'lucide-react';
import { cn } from '@/lib/utils';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rooms, formatPrice } = useHotel();
  
  const room = rooms.find(r => r.id === id);

  if (!room) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-4">Chambre non trouvée</h1>
        <button 
          onClick={() => navigate('/rooms')}
          className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold"
        >
          Retour aux chambres
        </button>
      </div>
    );
  }

  const amenityIcons: Record<string, any> = {
    'Wi-Fi': Wifi,
    'Climatisation': Wind,
    'Petit-déjeuner': Coffee,
    'TV': Tv,
    'Parking': Car,
    'Piscine': Waves,
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      
      <main className="pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <button 
            onClick={() => navigate('/rooms')}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors mb-12 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm uppercase tracking-widest">Retour aux chambres</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left: Images */}
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]"
              >
                <img 
                  src={room.images[0]} 
                  alt={room.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <div className="grid grid-cols-2 gap-6">
                {room.images.slice(1, 3).map((img, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden shadow-xl aspect-video">
                    <img 
                      src={img} 
                      alt={`${room.name} ${idx + 2}`} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Info */}
            <div className="flex flex-col">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                    room.available ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                  )}>
                    {room.available ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {room.available ? "Disponible" : "Complet"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500">
                    {room.type}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 font-serif italic">
                  {room.name}
                </h1>
                <p className="text-zinc-500 text-lg leading-relaxed">
                  {room.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-12">
                <div className="p-6 rounded-3xl bg-white border border-zinc-100 shadow-sm flex flex-col items-center text-center">
                  <Maximize className="text-zinc-400 mb-3" size={24} />
                  <span className="text-sm font-bold text-zinc-900">{room.size}m²</span>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Surface</span>
                </div>
                <div className="p-6 rounded-3xl bg-white border border-zinc-100 shadow-sm flex flex-col items-center text-center">
                  <Users className="text-zinc-400 mb-3" size={24} />
                  <span className="text-sm font-bold text-zinc-900">{room.capacity} Pers.</span>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Capacité</span>
                </div>
                <div className="p-6 rounded-3xl bg-white border border-zinc-100 shadow-sm flex flex-col items-center text-center">
                  <BedDouble className="text-zinc-400 mb-3" size={24} />
                  <span className="text-sm font-bold text-zinc-900 truncate w-full">{room.bedType}</span>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Literie</span>
                </div>
              </div>

              <div className="mb-12">
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-6">Équipements</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {room.amenities.map((amenity, idx) => {
                    const Icon = amenityIcons[amenity] || CheckCircle2;
                    return (
                      <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-zinc-100">
                        <Icon size={18} className="text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-700">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-auto pt-10 border-t border-zinc-200 flex items-center justify-between gap-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Prix par nuit</p>
                  <p className="text-3xl font-bold text-zinc-900">{formatPrice(room.price)}</p>
                </div>
                <button 
                  onClick={() => navigate(`/booking?room=${room.id}`)}
                  disabled={!room.available}
                  className={cn(
                    "flex-1 py-5 rounded-2xl font-bold text-lg shadow-2xl transition-all active:scale-95",
                    room.available 
                      ? "bg-zinc-900 text-white hover:bg-zinc-800" 
                      : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                  )}
                >
                  {room.available ? "Réserver ce séjour" : "Indisponible"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RoomDetails;
