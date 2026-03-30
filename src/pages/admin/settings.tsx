import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useHotel } from '@/Hotelcontext';
import { 
  Save, 
  Hotel, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CreditCard, 
  Globe,
  Image as ImageIcon,
  ChevronRight,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SettingsManager = () => {
  const { config, setConfig, subscribeToPush } = useHotel();
  const [form, setForm] = useState({ ...config });

  React.useEffect(() => {
    setForm({ ...config });
  }, [config]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setConfig(form);
      toast.success('Paramètres mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des paramètres');
    }
  };

  const sections = [
    { id: 'general', label: 'Général', icon: Hotel },
    { id: 'contact', label: 'Contact & Localisation', icon: MapPin },
    { id: 'booking', label: 'Réservations & Paiement', icon: CreditCard },
    { id: 'smtp', label: 'Email (SMTP)', icon: Mail },
    { id: 'appearance', label: 'Apparence', icon: ImageIcon },
  ];

  const [activeSection, setActiveSection] = useState('general');
  const [uploading, setUploading] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(field);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setForm(prev => ({ ...prev, [field]: data.url }));
      toast.success('Image téléchargée avec succès');
    } catch (error) {
      toast.error('Erreur lors du téléchargement de l\'image');
    } finally {
      setUploading(null);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">
        {/* Sidebar Navigation */}
        <aside className="lg:w-72 shrink-0 space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl transition-all group",
                activeSection === section.id 
                  ? "bg-zinc-900 text-white shadow-xl" 
                  : "bg-white text-zinc-500 border border-zinc-200 hover:border-zinc-900/20"
              )}
            >
              <div className="flex items-center gap-3">
                <section.icon size={20} />
                <span className="font-bold text-sm">{section.label}</span>
              </div>
              {activeSection === section.id && <ChevronRight size={16} />}
            </button>
          ))}
          
          <div className="mt-10 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-3 text-emerald-600 mb-3">
              <ShieldCheck size={20} />
              <span className="font-bold text-sm">Sécurité</span>
            </div>
            <p className="text-xs text-emerald-600/80 leading-relaxed">
              Toutes vos modifications sont sauvegardées en temps réel dans la base de données sécurisée.
            </p>
          </div>
        </aside>

        {/* Form Content */}
        <div className="flex-1">
          <form onSubmit={handleSave} className="space-y-8 pb-20">
            {activeSection === 'general' && (
              <Card className="border-none shadow-sm">
                <CardHeader className="p-8 border-b border-zinc-100">
                  <CardTitle className="text-lg font-bold">Informations Générales</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nom de l'Hôtel</label>
                      <Input 
                        value={form.hotelName} 
                        onChange={(e) => setForm({ ...form, hotelName: e.target.value })} 
                        className="bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Slogan</label>
                      <Input 
                        value={form.tagline} 
                        onChange={(e) => setForm({ ...form, tagline: e.target.value })} 
                        className="bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Devise (Code)</label>
                      <Input 
                        value={form.currency} 
                        onChange={(e) => setForm({ ...form, currency: e.target.value })} 
                        className="bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                        placeholder="Ex: EUR, USD, XOF..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Symbole de la Devise</label>
                      <Input 
                        value={form.currencySymbol} 
                        onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })} 
                        className="bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                        placeholder="Ex: €, $, CFA..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">À propos</label>
                    <Textarea 
                      value={form.aboutText} 
                      onChange={(e) => setForm({ ...form, aboutText: e.target.value })} 
                      className="bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10 min-h-[150px]"
                    />
                  </div>

                  <div className="pt-6 border-t border-zinc-100">
                    <h4 className="text-sm font-bold text-zinc-900 mb-6">Textes de la Galerie</h4>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Titre de la Galerie</label>
                        <Input 
                          value={form.galleryTitle} 
                          onChange={(e) => setForm({ ...form, galleryTitle: e.target.value })} 
                          className="bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                          placeholder="Ex: Immersion dans l'élégance"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Description de la Galerie</label>
                        <Textarea 
                          value={form.galleryDescription} 
                          onChange={(e) => setForm({ ...form, galleryDescription: e.target.value })} 
                          className="bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10 min-h-[100px]"
                          placeholder="Ex: Découvrez chaque recoin de notre établissement..."
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'contact' && (
              <Card className="border-none shadow-sm">
                <CardHeader className="p-8 border-b border-zinc-100">
                  <CardTitle className="text-lg font-bold">Contact & Localisation</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <Input 
                          value={form.email} 
                          onChange={(e) => setForm({ ...form, email: e.target.value })} 
                          className="pl-12 bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Téléphone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <Input 
                          value={form.phone} 
                          onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                          className="pl-12 bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Adresse</label>
                      <Input 
                        value={form.address} 
                        onChange={(e) => setForm({ ...form, address: e.target.value })} 
                        className="bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Ville</label>
                      <Input 
                        value={form.city} 
                        onChange={(e) => setForm({ ...form, city: e.target.value })} 
                        className="bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'booking' && (
              <Card className="border-none shadow-sm">
                <CardHeader className="p-8 border-b border-zinc-100">
                  <CardTitle className="text-lg font-bold">Réservations & Paiement</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Heure de Check-in</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <Input 
                          value={form.checkInTime} 
                          onChange={(e) => setForm({ ...form, checkInTime: e.target.value })} 
                          className="pl-12 bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Heure de Check-out</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <Input 
                          value={form.checkOutTime} 
                          onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })} 
                          className="pl-12 bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Mode de Paiement</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, paymentMode: 'arrival' })}
                        className={cn(
                          "p-6 rounded-2xl border-2 transition-all text-left",
                          form.paymentMode === 'arrival' 
                            ? "border-zinc-900 bg-zinc-900 text-white shadow-xl" 
                            : "border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-200"
                        )}
                      >
                        <p className="font-bold mb-1">À l'arrivée</p>
                        <p className="text-xs opacity-60">Paiement sur place lors de l'enregistrement.</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, paymentMode: 'deposit' })}
                        className={cn(
                          "p-6 rounded-2xl border-2 transition-all text-left",
                          form.paymentMode === 'deposit' 
                            ? "border-zinc-900 bg-zinc-900 text-white shadow-xl" 
                            : "border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-200"
                        )}
                      >
                        <p className="font-bold mb-1">Acompte</p>
                        <p className="text-xs opacity-60">Paiement d'un pourcentage à la réservation.</p>
                      </button>
                    </div>
                  </div>

                  {form.paymentMode === 'deposit' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Pourcentage de l'acompte (%)</label>
                      <Input 
                        type="number"
                        value={form.depositPercentage || ''} 
                        onChange={(e) => setForm({ ...form, depositPercentage: parseInt(e.target.value) || 0 })} 
                        className="bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSection === 'smtp' && (
              <Card className="border-none shadow-sm">
                <CardHeader className="p-8 border-b border-zinc-100">
                  <CardTitle className="text-lg font-bold">Configuration Email (SMTP)</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Hôte SMTP</label>
                      <Input 
                        value={form.smtpHost} 
                        onChange={(e) => setForm({ ...form, smtpHost: e.target.value })} 
                        className="bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                        placeholder="Ex: smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Port SMTP</label>
                      <Input 
                        value={form.smtpPort} 
                        onChange={(e) => {
                          const port = e.target.value;
                          setForm({ 
                            ...form, 
                            smtpPort: port,
                            smtpSecure: port === '465'
                          });
                        }} 
                        className="bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                        placeholder="Ex: 587, 465"
                      />
                      <p className="text-[10px] text-zinc-400">Port 465 (SSL) ou 587 (STARTTLS)</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Utilisateur SMTP</label>
                      <Input 
                        value={form.smtpUser} 
                        onChange={(e) => setForm({ ...form, smtpUser: e.target.value })} 
                        className="bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                        placeholder="Ex: contact@votrehotel.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Mot de passe SMTP</label>
                      <Input 
                        type="password"
                        value={form.smtpPass} 
                        onChange={(e) => setForm({ ...form, smtpPass: e.target.value })} 
                        className="bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                        placeholder="••••••••"
                      />
                      <p className="text-[10px] text-zinc-400">Pour Gmail, utilisez un "Mot de passe d'application".</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Expéditeur (From)</label>
                      <Input 
                        value={form.smtpFrom} 
                        onChange={(e) => setForm({ ...form, smtpFrom: e.target.value })} 
                        className="bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                        placeholder='Ex: "Hôtel Sérénité" <noreply@serenite.com>'
                      />
                    </div>
                    <div className="flex flex-col gap-1 pt-6">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox"
                          id="smtpSecure"
                          checked={form.smtpSecure}
                          onChange={(e) => setForm({ ...form, smtpSecure: e.target.checked })}
                          className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                        />
                        <label htmlFor="smtpSecure" className="text-sm font-bold text-zinc-600">Connexion sécurisée (SSL/TLS)</label>
                      </div>
                      <p className="text-[10px] text-zinc-400 ml-7">Cochez uniquement pour le port 465. Laissez décoché pour le port 587.</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-zinc-100">
                    <h4 className="text-sm font-bold text-zinc-900 mb-4">Notifications de nouveaux messages</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                        <input 
                          type="checkbox"
                          id="notifyEmail"
                          checked={form.notifyNewMessageEmail}
                          onChange={(e) => setForm({ ...form, notifyNewMessageEmail: e.target.checked })}
                          className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                        />
                        <div>
                          <label htmlFor="notifyEmail" className="text-sm font-bold text-zinc-900">Notification par Email</label>
                          <p className="text-[10px] text-zinc-500">Recevoir un email à {form.email} pour chaque nouveau message.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                        <input 
                          type="checkbox"
                          id="notifyPhone"
                          checked={form.notifyNewMessagePhone}
                          onChange={(e) => setForm({ ...form, notifyNewMessagePhone: e.target.checked })}
                          className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                        />
                        <div className="flex-1">
                          <label htmlFor="notifyPhone" className="text-sm font-bold text-zinc-900">Notification Push</label>
                          <p className="text-[10px] text-zinc-500">Recevoir une notification sur cet appareil.</p>
                        </div>
                        <button
                          type="button"
                          onClick={subscribeToPush}
                          className="px-3 py-2 bg-zinc-900 text-white text-[10px] font-bold rounded-lg hover:bg-zinc-800 transition-all"
                        >
                          Activer sur cet appareil
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-zinc-100">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900">Message de Confirmation</h4>
                        <p className="text-[10px] text-zinc-400">Personnalisez l'email envoyé après une réservation.</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Contenu du Message</label>
                        <Textarea 
                          value={form.confirmationMessage} 
                          onChange={(e) => setForm({ ...form, confirmationMessage: e.target.value })} 
                          className="bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10 min-h-[150px]"
                          placeholder="Ex: Merci pour votre réservation ! Nous avons hâte de vous voir..."
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {['{{clientName}}', '{{checkIn}}', '{{checkOut}}', '{{id}}', '{{totalPrice}}', '{{currencySymbol}}', '{{hotelName}}', '{{addOns}}'].map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                const textarea = document.querySelector('textarea[placeholder*="Merci pour votre réservation"]') as HTMLTextAreaElement;
                                if (textarea) {
                                  const start = textarea.selectionStart;
                                  const end = textarea.selectionEnd;
                                  const text = form.confirmationMessage;
                                  const newText = text.substring(0, start) + tag + text.substring(end);
                                  setForm({ ...form, confirmationMessage: newText });
                                  setTimeout(() => {
                                    textarea.focus();
                                    textarea.setSelectionRange(start + tag.length, start + tag.length);
                                  }, 0);
                                }
                              }}
                              className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded text-[10px] font-mono transition-colors"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-zinc-400 italic mt-2">
                          Utilisez les tags ci-dessus pour insérer dynamiquement les informations de la réservation.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'appearance' && (
              <Card className="border-none shadow-sm">
                <CardHeader className="p-8 border-b border-zinc-100">
                  <CardTitle className="text-lg font-bold">Apparence</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Image de la Page d'Accueil</label>
                    <div className="relative group rounded-2xl overflow-hidden aspect-video bg-zinc-100">
                      <img 
                        src={form.heroImage} 
                        alt="Hero Preview" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                        {uploading === 'heroImage' ? (
                          <Loader2 className="animate-spin text-white" size={32} />
                        ) : (
                          <label className="px-6 py-3 bg-white text-zinc-900 rounded-xl font-bold text-sm shadow-xl cursor-pointer hover:bg-zinc-50 transition-colors">
                            Télécharger une image
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'heroImage')}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    <Input 
                      value={form.heroImage} 
                      onChange={(e) => setForm({ ...form, heroImage: e.target.value })} 
                      className="bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                      placeholder="URL de l'image..."
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Photo de l'Hôtel (Contact)</label>
                    <div className="relative group rounded-2xl overflow-hidden aspect-video bg-zinc-100">
                      <img 
                        src={form.hotelImage} 
                        alt="Hotel Preview" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {uploading === 'hotelImage' ? (
                          <Loader2 className="animate-spin text-white" size={32} />
                        ) : (
                          <label className="px-6 py-3 bg-white text-zinc-900 rounded-xl font-bold text-sm shadow-xl cursor-pointer hover:bg-zinc-50 transition-colors">
                            Télécharger une image
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'hotelImage')}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    <Input 
                      value={form.hotelImage} 
                      onChange={(e) => setForm({ ...form, hotelImage: e.target.value })} 
                      className="bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                      placeholder="URL de l'image de l'hôtel..."
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Photo de la Carte (Contact)</label>
                    <div className="relative group rounded-2xl overflow-hidden aspect-video bg-zinc-100">
                      <img 
                        src={form.mapImage} 
                        alt="Map Preview" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {uploading === 'mapImage' ? (
                          <Loader2 className="animate-spin text-white" size={32} />
                        ) : (
                          <label className="px-6 py-3 bg-white text-zinc-900 rounded-xl font-bold text-sm shadow-xl cursor-pointer hover:bg-zinc-50 transition-colors">
                            Télécharger une image
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, 'mapImage')}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    <Input 
                      value={form.mapImage} 
                      onChange={(e) => setForm({ ...form, mapImage: e.target.value })} 
                      className="bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900/10"
                      placeholder="URL de l'image de la carte..."
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sticky Save Button */}
            <div className="fixed bottom-10 right-10 z-20">
              <button 
                type="submit"
                className="flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold shadow-2xl hover:bg-zinc-800 hover:scale-105 transition-all active:scale-95"
              >
                <Save size={20} />
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsManager;
