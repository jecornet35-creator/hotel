import type { Room, Reservation, Client, Service, AddOnService, GalleryPhoto } from '@/types/hotel';

export const rooms: Room[] = [
  {
    id: '1',
    name: 'Chambre Deluxe Vue Mer',
    type: 'Deluxe',
    description: 'Une chambre spacieuse avec un balcon privé offrant une vue imprenable sur la Méditerranée.',
    price: 350,
    capacity: 2,
    capacityLabel: '1 à 2 personnes',
    images: ['https://images.unsplash.com/photo-1591088398332-8a77d399a8a5?w=800&q=80'],
    amenities: ['Wifi', 'Mini-bar', 'Coffre-fort', 'Climatisation'],
    available: true,
    size: 35,
    bedType: 'King Size'
  },
  {
    id: '2',
    name: 'Suite Prestige',
    type: 'Suite',
    description: 'Le summum du luxe avec un salon séparé et une salle de bain en marbre.',
    price: 650,
    capacity: 3,
    capacityLabel: '1 à 3 personnes',
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80'],
    amenities: ['Wifi', 'Mini-bar', 'Coffre-fort', 'Climatisation', 'Jacuzzi'],
    available: true,
    size: 65,
    bedType: 'King Size'
  },
  {
    id: '3',
    name: 'Chambre Classique',
    type: 'Standard',
    description: 'Un cocon de confort idéal pour un court séjour d\'affaires ou de loisirs.',
    price: 220,
    capacity: 2,
    capacityLabel: '1 à 2 personnes',
    images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80'],
    amenities: ['Wifi', 'Mini-bar', 'Coffre-fort', 'Climatisation'],
    available: true,
    size: 25,
    bedType: 'Queen Size'
  }
];
export const reservations: Reservation[] = [];
export const clients: Client[] = [];
export const services: Service[] = [];
export const addOnServices: AddOnService[] = [
  {
    id: '1',
    name: 'Petit-déjeuner Gourmet',
    price: 25,
    description: 'Un buffet complet avec des produits locaux et frais servi en chambre ou au restaurant.'
  },
  {
    id: '2',
    name: 'Accès Spa Illimité',
    price: 50,
    description: 'Profitez de notre espace bien-être, sauna, hammam et piscine chauffée à tout moment.'
  },
  {
    id: '3',
    name: 'Transfert Aéroport',
    price: 80,
    description: 'Un chauffeur privé vous attend à l\'aéroport pour un trajet confortable jusqu\'à l\'hôtel.'
  }
];
export const galleryPhotos: GalleryPhoto[] = [];
