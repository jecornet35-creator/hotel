/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { HotelProvider } from '@/Hotelcontext';
import Index from '@/pages/index';
import Rooms from '@/pages/rooms';
import RoomDetails from '@/pages/room-details';
import Gallery from '@/pages/gallery';
import Booking from '@/pages/booking';
import AdminDashboard from '@/pages/admin/index';
import ReservationsManager from '@/pages/admin/reservations';
import RoomsManager from '@/pages/admin/rooms';
import ServicesManager from '@/pages/admin/services';
import SettingsManager from '@/pages/admin/settings';
import GalleryManager from '@/pages/admin/gallery';
import AmenitiesManager from '@/pages/admin/amenities';
import ReviewsManager from '@/pages/admin/reviews';
import MessagesManager from '@/pages/admin/messages';

function ScrollToHash() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash, pathname]);

  return null;
}

export default function App() {
  return (
    <HotelProvider>
      <Router>
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/booking" element={<Booking />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/reservations" element={<ReservationsManager />} />
          <Route path="/admin/rooms" element={<RoomsManager />} />
          <Route path="/admin/messages" element={<MessagesManager />} />
          <Route path="/admin/gallery" element={<GalleryManager />} />
          <Route path="/admin/amenities" element={<AmenitiesManager />} />
          <Route path="/admin/services" element={<ServicesManager />} />
          <Route path="/admin/settings" element={<SettingsManager />} />
          <Route path="/admin/reviews" element={<ReviewsManager />} />
        </Routes>
      </Router>
    </HotelProvider>
  );
}
