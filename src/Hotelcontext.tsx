// Hotel context – shared state for config, rooms, reservations, clients, services
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Room, Reservation, Client, Service, AddOnService, GalleryPhoto, Amenity, Review, ContactMessage } from '@/types/hotel';
import { toast } from 'sonner';

import { formatPrice as formatPriceUtil } from '@/lib/hotelUtils';

export interface PaymentGatewayConfig {
  enabled: boolean;
  publicKey: string;
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
  hotelImage: string;
  mapImage: string;
  galleryTitle: string;
  galleryDescription: string;
  stripe: PaymentGatewayConfig;
  paypal: PaymentGatewayConfig;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  smtpSecure: boolean;
  confirmationMessage: string;
  notifyNewMessageEmail: boolean;
  notifyNewMessagePhone: boolean;
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
  galleryTitle: "Immersion dans l'élégance",
  galleryDescription: "Découvrez chaque recoin de notre établissement à travers notre collection de photographies. Du raffinement de nos suites à la sérénité de nos jardins.",
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
  hotelImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
  mapImage: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80',
  stripe: { ...defaultPaymentGateway },
  paypal: { ...defaultPaymentGateway },
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPass: '',
  smtpFrom: '',
  smtpSecure: false,
  confirmationMessage: "Merci pour votre réservation ! Nous avons bien reçu votre demande et nous sommes ravis de vous accueillir prochainement.",
  notifyNewMessageEmail: true,
  notifyNewMessagePhone: false,
};

interface HotelContextType {
  config: HotelConfig;
  setConfig: (config: HotelConfig) => Promise<void>;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  addRoom: (room: Room) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  addReservation: (resv: Reservation) => Promise<void>;
  updateReservation: (resv: Reservation) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
  updateReservationStatus: (id: string, status: Reservation['status']) => Promise<void>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  addService: (service: Service) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addOnServices: AddOnService[];
  setAddOnServices: React.Dispatch<React.SetStateAction<AddOnService[]>>;
  addAddOnService: (service: AddOnService) => Promise<void>;
  deleteAddOnService: (id: string) => Promise<void>;
  messages: ContactMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ContactMessage[]>>;
  addMessage: (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  markMessageAsRead: (id: string) => Promise<void>;
  subscribeToPush: () => Promise<void>;
  galleryPhotos: GalleryPhoto[];
  setGalleryPhotos: React.Dispatch<React.SetStateAction<GalleryPhoto[]>>;
  addGalleryPhoto: (photo: GalleryPhoto) => Promise<void>;
  deleteGalleryPhoto: (id: string) => Promise<void>;
  amenities: Amenity[];
  setAmenities: React.Dispatch<React.SetStateAction<Amenity[]>>;
  addAmenity: (amenity: Amenity) => Promise<void>;
  deleteAmenity: (id: string) => Promise<void>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  addReview: (review: Review) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  formatPrice: (amount: number | string) => string;
  isLoading: boolean;
}

const HotelContext = createContext<HotelContextType | null>(null);

export const useHotel = () => {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error('useHotel must be used within HotelProvider');
  return ctx;
};

export const HotelProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfigState] = useState<HotelConfig>(defaultConfig);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [addOnServices, setAddOnServices] = useState<AddOnService[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configRes, roomsRes, resvRes, svcRes, addOnRes, galleryRes, clientsRes, amenitiesRes, reviewsRes, messagesRes] = await Promise.all([
          fetch('/api/config'),
          fetch('/api/rooms'),
          fetch('/api/reservations'),
          fetch('/api/services'),
          fetch('/api/addOnServices'),
          fetch('/api/gallery'),
          fetch('/api/clients'),
          fetch('/api/amenities'),
          fetch('/api/reviews'),
          fetch('/api/messages')
        ]);

        if (configRes.ok) setConfigState(await configRes.json());
        if (roomsRes.ok) {
          const data = await roomsRes.json();
          setRooms(data.map((r: any) => ({ ...r, price: Number(r.price) })));
        }
        if (resvRes.ok) {
          const data = await resvRes.json();
          setReservations(data.map((r: any) => ({ ...r, totalPrice: Number(r.totalPrice) })));
        }
        if (svcRes.ok) setServices(await svcRes.json());
        if (addOnRes.ok) {
          const data = await addOnRes.json();
          setAddOnServices(data.map((s: any) => ({ ...s, price: Number(s.price) })));
        }
        if (galleryRes.ok) setGalleryPhotos(await galleryRes.json());
        if (clientsRes.ok) setClients(await clientsRes.json());
        if (amenitiesRes.ok) setAmenities(await amenitiesRes.json());
        if (reviewsRes.ok) setReviews(await reviewsRes.json());
        if (messagesRes.ok) setMessages(await messagesRes.json());
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const setConfig = async (newConfig: HotelConfig) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        setConfigState(newConfig);
      } else {
        throw new Error('Failed to save config');
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde de la configuration');
      throw error;
    }
  };

  const addRoom = async (room: Room) => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room)
      });
      if (res.ok) {
        setRooms(prev => {
          const exists = prev.find(r => r.id === room.id);
          if (exists) return prev.map(r => r.id === room.id ? room : r);
          return [...prev, room];
        });
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la chambre');
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRooms(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression de la chambre');
    }
  };

  const addReservation = async (resv: Reservation) => {
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resv)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save reservation');
      }
      
      setReservations(prev => [...prev, resv]);
      
      // If client info was provided, update clients list
      if (resv.clientInfo) {
        const newClient: Client = {
          id: resv.clientId,
          firstName: resv.clientInfo.firstName,
          lastName: resv.clientInfo.lastName,
          email: resv.clientInfo.email,
          phone: resv.clientInfo.phone
        };
        setClients(prev => {
          const exists = prev.find(c => c.id === newClient.id);
          if (exists) return prev.map(c => c.id === newClient.id ? newClient : c);
          return [...prev, newClient];
        });
      }
    } catch (error) {
      console.error('Error adding reservation:', error);
      throw error;
    }
  };

  const updateReservation = async (resv: Reservation) => {
    try {
      const res = await fetch(`/api/reservations/${resv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resv)
      });
      if (res.ok) {
        setReservations(prev => prev.map(r => r.id === resv.id ? resv : r));
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la réservation');
    }
  };

  const deleteReservation = async (id: string) => {
    try {
      const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReservations(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression de la réservation');
    }
  };

  const updateReservationStatus = async (id: string, status: Reservation['status']) => {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const addService = async (service: Service) => {
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service)
      });
      if (res.ok) {
        setServices(prev => {
          const exists = prev.find(s => s.id === service.id);
          if (exists) return prev.map(s => s.id === service.id ? service : s);
          return [...prev, service];
        });
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du service');
    }
  };

  const deleteService = async (id: string) => {
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setServices(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression du service');
    }
  };

  const addAddOnService = async (service: AddOnService) => {
    try {
      const res = await fetch('/api/addOnServices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service)
      });
      if (res.ok) {
        setAddOnServices(prev => {
          const exists = prev.find(s => s.id === service.id);
          if (exists) return prev.map(s => s.id === service.id ? service : s);
          return [...prev, service];
        });
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du service additionnel');
    }
  };

  const deleteAddOnService = async (id: string) => {
    try {
      const res = await fetch(`/api/addOnServices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAddOnServices(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression du service additionnel');
    }
  };

  const addGalleryPhoto = async (photo: GalleryPhoto) => {
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photo)
      });
      if (res.ok) {
        setGalleryPhotos(prev => {
          const exists = prev.find(p => p.id === photo.id);
          if (exists) return prev.map(p => p.id === photo.id ? photo : p);
          return [...prev, photo];
        });
      } else {
        throw new Error('Failed to add photo');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la photo');
      throw error;
    }
  };

  const deleteGalleryPhoto = async (id: string) => {
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGalleryPhotos(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression de la photo');
    }
  };

  const addAmenity = async (amenity: Amenity) => {
    try {
      const res = await fetch('/api/amenities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(amenity)
      });
      if (res.ok) {
        setAmenities(prev => {
          const exists = prev.find(a => a.id === amenity.id);
          if (exists) return prev.map(a => a.id === amenity.id ? amenity : a);
          return [...prev, amenity];
        });
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de l\'équipement');
    }
  };

  const deleteAmenity = async (id: string) => {
    try {
      const res = await fetch(`/api/amenities/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAmenities(prev => prev.filter(a => a.id !== id));
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'équipement');
    }
  };

  const addReview = async (review: Review) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
      if (res.ok) {
        setReviews(prev => {
          const exists = prev.find(r => r.id === review.id);
          if (exists) return prev.map(r => r.id === review.id ? review : r);
          return [review, ...prev];
        });
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de l\'avis');
    }
  };

  const deleteReview = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'avis');
    }
  };

  const addMessage = async (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      });
      if (res.ok) {
        const data = await res.json();
        const newMessage: ContactMessage = {
          ...msg,
          id: data.id,
          createdAt: new Date().toISOString(),
          isRead: false
        };
        setMessages(prev => [newMessage, ...prev]);
        toast.success('Message envoyé avec succès');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        toast.success('Message supprimé');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression du message');
    }
  };

  const markMessageAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}/read`, { method: 'PATCH' });
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
      }
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const subscribeToPush = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        toast.error('Les notifications push ne sont pas supportées par votre navigateur');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        toast.error('Permission de notification refusée');
        return;
      }

      const vapidPublicKey = 'BEOYm_o-v-Z2vTe47Iukx5zQw2sy6na-241157635746'; // Replace with a real public key later
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      if (res.ok) {
        toast.success('Notifications activées sur cet appareil !');
      }
    } catch (error) {
      console.error('Push subscription error:', error);
      toast.error('Erreur lors de l\'activation des notifications');
    }
  };

  const formatPrice = (amount: number | string) => {
    return formatPriceUtil(amount, config.currency, config.currencySymbol);
  };

  return (
    <HotelContext.Provider value={{
      config, setConfig,
      rooms, setRooms, addRoom, deleteRoom,
      reservations, setReservations, addReservation, updateReservation, deleteReservation, updateReservationStatus,
      clients, setClients,
      services, setServices, addService, deleteService,
      addOnServices, setAddOnServices, addAddOnService, deleteAddOnService,
      galleryPhotos, setGalleryPhotos, addGalleryPhoto, deleteGalleryPhoto,
      amenities, setAmenities, addAmenity, deleteAmenity,
      reviews, setReviews, addReview, deleteReview,
      messages, setMessages, addMessage, deleteMessage, markMessageAsRead, subscribeToPush,
      formatPrice,
      isLoading,
    }}>
      {children}
    </HotelContext.Provider>
  );
};
