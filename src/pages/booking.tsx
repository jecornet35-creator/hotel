import React, { useState } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Users, Check, ArrowLeft, Moon, CreditCard, MessageSquare, Phone, Mail, User, Tag } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useHotel } from '@/Hotelcontext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { toast, Toaster } from 'sonner';

import { calculateNights, isBookingDateValid } from '@/lib/hotelUtils';

type Step = 1 | 2 | 3;

const stepLabels = [
  { num: 1, label: 'Détails du séjour' },
  { num: 2, label: 'Services additionnels' },
  { num: 3, label: 'Informations & Paiement' },
];

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preselectedRoom = searchParams.get('room');
  const state = location.state as { checkIn?: Date; checkOut?: Date; guests?: number } | null;
  const { rooms, addOnServices, formatPrice, config, addReservation } = useHotel();

  const [step, setStep] = useState<Step>(1);
  const [checkIn, setCheckIn] = useState<Date | undefined>(state?.checkIn ? new Date(state.checkIn) : undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(state?.checkOut ? new Date(state.checkOut) : undefined);
  const [guests, setGuests] = useState(state?.guests || 2);
  const [selectedRoom, setSelectedRoom] = useState(preselectedRoom || '');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', promoCode: '', specialRequests: '' });
  const [confirmed, setConfirmed] = useState(false);

  const availableRooms = rooms.filter((r) => r.available && r.capacity >= guests);
  const chosen = rooms.find((r) => r.id === selectedRoom);
  const nights = calculateNights(checkIn, checkOut);
  const roomTotal = (Number(chosen?.price) || 0) * nights;
  const addOnsTotal = selectedAddOns.reduce((sum, id) => {
    const svc = addOnServices.find(s => s.id === id);
    return sum + (Number(svc?.price) || 0);
  }, 0);
  const grandTotal = roomTotal + addOnsTotal;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const canContinueStep1 = isBookingDateValid(checkIn, checkOut) && selectedRoom && guests > 0 && (chosen ? chosen.capacity >= guests : true);

  const validateForm = () => {
    if (!form.firstName.trim()) return "Le prénom est obligatoire";
    if (!form.lastName.trim()) return "Le nom est obligatoire";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Un email valide est obligatoire";
    if (!form.phone.trim()) return "Le téléphone est obligatoire";
    return null;
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dateError = !isBookingDateValid(checkIn, checkOut);
    if (dateError) {
      toast.error("Les dates de séjour ne sont pas valides");
      return;
    }

    if (!selectedRoom) {
      toast.error("Veuillez sélectionner une chambre");
      return;
    }

    if (guests <= 0) {
      toast.error("Le nombre d'invités doit être supérieur à 0");
      return;
    }

    if (chosen && guests > chosen.capacity) {
      toast.error(`La capacité maximale de cette chambre est de ${chosen.capacity} personnes`);
      return;
    }

    const formError = validateForm();
    if (formError) {
      toast.error(formError);
      return;
    }

    if (!checkIn || !checkOut || !selectedRoom) return;

    const reservationData = {
      id: Math.random().toString(36).substring(2, 9),
      roomId: selectedRoom,
      clientId: form.email,
      clientInfo: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone
      },
      checkIn: format(checkIn, 'yyyy-MM-dd'),
      checkOut: format(checkOut, 'yyyy-MM-dd'),
      guests: guests,
      totalPrice: grandTotal,
      status: 'pending' as const,
      addOns: selectedAddOns,
      specialRequests: form.specialRequests
    };

    try {
      await addReservation(reservationData);
      setConfirmed(true);
      toast.success('Réservation confirmée !');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la réservation');
    }
  };

  if (confirmed) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <Toaster position="top-center" />
        <main className="pt-16">
          <section className="py-24 px-6">
            <Card className="max-w-lg mx-auto text-center">
              <CardContent className="p-12">
                <div className="w-16 h-16 rounded-full bg-zinc-900/10 flex items-center justify-center mx-auto mb-6">
                  <Check className="h-8 w-8 text-zinc-900" />
                </div>
                <h2 className="font-serif text-2xl mb-4">Réservation Confirmée</h2>
                <p className="text-zinc-500 mb-2">{chosen?.name}</p>
                {checkIn && checkOut && (
                  <p className="text-sm text-zinc-500">
                    {format(checkIn, 'dd MMM', { locale: fr })} — {format(checkOut, 'dd MMM yyyy', { locale: fr })} · {nights} nuit{nights > 1 ? 's' : ''}
                  </p>
                )}
                <p className="font-serif text-2xl mt-4 text-zinc-900">{formatPrice(grandTotal)}</p>
                <Button className="mt-6" onClick={() => navigate('/')}>Retour à l'accueil</Button>
              </CardContent>
            </Card>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <Toaster position="top-center" />
      <main className="pt-16">
        <div className="bg-zinc-900 text-white py-8 px-6">
          <div className="max-w-6xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white mb-2 text-sm">
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>
            <p className="text-xs tracking-[0.3em] uppercase text-white/70">Réservation</p>
            <h1 className="font-serif text-3xl md:text-4xl font-light italic">Finaliser Votre Réservation</h1>
          </div>

          <div className="max-w-6xl mx-auto mt-6">
            <div className="flex items-center justify-between">
              {stepLabels.map((s, i) => (
                <div key={s.num} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                      step > s.num ? "bg-white text-zinc-900" :
                      step === s.num ? "bg-white text-zinc-900" :
                      "border border-white/40 text-white/60"
                    )}>
                      {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                    </div>
                    <span className={cn(
                      "text-sm whitespace-nowrap hidden md:block",
                      step >= s.num ? "text-white" : "text-white/50"
                    )}>{s.label}</span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div className={cn("flex-1 h-0.5 mx-4", step > s.num ? "bg-white" : "bg-white/30")} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              {step === 1 && (
                <Card>
                  <CardContent className="p-8">
                    <h2 className="font-serif text-2xl mb-6 italic">Choisissez Votre Séjour</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div>
                        <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1 flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> Check In</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start", !checkIn && "text-zinc-400")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {checkIn ? format(checkIn, 'dd-MM-yyyy') : 'jj-mm-aaaa'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} disabled={(date) => date < today} initialFocus className="p-3 pointer-events-auto" />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1 flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> Check Out</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start", !checkOut && "text-zinc-400")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {checkOut ? format(checkOut, 'dd-MM-yyyy') : 'jj-mm-aaaa'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} disabled={(date) => date <= (checkIn || today)} initialFocus className="p-3 pointer-events-auto" />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1 flex items-center gap-1"><Users className="h-3 w-3" /> Invités</label>
                        <Input type="number" min={1} max={10} value={guests || ''} onChange={(e) => setGuests(Number(e.target.value) || 0)} />
                      </div>
                    </div>

                    <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-4">Choisissez votre chambre</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableRooms.map((room) => (
                        <button key={room.id} onClick={() => setSelectedRoom(room.id)} className={cn(
                          "text-left rounded-lg border-2 transition-all overflow-hidden",
                          selectedRoom === room.id ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200 hover:border-zinc-900/50"
                        )}>
                          <div className="relative">
                            <img src={room.images[0]} alt={room.name} className="w-full h-40 object-cover" loading="lazy" />
                            {selectedRoom === room.id && (
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center">
                                  <Check className="h-5 w-5 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <p className="font-serif text-lg font-bold">{room.name}</p>
                            <p className="text-sm text-zinc-500">
                              <Users className="inline h-3 w-3 mr-1" />{room.capacity}
                              <span className="mx-2">·</span>{room.size}m²
                              <span className="mx-2">·</span>{room.bedType}
                            </p>
                            <p className="font-serif text-lg mt-2 text-zinc-900 font-bold">{formatPrice(room.price)}<span className="text-sm text-zinc-500 font-sans font-normal"> /nuit</span></p>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-8 flex justify-center">
                      <Button onClick={() => setStep(2)} disabled={!canContinueStep1} className="w-full sm:w-auto px-12 tracking-wider uppercase text-xs">
                        Continuer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 2 && (
                <Card>
                  <CardContent className="p-8">
                    <h2 className="font-serif text-2xl mb-2 italic">Améliorez Votre Séjour</h2>
                    <p className="text-zinc-500 text-sm mb-6">Ajoutez des services pour rendre votre séjour inoubliable (optionnel)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addOnServices.map((svc) => (
                        <div key={svc.id} onClick={() => toggleAddOn(svc.id)} className={cn(
                          "text-left p-4 rounded-lg border transition-all cursor-pointer",
                          selectedAddOns.includes(svc.id) ? "border-zinc-900 bg-zinc-900/5" : "border-zinc-200 hover:border-zinc-900/50"
                        )}>
                          <div className="flex items-start gap-3">
                            <Checkbox checked={selectedAddOns.includes(svc.id)} className="mt-1" />
                            <div>
                              <p className="font-medium">{svc.name}</p>
                              <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{svc.description}</p>
                              <p className="text-zinc-900 font-bold mt-2">{formatPrice(svc.price)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-between">
                      <Button variant="outline" onClick={() => setStep(1)} className="w-full sm:w-auto tracking-wider uppercase text-xs">Retour</Button>
                      <Button onClick={() => setStep(3)} className="w-full sm:w-auto px-12 tracking-wider uppercase text-xs">Continuer</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card>
                  <CardContent className="p-8">
                    <h2 className="font-serif text-2xl mb-6 italic">Informations Client</h2>
                    <form onSubmit={handleConfirm} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1 flex items-center gap-1"><User className="h-3 w-3" /> Prénom</label>
                          <Input placeholder="Votre prénom" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1 flex items-center gap-1"><User className="h-3 w-3" /> Nom</label>
                          <Input placeholder="Votre nom" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1 flex items-center gap-1"><Mail className="h-3 w-3" /> Email</label>
                          <Input type="email" placeholder="votre@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1 flex items-center gap-1"><Phone className="h-3 w-3" /> Téléphone</label>
                          <Input type="tel" placeholder="+33 6 12 34 56 78" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                        </div>
                        <div>
                          <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1 flex items-center gap-1"><Tag className="h-3 w-3" /> Code Promo</label>
                          <Input placeholder="Optionnel" value={form.promoCode} onChange={(e) => setForm({ ...form, promoCode: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1 flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Demandes Spéciales</label>
                        <Textarea placeholder="Allergies, célébrations, heure d'arrivée..." value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} rows={4} />
                      </div>
                      <div className="bg-zinc-100 rounded-lg p-4 flex items-start gap-3 mt-6">
                        <CreditCard className="h-5 w-5 text-zinc-400 mt-0.5" />
                        <div>
                          <p className="font-medium">Paiement</p>
                          <p className="text-sm text-zinc-500">
                            {config.paymentMode === 'arrival'
                              ? "Le paiement sera effectué à l'arrivée. Aucune carte de crédit requise pour la réservation."
                              : `Un acompte de ${config.depositPercentage}% (${formatPrice(Math.round(grandTotal * config.depositPercentage / 100))}) est requis à la réservation. Le solde sera réglé à l'arrivée.`}
                          </p>
                        </div>
                      </div>

                      {config.paymentMode === 'deposit' && (config.stripe.enabled || config.paypal.enabled) && (
                        <div className="bg-zinc-50 rounded-lg p-4 space-y-3 mt-4">
                          <p className="text-sm font-medium">Payer l'acompte de {formatPrice(Math.round(grandTotal * config.depositPercentage / 100))}</p>
                          <div className="flex flex-wrap gap-3">
                            {config.stripe.enabled && (
                              <Button type="button" variant="outline" className="flex items-center gap-2" onClick={() => toast.info('Redirection vers Stripe... (à connecter avec votre backend)')}>
                                <CreditCard className="h-4 w-4" /> Payer par carte (Stripe)
                              </Button>
                            )}
                            {config.paypal.enabled && (
                              <Button type="button" variant="outline" className="flex items-center gap-2" onClick={() => toast.info('Redirection vers PayPal... (à connecter avec votre backend)')}>
                                <CreditCard className="h-4 w-4" /> PayPal
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between mt-6">
                        <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-full sm:w-auto tracking-wider uppercase text-xs">Retour</Button>
                        <Button type="submit" className="w-full sm:w-auto px-6 sm:px-12 tracking-wider uppercase text-xs">
                          <Check className="mr-2 h-4 w-4" /> Confirmer la Réservation
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:w-80 shrink-0">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl font-semibold mb-4 italic">Récapitulatif</h3>
                  {chosen ? (
                    <>
                      <img src={chosen.images[0]} alt={chosen.name} className="w-full h-40 object-cover rounded-lg mb-4" loading="lazy" />
                      <p className="font-serif text-lg mb-4 font-bold">{chosen.name}</p>
                    </>
                  ) : (
                    <div className="w-full h-40 bg-zinc-100 rounded-lg mb-4 flex items-center justify-center text-zinc-400 text-sm">Aucune chambre sélectionnée</div>
                  )}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-zinc-500"><CalendarIcon className="h-4 w-4" /> Check In</span>
                      <span className="font-medium">{checkIn ? format(checkIn, 'dd MMM yyyy', { locale: fr }) : '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-zinc-500"><CalendarIcon className="h-4 w-4" /> Check Out</span>
                      <span className="font-medium">{checkOut ? format(checkOut, 'dd MMM yyyy', { locale: fr }) : '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-zinc-500"><Users className="h-4 w-4" /> Invités</span>
                      <span className="font-medium">{guests}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-zinc-500"><Moon className="h-4 w-4" /> Nuits</span>
                      <span className="font-medium">{nights}</span>
                    </div>
                  </div>
                  <div className="border-t border-zinc-200 mt-4 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">{formatPrice(chosen?.price || 0)} × {nights} nuit{nights > 1 ? 's' : ''}</span>
                      <span>{formatPrice(roomTotal)}</span>
                    </div>
                    {selectedAddOns.map(id => {
                      const svc = addOnServices.find(s => s.id === id);
                      return svc ? (
                        <div key={id} className="flex justify-between">
                          <span className="text-zinc-500 text-xs">{svc.name}</span>
                          <span className="text-xs">{formatPrice(svc.price)}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                  <div className="border-t border-zinc-200 mt-4 pt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-serif text-lg font-bold">Total</span>
                      <span className="font-serif text-2xl text-zinc-900 font-bold">{formatPrice(grandTotal)}</span>
                    </div>
                    {config.paymentMode === 'deposit' && grandTotal > 0 && (
                      <div className="flex justify-between items-center text-sm bg-zinc-100 rounded-md px-3 py-2">
                        <span className="text-zinc-500">Acompte ({config.depositPercentage}%)</span>
                        <span className="font-semibold text-zinc-900">{formatPrice(Math.round(grandTotal * config.depositPercentage / 100))}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;
