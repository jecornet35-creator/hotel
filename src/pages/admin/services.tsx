import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useHotel } from '@/Hotelcontext';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  Coffee,
  Waves,
  Car,
  Utensils,
  Wifi,
  Tv,
  Sparkles,
  Plane,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AddOnService } from '@/types/hotel';

const ServicesManager = () => {
  const { addOnServices, addAddOnService, deleteAddOnService, formatPrice } = useHotel();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<AddOnService | null>(null);
  const [formData, setFormData] = useState<Partial<AddOnService>>({
    name: '',
    price: 0,
    description: ''
  });

  const filteredServices = addOnServices.filter(svc => 
    svc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      await deleteAddOnService(id);
      toast.success('Service supprimé avec succès');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const serviceData: AddOnService = {
      id: editingService?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name || '',
      price: Number(formData.price) || 0,
      description: formData.description || ''
    };

    await addAddOnService(serviceData);
    toast.success(editingService ? 'Service mis à jour' : 'Service ajouté');
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({ name: '', price: 0, description: '' });
  };

  const openEditModal = (svc: AddOnService) => {
    setEditingService(svc);
    setFormData({
      name: svc.name,
      price: svc.price,
      description: svc.description
    });
    setIsModalOpen(true);
  };

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('déjeuner') || n.includes('breakfast')) return <Coffee size={24} />;
    if (n.includes('spa') || n.includes('bien-être')) return <Sparkles size={24} />;
    if (n.includes('transfert') || n.includes('aéroport')) return <Plane size={24} />;
    if (n.includes('parking')) return <Car size={24} />;
    if (n.includes('wifi')) return <Wifi size={24} />;
    return <Utensils size={24} />;
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
              placeholder="Rechercher un service..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => {
              setEditingService(null);
              setFormData({ name: '', price: 0, description: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={18} />
            Ajouter un Service
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((svc) => (
            <Card key={svc.id} className="border-none shadow-sm hover:shadow-md transition-all group">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-zinc-100 rounded-2xl text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                    {getIcon(svc.name)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditModal(svc)}
                      className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteService(svc.id)}
                      className="p-2 text-zinc-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <h3 className="text-xl font-bold text-zinc-900">{svc.name}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-2">{svc.description}</p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
                  <p className="text-2xl font-bold text-zinc-900">{formatPrice(svc.price)}</p>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 size={12} />
                    Actif
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredServices.length === 0 && (
            <div className="col-span-full p-20 text-center">
              <div className="flex flex-col items-center gap-4 text-zinc-400">
                <Plus size={48} className="opacity-20" />
                <p className="italic">Aucun service trouvé pour ces critères.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-none shadow-2xl">
            <CardHeader className="p-8 border-b border-zinc-100 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">
                {editingService ? 'Modifier le Service' : 'Ajouter un Service'}
              </CardTitle>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                <X size={24} />
              </button>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nom du Service</label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ex: Petit-déjeuner Buffet"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Prix</label>
                  <Input 
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Description</label>
                  <textarea 
                    className="w-full p-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all text-sm"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez brièvement le service..."
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
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

export default ServicesManager;
