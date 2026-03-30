import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useHotel } from '@/Hotelcontext';
import { 
  Mail, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Search,
  User,
  Phone,
  Calendar,
  ChevronRight,
  MessageSquare,
  Trash
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const MessagesManager = () => {
  const { messages, deleteMessage, markMessageAsRead } = useHotel();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const filteredMessages = messages.filter(msg => 
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = messages.filter(m => !m.isRead).length;

  const handleMarkAsRead = (id: string) => {
    markMessageAsRead(id);
    if (selectedMessage?.id === id) {
      setSelectedMessage({ ...selectedMessage, isRead: true });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      deleteMessage(id);
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-zinc-900">Messages</h2>
            <p className="text-zinc-500 mt-1">{unreadCount} message(s) non lu(s)</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <Input 
              placeholder="Rechercher un message..." 
              className="pl-10 h-12 border-zinc-200 focus:ring-zinc-900/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-280px)]">
          {/* Messages List */}
          <Card className="lg:col-span-1 border-none shadow-sm flex flex-col overflow-hidden">
            <CardHeader className="p-6 border-b border-zinc-100">
              <CardTitle className="text-lg font-bold">Boîte de réception</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              <div className="divide-y divide-zinc-100">
                {filteredMessages.length === 0 ? (
                  <div className="p-10 text-center">
                    <Mail className="mx-auto text-zinc-200 mb-4" size={48} />
                    <p className="text-zinc-500 font-medium">Aucun message trouvé</p>
                  </div>
                ) : (
                  filteredMessages.map((msg) => (
                    <div 
                      key={msg.id}
                      onClick={() => {
                        setSelectedMessage(msg);
                        if (!msg.isRead) handleMarkAsRead(msg.id);
                      }}
                      className={cn(
                        "p-6 cursor-pointer transition-all hover:bg-zinc-50 relative group",
                        selectedMessage?.id === msg.id ? "bg-zinc-50 border-l-4 border-zinc-900" : "border-l-4 border-transparent",
                        !msg.isRead && "bg-zinc-50/50"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {!msg.isRead && <div className="w-2 h-2 bg-zinc-900 rounded-full" />}
                          <p className={cn("font-bold text-sm", !msg.isRead ? "text-zinc-900" : "text-zinc-600")}>
                            {msg.name}
                          </p>
                        </div>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                          {new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <p className={cn("text-xs font-bold mb-1 truncate", !msg.isRead ? "text-zinc-900" : "text-zinc-500")}>
                        {msg.subject}
                      </p>
                      <p className="text-xs text-zinc-400 line-clamp-2">
                        {msg.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message Content */}
          <Card className="lg:col-span-2 border-none shadow-sm flex flex-col overflow-hidden">
            {selectedMessage ? (
              <>
                <CardHeader className="p-8 border-b border-zinc-100 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 font-bold text-lg">
                      {selectedMessage.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900">{selectedMessage.name}</h3>
                      <p className="text-sm text-zinc-500">{selectedMessage.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 flex-1 overflow-y-auto">
                  <div className="mb-8">
                    <div className="flex items-center gap-4 text-xs text-zinc-400 uppercase font-bold tracking-widest mb-4">
                      <span>Sujet: {selectedMessage.subject}</span>
                      <span>•</span>
                      <span>Reçu le {new Date(selectedMessage.createdAt).toLocaleString('fr-FR')}</span>
                    </div>
                    {selectedMessage.phone && (
                      <div className="flex items-center gap-2 text-sm text-zinc-600 mb-6">
                        <Phone size={14} />
                        <span>{selectedMessage.phone}</span>
                      </div>
                    )}
                    <div className="prose prose-zinc max-w-none">
                      <p className="text-zinc-800 leading-relaxed whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-zinc-100">
                    <h4 className="text-sm font-bold text-zinc-900 mb-4">Répondre au client</h4>
                    <div className="flex gap-4">
                      <a 
                        href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                        className="flex-1 bg-zinc-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                      >
                        <Mail size={18} />
                        Répondre par Email
                      </a>
                      {selectedMessage.phone && (
                        <a 
                          href={`tel:${selectedMessage.phone}`}
                          className="flex-1 border border-zinc-200 text-zinc-900 py-4 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Phone size={18} />
                          Appeler le client
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200 mb-6">
                  <MessageSquare size={40} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Sélectionnez un message</h3>
                <p className="text-zinc-500 max-w-xs">
                  Choisissez un message dans la liste pour lire son contenu et répondre au client.
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MessagesManager;
