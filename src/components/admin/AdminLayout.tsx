import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  BedDouble, 
  Settings, 
  LogOut, 
  ChevronRight,
  Hotel,
  PlusCircle,
  Image as ImageIcon,
  MessageSquare,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin' },
    { icon: CalendarCheck, label: 'Réservations', path: '/admin/reservations' },
    { icon: BedDouble, label: 'Chambres', path: '/admin/rooms' },
    { icon: Mail, label: 'Messages', path: '/admin/messages' },
    { icon: PlusCircle, label: 'Équipements', path: '/admin/amenities' },
    { icon: ImageIcon, label: 'Galerie', path: '/admin/gallery' },
    { icon: PlusCircle, label: 'Services', path: '/admin/services' },
    { icon: MessageSquare, label: 'Avis Clients', path: '/admin/reviews' },
    { icon: Settings, label: 'Paramètres', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-zinc-800">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Hotel className="text-zinc-900" size={24} />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold tracking-tight">Sérénité</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl transition-all group",
                  isActive 
                    ? "bg-white text-zinc-900 shadow-lg" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-zinc-800">
          <Link 
            to="/" 
            className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors p-3"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Quitter l'admin</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-zinc-200 py-6 px-10 sticky top-0 z-10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-zinc-900">
            {menuItems.find(item => item.path === location.pathname)?.label || 'Administration'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-zinc-900">Admin User</p>
              <p className="text-xs text-zinc-500">Administrateur</p>
            </div>
            <div className="w-10 h-10 bg-zinc-100 rounded-full border border-zinc-200" />
          </div>
        </header>
        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
