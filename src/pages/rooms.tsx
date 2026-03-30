import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RoomCard from '@/components/rooms/RoomCard';
import { useHotel } from '@/Hotelcontext';

const Rooms = () => {
  const { rooms } = useHotel();

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <main className="pt-16">
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="tracking-[0.3em] uppercase text-xs text-zinc-400 font-bold mb-4">Hébergement</p>
              <h1 className="font-serif italic text-4xl md:text-5xl text-zinc-900 mb-6">Chambres & Suites</h1>
              <p className="text-zinc-500 max-w-xl mx-auto text-lg">
                Découvrez nos hébergements d'exception, chacun pensé pour vous offrir un séjour inoubliable au cœur de la Côte d'Azur.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <p className="text-zinc-400 italic">Aucune chambre disponible pour le moment.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Rooms;
