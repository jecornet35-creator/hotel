export interface Room {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  capacity: number;
  capacityLabel: string;
  images: string[];
  amenities: string[];
  available: boolean;
  size: number;
  bedType: string;
}

export interface Reservation {
  id: string;
  roomId: string;
  clientId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  addOns?: string[];
  specialRequests?: string;
  clientInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  icon?: string;
}

export interface AddOnService {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  category: string;
  caption?: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface Review {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  createdAt?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}
