import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useHotel } from '@/Hotelcontext';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  XCircle,
  Wifi,
  Car,
  Waves,
  Coffee,
  Utensils,
  Flower2,
  Tv,
  AirVent,
  Wind,
  ShieldCheck,
  ParkingCircle,
  Zap,
  Dumbbell,
  Baby,
  Dog,
  Briefcase,
  Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const iconMap: { [key: string]: any } = {
  Wifi,
  Car,
  Waves,
  Coffee,
  Utensils,
  Flower2,
  Tv,
  AirVent,
  Wind,
  ShieldCheck,
  ParkingCircle,
  Zap,
  Dumbbell,
  Baby,
  Dog,
  Briefcase,
  Smartphone
};

const AmenitiesManager = () => {
  const { amenities, addAmenity, deleteAmenity } = useHotel();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    icon: 'Wifi',
    description: ''
  });

  const filteredAmenities = amenities.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (amenity?: any) => {
    if (amenity) {
      setEditingAmenity(amenity);
      setFormData({ ...amenity });
    } else {
      setEditingAmenity(null);
      setFormData({
        id: Math.random().toString(36).substring(2, 9),
        name: '',
        icon: 'Wifi',
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAmenity(formData);
      toast.success(editingAmenity ? 'Équipement mis à jour' : 'Équipement ajouté');
      setShowModal(false);
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      await deleteAmenity(id);
      toast.success('Équipement supprimé avec succès');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Équipements de l'Hôtel</h1>
            <p className="text-zinc-500">Gérez les services et équipements proposés à vos clients</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={18} />
            Ajouter un Équipement
          </button>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un équipement..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAmenities.map((amenity) => {
            const IconComponent = iconMap[amenity.icon] || Wifi;
            return (
              <Card key={amenity.id} className="border-none shadow-sm hover:shadow-md transition-all group">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-zinc-100 rounded-2xl text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                      <IconComponent size={24} />
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleOpenModal(amenity)}
                        className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(amenity.id)}
                        className="p-2 text-zinc-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-zinc-900">{amenity.name}</h3>
                    <p className="text-sm text-zinc-500 line-clamp-2">{amenity.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-none shadow-2xl">
            <CardHeader className="p-8 border-b border-zinc-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">
                {editingAmenity ? 'Modifier l\'Équipement' : 'Ajouter un Équipement'}
              </CardTitle>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                <XCircle size={24} />
              </button>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nom de l'équipement</label>
                  <Input 
                    placeholder="ex: Wifi Gratuit"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Icône</label>
                  <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 border border-zinc-100 rounded-xl">
                    {Object.keys(iconMap).map(iconName => {
                      const Icon = iconMap[iconName];
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setFormData({...formData, icon: iconName})}
                          className={cn(
                            "p-3 rounded-lg flex items-center justify-center transition-all",
                            formData.icon === iconName ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-400"
                          )}
                        >
                          <Icon size={20} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Description</label>
                  <Textarea 
                    placeholder="Description courte..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
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
    </AdminLayout>
  );
};

export default AmenitiesManager;
