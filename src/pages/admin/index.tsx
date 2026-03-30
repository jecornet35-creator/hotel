import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  TrendingUp, 
  Users, 
  BedDouble, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Calendar as CalendarIcon,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { useHotel } from '@/Hotelcontext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { reservations, rooms, addReservation, formatPrice, addOnServices, clients } = useHotel();
  const [showQuickRes, setShowQuickRes] = useState(false);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) return `${client.firstName} ${client.lastName}`;
    return clientId;
  };
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    roomId: '',
    guests: 1,
    addOns: [] as string[]
  });

  const totalRevenue = reservations
    .filter(r => r.status === 'confirmed')
    .reduce((sum, r) => sum + r.totalPrice, 0);

  const occupancyRate = Math.round((reservations.filter(r => r.status === 'confirmed').length / rooms.length) * 100);

  const stats = [
    { 
      label: 'Revenu Total', 
      value: formatPrice(totalRevenue), 
      icon: DollarSign, 
      trend: '+12.5%', 
      trendUp: true,
      color: 'bg-emerald-50 text-emerald-600'
    },
    { 
      label: 'Taux d\'occupation', 
      value: `${occupancyRate}%`, 
      icon: TrendingUp, 
      trend: '+5.2%', 
      trendUp: true,
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      label: 'Réservations Actives', 
      value: reservations.filter(r => r.status === 'confirmed').length, 
      icon: Users, 
      trend: '-2.1%', 
      trendUp: false,
      color: 'bg-violet-50 text-violet-600'
    },
    { 
      label: 'Chambres Disponibles', 
      value: rooms.filter(r => r.available).length, 
      icon: BedDouble, 
      trend: 'Stable', 
      trendUp: true,
      color: 'bg-amber-50 text-amber-600'
    },
  ];

  const handleQuickRes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim()) {
        toast.error('Tous les champs client sont obligatoires');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        toast.error('Email invalide');
        return;
      }

      const start = new Date(formData.checkIn);
      const end = new Date(formData.checkOut);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        toast.error('Dates invalides');
        return;
      }

      if (start < today) {
        toast.error('La date d\'arrivée ne peut pas être dans le passé');
        return;
      }

      if (end <= start) {
        toast.error('La date de départ doit être après la date d\'arrivée');
        return;
      }

      const room = rooms.find(r => r.id === formData.roomId);
      if (!room) {
        toast.error('Veuillez sélectionner une chambre');
        return;
      }

      if (formData.guests <= 0) {
        toast.error('Le nombre d\'invités doit être supérieur à 0');
        return;
      }

      if (formData.guests > room.capacity) {
        toast.error(`La capacité maximale de cette chambre est de ${room.capacity} personnes`);
        return;
      }

      // Calculate total price (simple version for quick res)
      const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      
      let totalPrice = room.price * nights;
      formData.addOns.forEach(id => {
        const service = addOnServices.find(s => s.id === id);
        if (service) totalPrice += service.price;
      });

      const reservationId = Math.random().toString(36).substr(2, 9);
      const clientId = formData.email;

      // In a real app we would create the client first or link to existing
      // For this quick res, we'll just add the reservation
      await addReservation({
        id: reservationId,
        roomId: formData.roomId,
        clientId: clientId,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        totalPrice: totalPrice,
        status: 'confirmed',
        addOns: formData.addOns,
        specialRequests: '',
        clientInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        }
      });

      toast.success('Réservation enregistrée avec succès');
      setShowQuickRes(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        checkIn: '',
        checkOut: '',
        roomId: '',
        guests: 1,
        addOns: [] as string[]
      });
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn("p-3 rounded-xl", stat.color)}>
                    <stat.icon size={24} />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                    stat.trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {stat.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {stat.trend}
                  </div>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Recent Reservations */}
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-zinc-100">
              <CardTitle className="text-lg font-bold">Réservations Récentes</CardTitle>
              <button className="text-sm text-zinc-500 hover:text-zinc-900 font-medium transition-colors">Voir tout</button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-100">
                {reservations.slice(0, 5).map((res) => (
                  <div key={res.id} className="p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 font-bold">
                        {getClientName(res.clientId).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">{getClientName(res.clientId)}</p>
                        <p className="text-xs text-zinc-500">Chambre #{res.roomId} • {res.checkIn} - {res.checkOut}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-4">
                        <p className="font-bold text-zinc-900">{formatPrice(res.totalPrice)}</p>
                        <p className="text-[10px] uppercase tracking-wider text-zinc-400">Total</p>
                      </div>
                      <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold",
                        res.status === 'confirmed' ? "bg-emerald-50 text-emerald-600" :
                        res.status === 'pending' ? "bg-amber-50 text-amber-600" :
                        "bg-rose-50 text-rose-600"
                      )}>
                        {res.status === 'confirmed' ? <CheckCircle2 size={14} /> :
                         res.status === 'pending' ? <Clock size={14} /> :
                         <XCircle size={14} />}
                        {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions / Status */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-zinc-900 text-white">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4">Actions Rapides</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowQuickRes(true)}
                    className="w-full py-3 bg-white text-zinc-900 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Nouvelle Réservation
                  </button>
                  <button className="w-full py-3 bg-zinc-800 text-white rounded-xl font-bold text-sm hover:bg-zinc-700 transition-all">
                    Ajouter une Chambre
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="p-8 border-b border-zinc-100">
                <CardTitle className="text-lg font-bold">État de l'Hôtel</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-500">Occupation</span>
                    <span className="font-bold">{occupancyRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-zinc-900 transition-all duration-1000" 
                      style={{ width: `${occupancyRate}%` }} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-50 rounded-xl">
                    <p className="text-xs text-zinc-500 mb-1">Arrivées (Aujourd'hui)</p>
                    <p className="text-xl font-bold text-zinc-900">3</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-xl">
                    <p className="text-xs text-zinc-500 mb-1">Départs (Aujourd'hui)</p>
                    <p className="text-xl font-bold text-zinc-900">5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick Reservation Modal */}
      {showQuickRes && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl border-none shadow-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="p-8 border-b border-zinc-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">Réservation Rapide</CardTitle>
              <button onClick={() => setShowQuickRes(false)} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                <XCircle size={24} />
              </button>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleQuickRes} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Prénom</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                      <Input 
                        className="pl-10"
                        placeholder="Jean"
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nom</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                      <Input 
                        className="pl-10"
                        placeholder="Dupont"
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                      <Input 
                        type="email"
                        className="pl-10"
                        placeholder="jean.dupont@email.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                      <Input 
                        className="pl-10"
                        placeholder="06 12 34 56 78"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Arrivée</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                      <Input 
                        type="date"
                        className="pl-10"
                        value={formData.checkIn}
                        onChange={e => setFormData({...formData, checkIn: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Départ</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                      <Input 
                        type="date"
                        className="pl-10"
                        value={formData.checkOut}
                        onChange={e => setFormData({...formData, checkOut: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Chambre</label>
                    <select 
                      className="w-full p-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all text-sm"
                      value={formData.roomId}
                      onChange={e => setFormData({...formData, roomId: e.target.value})}
                      required
                    >
                      <option value="">Sélectionner une chambre</option>
                      {rooms.filter(r => r.available).map(room => (
                        <option key={room.id} value={room.id}>
                          {room.name} ({room.capacityLabel || `${room.capacity} Pers.`}) - {formatPrice(room.price)}/nuit
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Invités</label>
                    <Input 
                      type="number"
                      min="1"
                      value={formData.guests || ''}
                      onChange={e => setFormData({...formData, guests: parseInt(e.target.value) || 0})}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Services Additionnels</label>
                  <div className="grid grid-cols-2 gap-3">
                    {addOnServices.map(service => (
                      <label key={service.id} className="flex items-center gap-3 p-3 border border-zinc-100 rounded-xl hover:bg-zinc-50 transition-all cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={formData.addOns.includes(service.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setFormData({...formData, addOns: [...formData.addOns, service.id]});
                            } else {
                              setFormData({...formData, addOns: formData.addOns.filter(id => id !== service.id)});
                            }
                          }}
                          className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-zinc-900">{service.name}</p>
                          <p className="text-[10px] text-zinc-500">{formatPrice(service.price)}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowQuickRes(false)}
                    className="flex-1 py-4 border border-zinc-200 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg"
                  >
                    Confirmer la Réservation
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
