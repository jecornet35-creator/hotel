import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useHotel } from '@/Hotelcontext';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Calendar,
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ReservationsManager = () => {
  const { reservations, clients, rooms, addOnServices, updateReservationStatus, deleteReservation, updateReservation, formatPrice } = useHotel();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [checkInFilter, setCheckInFilter] = useState('');
  const [checkOutFilter, setCheckOutFilter] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');
  const [editingRes, setEditingRes] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const roomTypes = Array.from(new Set(rooms.map(r => r.type)));

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) return `${client.firstName} ${client.lastName}`;
    return clientId;
  };

  const getAddOnNames = (addOnIds: string[]) => {
    if (!addOnIds || !Array.isArray(addOnIds)) return '';
    return addOnIds.map(id => {
      const svc = addOnServices.find(s => s.id === id);
      return svc ? svc.name : id;
    }).join(', ');
  };

  const filteredReservations = reservations.filter(res => {
    const clientName = getClientName(res.clientId);
    const room = rooms.find(r => r.id === res.roomId);
    
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         res.roomId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    const matchesCheckIn = !checkInFilter || res.checkIn === checkInFilter;
    const matchesCheckOut = !checkOutFilter || res.checkOut === checkOutFilter;
    const matchesRoomType = roomTypeFilter === 'all' || (room && room.type === roomTypeFilter);
    
    return matchesSearch && matchesStatus && matchesCheckIn && matchesCheckOut && matchesRoomType;
  });

  const totalPages = Math.ceil(filteredReservations.length / ITEMS_PER_PAGE);
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, checkInFilter, checkOutFilter, roomTypeFilter]);

  const updateStatus = async (id: string, newStatus: 'confirmed' | 'cancelled') => {
    await updateReservationStatus(id, newStatus);
    toast.success(`Réservation ${newStatus === 'confirmed' ? 'confirmée' : 'annulée'} avec succès`);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteReservation(deletingId);
    setDeletingId(null);
    toast.success('Réservation supprimée avec succès');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRes) return;
    await updateReservation(editingRes);
    setEditingRes(null);
    toast.success('Réservation mise à jour avec succès');
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Actions */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="flex flex-1 gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher par client ou chambre..." 
                  className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "px-4 py-3 rounded-xl border font-bold text-sm flex items-center gap-2 transition-all",
                  showFilters || checkInFilter || checkOutFilter || roomTypeFilter !== 'all'
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900/20"
                )}
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filtres</span>
                {(checkInFilter || checkOutFilter || roomTypeFilter !== 'all') && (
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                    statusFilter === status 
                      ? "bg-zinc-900 text-white shadow-lg" 
                      : "bg-white text-zinc-500 border border-zinc-200 hover:border-zinc-900/20"
                  )}
                >
                  {status === 'all' ? 'Tous' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <Card className="border-none shadow-sm bg-zinc-50/50">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Date d'arrivée</label>
                    <Input 
                      type="date" 
                      value={checkInFilter}
                      onChange={(e) => setCheckInFilter(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Date de départ</label>
                    <Input 
                      type="date" 
                      value={checkOutFilter}
                      onChange={(e) => setCheckOutFilter(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Type de chambre</label>
                    <select 
                      className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all text-sm"
                      value={roomTypeFilter}
                      onChange={(e) => setRoomTypeFilter(e.target.value)}
                    >
                      <option value="all">Tous les types</option>
                      {roomTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={() => {
                        setCheckInFilter('');
                        setCheckOutFilter('');
                        setRoomTypeFilter('all');
                        setSearchTerm('');
                        setStatusFilter('all');
                      }}
                      className="w-full py-2.5 text-zinc-500 text-sm font-medium hover:text-zinc-900 transition-colors"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Reservations Table */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="p-8 border-b border-zinc-100 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Liste des Réservations</CardTitle>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span className="font-bold text-zinc-900">{filteredReservations.length}</span> résultats
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100">
                    <th className="p-6 text-xs font-bold uppercase tracking-wider text-zinc-400">Client & Chambre</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-wider text-zinc-400">Dates du Séjour</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-wider text-zinc-400">Montant Total</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-wider text-zinc-400">Statut</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-wider text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {paginatedReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-zinc-50 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500">
                            <User size={18} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-zinc-900">{getClientName(res.clientId)}</p>
                              {res.specialRequests && (
                                <div className="group/msg relative">
                                  <MessageSquare size={14} className="text-amber-500 cursor-help" />
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-zinc-900 text-white text-[10px] rounded-lg opacity-0 group-hover/msg:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                    <p className="font-bold mb-1 uppercase tracking-wider">Note client :</p>
                                    {res.specialRequests}
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500">Chambre #{res.roomId} • {res.guests} pers.</p>
                            {res.addOns && res.addOns.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {res.addOns.map((id: string) => {
                                  const svc = addOnServices.find(s => s.id === id);
                                  return svc ? (
                                    <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[9px] font-bold uppercase tracking-wider">
                                      <Sparkles size={8} />
                                      {svc.name}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3 text-zinc-600">
                          <Calendar size={16} className="text-zinc-400" />
                          <div className="text-sm">
                            <p className="font-medium">{res.checkIn}</p>
                            <p className="text-xs text-zinc-400">au {res.checkOut}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <CreditCard size={16} className="text-zinc-400" />
                          <p className="font-bold text-zinc-900">{formatPrice(res.totalPrice)}</p>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          res.status === 'confirmed' ? "bg-emerald-50 text-emerald-600" :
                          res.status === 'pending' ? "bg-amber-50 text-amber-600" :
                          "bg-rose-50 text-rose-600"
                        )}>
                          {res.status === 'confirmed' ? <CheckCircle2 size={12} /> :
                           res.status === 'pending' ? <Clock size={12} /> :
                           <XCircle size={12} />}
                          {res.status}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 transition-opacity">
                          <button 
                            onClick={() => setEditingRes(res)}
                            className="p-2 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200 transition-colors"
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </button>
                          {res.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => updateStatus(res.id, 'confirmed')}
                                className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                title="Confirmer"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                              <button 
                                onClick={() => updateStatus(res.id, 'cancelled')}
                                className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                                title="Annuler"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => setDeletingId(res.id)}
                            className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedReservations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-20 text-center">
                        <div className="flex flex-col items-center gap-4 text-zinc-400">
                          <Search size={48} className="opacity-20" />
                          <p className="italic">Aucune réservation trouvée pour ces critères.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="p-8 border-t border-zinc-100 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                Affichage de {filteredReservations.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, filteredReservations.length)} sur {filteredReservations.length} résultats
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-900 hover:border-zinc-900/20 transition-all disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={cn(
                        "w-10 h-10 rounded-lg font-bold text-sm transition-all",
                        currentPage === i + 1 
                          ? "bg-zinc-900 text-white shadow-lg" 
                          : "text-zinc-500 hover:bg-zinc-100"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 border border-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-900 hover:border-zinc-900/20 transition-all disabled:opacity-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        {deletingId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-sm border-none shadow-2xl">
              <CardHeader className="p-8 text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} />
                </div>
                <CardTitle className="text-xl font-bold">Supprimer la réservation ?</CardTitle>
                <p className="text-sm text-zinc-500 mt-2">Cette action est irréversible.</p>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex gap-3">
                <button 
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-3 border border-zinc-200 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
                >
                  Supprimer
                </button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Modal */}
        {editingRes && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg border-none shadow-2xl">
              <CardHeader className="p-8 border-b border-zinc-100">
                <CardTitle className="text-xl font-bold">Modifier la Réservation</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Arrivée</label>
                      <Input 
                        type="date" 
                        value={editingRes.checkIn} 
                        onChange={(e) => setEditingRes({ ...editingRes, checkIn: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Départ</label>
                      <Input 
                        type="date" 
                        value={editingRes.checkOut} 
                        onChange={(e) => setEditingRes({ ...editingRes, checkOut: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Chambre</label>
                    <select 
                      className="w-full p-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all text-sm"
                      value={editingRes.roomId}
                      onChange={(e) => setEditingRes({ ...editingRes, roomId: e.target.value })}
                      required
                    >
                      {rooms.map(room => (
                        <option key={room.id} value={room.id}>{room.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Prix Total</label>
                      <Input 
                        type="number" 
                        value={editingRes.totalPrice || ''} 
                        onChange={(e) => setEditingRes({ ...editingRes, totalPrice: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Statut</label>
                      <select 
                        className="w-full p-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all text-sm"
                        value={editingRes.status}
                        onChange={(e) => setEditingRes({ ...editingRes, status: e.target.value as any })}
                        required
                      >
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                    </div>
                  </div>
                  {editingRes.addOns && editingRes.addOns.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Services Additionnels</label>
                      <div className="flex flex-wrap gap-2">
                        {editingRes.addOns.map((id: string) => {
                          const svc = addOnServices.find(s => s.id === id);
                          return svc ? (
                            <div key={id} className="px-3 py-1.5 bg-zinc-100 text-zinc-900 rounded-lg text-xs font-medium border border-zinc-200">
                              {svc.name} ({formatPrice(svc.price)})
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Commentaires / Demandes spéciales</label>
                    <textarea 
                      className="w-full p-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all text-sm"
                      rows={3}
                      value={editingRes.specialRequests || ''}
                      onChange={(e) => setEditingRes({ ...editingRes, specialRequests: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setEditingRes(null)}
                      className="flex-1 py-3 border border-zinc-200 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-all"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReservationsManager;
