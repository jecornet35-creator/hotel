import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useHotel } from '@/Hotelcontext';
import { Star, Trash2, Plus, User, MessageSquare, Briefcase, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import type { Review } from '@/types/hotel';

const ReviewsManager = () => {
  const { reviews, addReview, deleteReview } = useHotel();
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReview, setNewReview] = useState<Partial<Review>>({
    name: '',
    role: '',
    text: '',
    rating: 5
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    try {
      const review: Review = {
        id: Date.now().toString(),
        name: newReview.name!,
        role: newReview.role || 'Client',
        text: newReview.text!,
        rating: newReview.rating || 5,
      };
      await addReview(review);
      toast.success('Avis ajouté avec succès');
      setNewReview({ name: '', role: '', text: '', rating: 5 });
      setIsAdding(false);
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de l\'avis');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      try {
        await deleteReview(id);
        toast.success('Avis supprimé');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Avis Clients</h1>
            <p className="text-zinc-500">Gérez les témoignages affichés sur votre site.</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
          >
            {isAdding ? 'Annuler' : <><Plus size={20} /> Ajouter un avis</>}
          </button>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12"
            >
              <Card className="border-none shadow-xl overflow-hidden">
                <CardHeader className="bg-zinc-900 text-white p-6">
                  <CardTitle className="text-lg">Nouvel Avis</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nom du client *</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                          <Input
                            value={newReview.name}
                            onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                            placeholder="Ex: Jean Dupont"
                            className="pl-12 bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Profil / Rôle</label>
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                          <Input
                            value={newReview.role}
                            onChange={(e) => setNewReview({ ...newReview, role: e.target.value })}
                            placeholder="Ex: Voyageur d'affaires"
                            className="pl-12 bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Note (Étoiles)</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            <Star
                              size={24}
                              className={star <= (newReview.rating || 0) ? "text-amber-400 fill-amber-400" : "text-zinc-200"}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Commentaire *</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 text-zinc-400" size={16} />
                        <Textarea
                          value={newReview.text}
                          onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                          placeholder="Rédigez l'avis ici..."
                          className="pl-12 min-h-[120px] bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold shadow-xl hover:bg-zinc-800 transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Publier l\'avis'}
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <motion.div
                key={review.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-8 items-start group hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-zinc-200"}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Récemment'}
                    </span>
                  </div>
                  <p className="text-zinc-600 italic mb-6 leading-relaxed">"{review.text}"</p>
                  <div>
                    <h4 className="font-bold text-zinc-900">{review.name}</h4>
                    <p className="text-xs text-zinc-400 uppercase tracking-widest">{review.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                  title="Supprimer l'avis"
                >
                  <Trash2 size={20} />
                </button>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
              <MessageSquare className="mx-auto text-zinc-300 mb-4" size={48} />
              <p className="text-zinc-400 italic">Aucun avis client pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReviewsManager;
