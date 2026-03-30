import React from 'react';
import { motion } from 'motion/react';
import { Users, Maximize, BedDouble, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Room } from '@/types/hotel';
import { useHotel } from '@/Hotelcontext';
import { cn } from '@/lib/utils';

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const { formatPrice } = useHotel();
  const navigate = useNavigate();

  const handleBook = () => {
    navigate(`/booking?room=${room.id}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10 }}
      viewport={{ once: true }}
      className="bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col h-full"
    >
      <div className="relative h-72 overflow-hidden">
        <img 
          src={room.images[0] || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80'} 
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        
        {/* Availability Badge */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className={cn(
            "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md shadow-lg",
            room.available 
              ? "bg-emerald-500/90 text-white" 
              : "bg-rose-500/90 text-white"
          )}>
            {room.available ? (
              <><CheckCircle2 size={12} /> Disponible</>
            ) : (
              <><XCircle size={12} /> Complet</>
            )}
          </span>
          <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-zinc-900 backdrop-blur-md shadow-lg w-fit">
            {room.type}
          </span>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-4 right-4 bg-zinc-900/90 backdrop-blur-md px-4 py-2 rounded-2xl text-white shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold leading-tight">À partir de</div>
          <div className="text-xl font-bold leading-tight">
            {formatPrice(room.price)} <span className="text-xs font-normal text-zinc-400">/ nuit</span>
          </div>
        </div>
      </div>
      
      <div className="p-8 flex flex-col flex-1">
        <div className="mb-auto">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-2xl font-bold text-zinc-900 leading-tight group-hover:text-zinc-700 transition-colors">
              {room.name}
            </h3>
          </div>
          <p className="text-zinc-500 text-sm mb-8 line-clamp-2 leading-relaxed">
            {room.description}
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col items-center p-3 rounded-2xl bg-zinc-50 border border-zinc-100 group-hover:bg-white group-hover:border-zinc-200 transition-colors">
              <Maximize size={18} className="text-zinc-400 mb-2" />
              <span className="text-xs font-bold text-zinc-900">{room.size}m²</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-zinc-50 border border-zinc-100 group-hover:bg-white group-hover:border-zinc-200 transition-colors">
              <Users size={18} className="text-zinc-400 mb-2" />
              <span className="text-xs font-bold text-zinc-900">{room.capacity} Pers.</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-zinc-50 border border-zinc-100 group-hover:bg-white group-hover:border-zinc-200 transition-colors">
              <BedDouble size={18} className="text-zinc-400 mb-2" />
              <span className="text-xs font-bold text-zinc-900 truncate w-full text-center">{room.bedType}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <button 
            onClick={() => navigate(`/rooms/${room.id}`)}
            className="flex-1 py-4 rounded-2xl font-bold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-all text-sm"
          >
            Détails
          </button>
          <button 
            onClick={handleBook}
            disabled={!room.available}
            className={cn(
              "flex-[2] py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]",
              room.available
                ? "bg-zinc-900 text-white hover:bg-zinc-800"
                : "bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none"
            )}
          >
            {room.available ? "Réserver" : "Complet"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomCard;
