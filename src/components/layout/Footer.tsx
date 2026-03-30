import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-zinc-900 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <div className="text-2xl font-bold mb-4 italic">Sérénité</div>
          <p className="text-zinc-400 max-w-md">
            Un havre de paix sur la Côte d'Azur, où chaque instant est une invitation à la détente et au raffinement.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-zinc-500">Navigation</h4>
          <ul className="space-y-2 text-zinc-400 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Accueil</Link></li>
            <li><Link to="/rooms" className="hover:text-white transition-colors">Chambres</Link></li>
            <li><Link to="/booking" className="hover:text-white transition-colors">Réserver</Link></li>
            <li><Link to="/admin" className="hover:text-white transition-colors">Administration</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-zinc-500">Contact</h4>
          <ul className="space-y-2 text-zinc-400 text-sm">
            <li>42 Boulevard de la Croisette</li>
            <li>06400 Cannes, France</li>
            <li>+33 4 93 00 00 00</li>
            <li>contact@serenite-hotel.com</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-800 text-center text-zinc-500 text-xs">
        &copy; {new Date().getFullYear()} Hôtel Sérénité. Tous droits réservés.
      </div>
    </footer>
  );
};

export default Footer;
