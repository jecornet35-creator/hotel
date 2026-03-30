import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useHotel } from '@/Hotelcontext';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users, 
  Maximize, 
  BedDouble,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  MoreVertical,
  Save,
  Loader2,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const RoomsManager = () => {
  const { rooms, addRoom, deleteRoom, formatPrice } = useHotel();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: '',
    description: '',
    price: 0,
    capacity: 1,
    capacityLabel: '',
    size: 20,
    bedType: '',
    images: [''],
    amenities: [] as string[],
    available: true
  });

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    room.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (room?: any) => {
    if (room) {
      setEditingRoom(room);
      setFormData({ ...room });
    } else {
      setEditingRoom(null);
      setFormData({
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        type: '',
        description: '',
        price: 0,
        capacity: 1,
        capacityLabel: '',
        size: 20,
        bedType: '',
        images: ['https://images.unsplash.com/photo-1591088398332-8a77d399a8a5?w=800&q=80'],
        amenities: ['Wifi', 'Climatisation'],
        available: true
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addRoom(formData);
      toast.success(editingRoom ? 'Chambre mise à jour' : 'Chambre ajoutée');
      setShowModal(false);
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      setFormData(prev => ({
        ...prev,
        images: [result.url]
      }));
      toast.success('Image téléchargée avec succès');
    } catch (error) {
      toast.error('Erreur lors du téléchargement de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const toggleAvailability = async (id: string) => {
    const room = rooms.find(r => r.id === id);
    if (!room) return;
    
    const updatedRoom = { ...room, available: !room.available };
    await addRoom(updatedRoom);
    toast.success(`Chambre ${room.name} est maintenant ${!room.available ? 'disponible' : 'indisponible'}`);
  };

  const handleDeleteRoom = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette chambre ?')) {
      await deleteRoom(id);
      toast.success('Chambre supprimée avec succès');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher une chambre..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={18} />
            Ajouter une Chambre
          </button>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={room.images[0]} 
                  alt={room.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md",
                    room.available ? "bg-emerald-500/90 text-white" : "bg-rose-500/90 text-white"
                  )}>
                    {room.available ? 'Disponible' : 'Indisponible'}
                  </div>
                  <div className="px-3 py-1.5 bg-zinc-900/80 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md">
                    {room.type}
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-white/90 text-zinc-900 rounded-lg shadow-lg hover:bg-white transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
              
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900">{room.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1">ID: {room.id}</p>
                  </div>
                  <p className="text-lg font-bold text-zinc-900">{formatPrice(room.price)}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 py-6 border-y border-zinc-100 mb-6">
                  <div className="flex flex-col items-center gap-1">
                    <Users size={16} className="text-zinc-400" />
                    <span className="text-[10px] font-bold text-zinc-900 text-center leading-tight">{room.capacityLabel || `${room.capacity} Pers.`}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Maximize size={16} className="text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-900">{room.size}m²</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <BedDouble size={16} className="text-zinc-400" />
                    <span className="text-[10px] font-bold text-zinc-900 text-center leading-tight">{room.bedType}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleAvailability(room.id)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2",
                      room.available 
                        ? "bg-rose-50 text-rose-600 hover:bg-rose-100" 
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    )}
                  >
                    {room.available ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                    {room.available ? 'Désactiver' : 'Activer'}
                  </button>
                  <button 
                    onClick={() => handleOpenModal(room)}
                    className="p-2.5 bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteRoom(room.id)}
                    className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredRooms.length === 0 && (
            <div className="col-span-full p-20 text-center">
              <div className="flex flex-col items-center gap-4 text-zinc-400">
                <BedDouble size={48} className="opacity-20" />
                <p className="italic">Aucune chambre trouvée pour ces critères.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl border-none shadow-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="p-8 border-b border-zinc-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">
                {editingRoom ? 'Modifier la Chambre' : 'Ajouter une Chambre'}
              </CardTitle>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                <XCircle size={24} />
              </button>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nom de la chambre</label>
                    <Input 
                      placeholder="Chambre Deluxe"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Type</label>
                    <Input 
                      placeholder="Deluxe / Suite / Standard"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Description</label>
                    <Textarea 
                      placeholder="Description détaillée..."
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Prix par nuit</label>
                    <Input 
                      type="number"
                      value={formData.price || ''}
                      onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Capacité (Nombre)</label>
                    <Input 
                      type="number"
                      value={formData.capacity || ''}
                      onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Libellé Capacité</label>
                    <Input 
                      placeholder="ex: 1 à 2 personnes"
                      value={formData.capacityLabel}
                      onChange={e => setFormData({...formData, capacityLabel: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Taille (m²)</label>
                    <Input 
                      type="number"
                      value={formData.size || ''}
                      onChange={e => setFormData({...formData, size: parseFloat(e.target.value) || 0})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Type de lit</label>
                    <Input 
                      placeholder="King Size / Queen Size"
                      value={formData.bedType}
                      onChange={e => setFormData({...formData, bedType: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Image de la chambre</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="URL de l'image"
                        value={formData.images[0]}
                        onChange={e => setFormData({...formData, images: [e.target.value]})}
                        required
                      />
                      <div className="relative">
                        <input
                          type="file"
                          id="room-image-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('room-image-upload')?.click()}
                          disabled={uploading}
                          className="p-2 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
                          title="Télécharger une image"
                        >
                          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 border border-zinc-200 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Enregistrer
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

export default RoomsManager;
