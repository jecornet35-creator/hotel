import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useHotel } from '@/Hotelcontext';
import { Plus, Trash2, Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const GalleryManager = () => {
  const { galleryPhotos, addGalleryPhoto, deleteGalleryPhoto } = useHotel();
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newPhoto, setNewPhoto] = useState({
    id: '',
    url: '',
    category: 'Général',
    caption: ''
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setNewPhoto(prev => ({ ...prev, url: data.url }));
      toast.success('Image téléchargée avec succès');
    } catch (error) {
      toast.error('Erreur lors du téléchargement de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!newPhoto.url) {
      toast.error('Veuillez sélectionner une image');
      return;
    }
    try {
      const photoToAdd = {
        ...newPhoto,
        id: newPhoto.id || Math.random().toString(36).substring(2, 9)
      };
      await addGalleryPhoto(photoToAdd);
      setIsAdding(false);
      setNewPhoto({ id: '', url: '', category: 'Général', caption: '' });
      toast.success('Photo ajoutée à la galerie');
    } catch (error) {
      // Error is already handled in addGalleryPhoto (toast)
      console.error('Error adding photo:', error);
    }
  };

  const categories = ['Général', 'Chambres', 'Restaurant', 'Spa', 'Extérieur'];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Galerie Photos</h1>
            <p className="text-zinc-500">Gérez les images affichées sur votre site</p>
          </div>
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-6 py-6 h-auto font-bold flex gap-2"
          >
            <Plus size={20} />
            Ajouter une photo
          </Button>
        </div>

        {isAdding && (
          <Card className="mb-10 border-2 border-zinc-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Nouvelle Photo</h2>
                <button onClick={() => setIsAdding(false)} className="text-zinc-400 hover:text-zinc-900">
                  <X size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Image</label>
                    <div className="relative aspect-video bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center overflow-hidden group">
                      {isUploading ? (
                        <Loader2 className="animate-spin text-zinc-400" size={32} />
                      ) : newPhoto.url ? (
                        <>
                          <img src={newPhoto.url} className="w-full h-full object-cover" alt="Preview" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="bg-white text-zinc-900 px-4 py-2 rounded-lg font-bold text-sm cursor-pointer shadow-xl">
                              Changer
                              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </label>
                          </div>
                        </>
                      ) : (
                        <label className="flex flex-col items-center gap-3 cursor-pointer p-10 text-center">
                          <Upload size={32} className="text-zinc-300" />
                          <div className="space-y-1">
                            <p className="font-bold text-zinc-500">Cliquez pour télécharger</p>
                            <p className="text-xs text-zinc-400">PNG, JPG ou WEBP jusqu'à 5MB</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Catégorie</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setNewPhoto({ ...newPhoto, category: cat })}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                            newPhoto.category === cat 
                              ? 'bg-zinc-900 text-white shadow-lg' 
                              : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Légende (Optionnel)</label>
                    <Input 
                      value={newPhoto.caption}
                      onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
                      placeholder="Décrivez cette photo..."
                      className="bg-zinc-50 border-none h-12"
                    />
                  </div>
                  <div className="pt-4 flex gap-4">
                    <Button 
                      onClick={handleAdd}
                      className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-12 rounded-xl"
                    >
                      Ajouter à la galerie
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setIsAdding(false)}
                      className="px-8 h-12 rounded-xl border-zinc-200 font-bold"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryPhotos.map((photo) => (
            <Card key={photo.id} className="group relative overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={photo.url} 
                  alt={photo.caption} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md rounded text-[10px] uppercase tracking-widest font-bold text-white mb-2">
                      {photo.category}
                    </span>
                    <p className="text-white font-medium text-sm line-clamp-1">{photo.caption || 'Sans légende'}</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm('Supprimer cette photo ?')) deleteGalleryPhoto(photo.id);
                    }}
                    className="w-10 h-10 bg-red-500/20 hover:bg-red-500 backdrop-blur-md text-white rounded-xl flex items-center justify-center transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}

          {galleryPhotos.length === 0 && !isAdding && (
            <div className="col-span-full py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-300 mb-4">
                <ImageIcon size={32} />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">Aucune photo</h3>
              <p className="text-zinc-500 mb-6">Commencez par ajouter des photos à votre galerie</p>
              <Button 
                onClick={() => setIsAdding(true)}
                variant="outline"
                className="rounded-xl font-bold border-zinc-200"
              >
                Ajouter ma première photo
              </Button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default GalleryManager;
