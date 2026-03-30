// Hotel context – shared state for config, rooms, reservations, clients, services
import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { rooms as initialRooms, reservations as initialReservations, clients as initialClients, services as initialServices, addOnServices as initialAddOns, galleryPhotos as initialGallery } from '@/data/mockData';
import type { Room, Reservation, Client, Service, AddOnService, GalleryPhoto } from '@/types/hotel';

export interface PaymentGatewayConfig {
  enabled: boolean;
  publicKey: string;
  // Secret key is NEVER stored in frontend — only in env vars / edge function
  successUrl: string;
  cancelUrl: string;
}

export interface HotelConfig {
  hotelName: string;
  tagline: string;
  aboutText: string;
  heroImage: string;
  checkInTime: string;
  checkOutTime: string;
  currency: string;
  currencySymbol: string;
  paymentMode: 'arrival' | 'deposit';
  depositPercentage: number;
  phone: string;
  email: string;
  address: string;
  city: string;
  stripe: PaymentGatewayConfig;
  paypal: PaymentGatewayConfig;
}

const defaultPaymentGateway: PaymentGatewayConfig = {
  enabled: false,
  publicKey: '',
  successUrl: '',
  cancelUrl: '',
};

const defaultConfig: HotelConfig = {
  hotelName: 'Sérénité',
  tagline: "Un havre de paix sur la Côte d'Azur, où chaque instant est une invitation à la détente et au raffinement.",
  aboutText: "Niché au cœur de la Côte d'Azur, notre hôtel vous accueille dans un cadre d'exception où le luxe discret se mêle à la beauté naturelle de la Méditerranée. Chaque détail a été pensé pour créer une expérience unique et mémorable.",
  heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80',
  currency: 'EUR',
  currencySymbol: '€',
  paymentMode: 'arrival',
  depositPercentage: 30,
  checkInTime: '14:00',
  checkOutTime: '11:00',
  phone: '+33 4 93 00 00 00',
  email: 'contact@serenite-hotel.com',
  address: '42 Boulevard de la Croisette',
  city: '06400 Cannes, France',
  stripe: {
    ...defaultPaymentGateway,
    publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
    successUrl: import.meta.env.VITE_PAYMENT_SUCCESS_URL || '',
    cancelUrl: import.meta.env.VITE_PAYMENT_CANCEL_URL || '',
  },
  paypal: {
    ...defaultPaymentGateway,
    publicKey: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
    successUrl: import.meta.env.VITE_PAYMENT_SUCCESS_URL || '',
    cancelUrl: import.meta.env.VITE_PAYMENT_CANCEL_URL || '',
  },
};

interface HotelContextType {
  config: HotelConfig;
  setConfig: React.Dispatch<React.SetStateAction<HotelConfig>>;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  addOnServices: AddOnService[];
  setAddOnServices: React.Dispatch<React.SetStateAction<AddOnService[]>>;
  galleryPhotos: GalleryPhoto[];
  setGalleryPhotos: React.Dispatch<React.SetStateAction<GalleryPhoto[]>>;
  formatPrice: (amount: number) => string;
}

const HotelContext = createContext<HotelContextType | null>(null);

export const useHotel = () => {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error('useHotel must be used within HotelProvider');
  return ctx;
};

export const HotelProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<HotelConfig>(defaultConfig);
  const [rooms, setRooms] = useState<Room[]>([...initialRooms]);
  const [reservations, setReservations] = useState<Reservation[]>([...initialReservations]);
  const [clients, setClients] = useState<Client[]>([...initialClients]);
  const [services, setServices] = useState<Service[]>([...initialServices]);
  const [addOnServices, setAddOnServices] = useState<AddOnService[]>([...initialAddOns]);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([...initialGallery]);

  const formatPrice = (amount: number) => {
    if (config.currency === 'XOF') return `${amount.toLocaleString()} CFA`;
    return `${config.currencySymbol}${amount.toLocaleString()}`;
  };

  return (
    <HotelContext.Provider value={{
      config, setConfig,
      rooms, setRooms,
      reservations, setReservations,
      clients, setClients,
      services, setServices,
      addOnServices, setAddOnServices,
      galleryPhotos, setGalleryPhotos,
      formatPrice,
    }}>
      {children}
    </HotelContext.Provider>
  );
};
