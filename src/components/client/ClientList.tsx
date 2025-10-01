"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Phone, 
  Calendar, 
  MessageSquare, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
  Search,
  ArrowLeft,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  Star,
  MoreHorizontal
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

// Enhanced Client type with PMU-specific data
export type Client = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatarUrl?: string | null;
  // PMU-specific fields
  dateOfBirth?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  allergies?: string;
  skinType?: string;
  notes?: string;
  createdAt: string;
  lastProcedure?: any;
  lastAnalysis?: any;
};

interface ClientListProps {
  clients: Client[];
  onClientSelect?: (client: Client) => void;
  onAddClient?: () => void;
  onEditClient?: (client: Client) => void;
  onDeleteClient?: (client: Client) => void;
  onSendMessage?: (client: Client, messageType?: string, message?: string) => void;
  onBookAppointment?: (client: Client) => void;
}

export default function ClientList({ 
  clients, 
  onClientSelect,
  onAddClient,
  onEditClient,
  onDeleteClient,
  onSendMessage,
  onBookAppointment
}: ClientListProps) {
  const router = useRouter();
  const [q, setQ] = React.useState("");

  // Filter clients by name/phone/email (client-side only)
  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((c) =>
      [c.name, c.phone, c.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [q, clients]);

  // Group by first letter of display name
  const groups = React.useMemo(() => {
    const map = new Map<string, Client[]>();
    for (const c of filtered) {
      const key = (c.name?.[0] || "#").toUpperCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([letter, people]) => ({
        letter,
        people: people.sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [filtered]);

  const getClientStatus = (client: Client) => {
    if (client.lastProcedure) {
      const procedureDate = new Date(client.lastProcedure.createdAt);
      const daysSince = Math.floor((Date.now() - procedureDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSince < 30) return { status: 'recent', label: 'Recent Client', color: 'bg-green-500' };
      if (daysSince < 90) return { status: 'active', label: 'Active', color: 'bg-blue-500' };
      return { status: 'inactive', label: 'Inactive', color: 'bg-gray-500' };
    }
    return { status: 'new', label: 'New Client', color: 'bg-purple-500' };
  };

  const getSkinTypeColor = (skinType?: string) => {
    switch (skinType?.toLowerCase()) {
      case 'type 1': return 'bg-red-100 text-red-800';
      case 'type 2': return 'bg-orange-100 text-orange-800';
      case 'type 3': return 'bg-yellow-100 text-yellow-800';
      case 'type 4': return 'bg-green-100 text-green-800';
      case 'type 5': return 'bg-blue-100 text-blue-800';
      case 'type 6': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-screen bg-gradient-to-br from-ivory via-white to-beige">
      {/* Header */}
      <div className="sticky top-0 z-10 px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 border-b border-beige bg-white/95 backdrop-blur shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/features')}
          className="shrink-0 rounded-xl p-2 border border-lavender/20 hover:bg-lavender/10"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-lavender" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold text-ink tracking-tight truncate">Client Management</h1>
          <p className="text-xs sm:text-sm text-muted-text">{clients.length} clients</p>
        </div>
        <Button
          onClick={onAddClient}
          className="shrink-0 rounded-xl bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white shadow-lg text-xs sm:text-sm px-2 sm:px-4"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Add Client</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 sm:p-4">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search clients by name, phone, or email"
            className="w-full h-10 sm:h-12 rounded-2xl pl-10 sm:pl-11 pr-3 sm:pr-4 text-xs sm:text-sm bg-white/80 border border-lavender/20 placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-lavender/60 focus:border-lavender/40 shadow-sm"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text">
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </div>


      {/* Client List */}
      <div className="divide-y divide-lavender/10">
        {groups.map(({ letter, people }) => (
          <section key={letter} className="">
            <div className="px-3 sm:px-4 py-2 text-xs font-medium tracking-widest uppercase text-lavender sticky top-[120px] sm:top-[140px] backdrop-blur bg-white/90 border-l-4 border-lavender/30">
              {letter}
            </div>
            <ul className="">
              {people.map((client) => {
                const clientStatus = getClientStatus(client);
                return (
                  <li 
                    key={client.id} 
                    className="px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 hover:bg-lavender/5 border-l-4 border-transparent hover:border-lavender/30 transition-all duration-200 cursor-pointer"
                    onClick={() => onClientSelect?.(client)}
                  >
                    {/* Avatar with FITZ */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      {client.avatarUrl ? (
                        <img
                          src={client.avatarUrl}
                          alt=""
                          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover ring-2 ring-lavender/20"
                          draggable={false}
                        />
                      ) : (
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full grid place-items-center ring-2 ring-lavender/20 bg-gradient-to-br from-lavender/30 via-teal-400/30 to-lavender/20">
                          <span className="text-xs font-semibold text-white">
                            {initials(client.name)}
                          </span>
                        </div>
                      )}
                      {/* FITZ abbreviation under avatar */}
                      {client.skinType && (
                        <div className="mt-1">
                          <Badge className={`text-xs px-1 py-0.5 ${getSkinTypeColor(client.skinType)}`}>
                            FITZ {client.skinType.replace(/[^\d]/g, '')}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Client Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-ink truncate">{client.name}</p>
                        <Badge className={`text-xs px-1.5 py-0.5 ${clientStatus.color} text-white`}>
                          {clientStatus.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-text">
                        {client.email && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </span>
                        )}
                        {client.phone && (
                          <span className="flex items-center gap-1 truncate">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{client.phone}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-gray-100 text-gray-600 hover:text-gray-900 bg-gray-50 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 sm:w-48 bg-white border border-gray-200 shadow-lg">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onClientSelect?.(client);
                        }} className="text-xs sm:text-sm">
                          <Eye className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-lavender" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onEditClient?.(client);
                        }} className="text-xs sm:text-sm">
                          <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-teal-500" />
                          <span>Edit Client</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onBookAppointment?.(client);
                        }} className="text-xs sm:text-sm">
                          <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                          <span>Book Appointment</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onSendMessage?.(client);
                        }} className="text-xs sm:text-sm">
                          <MessageSquare className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                          <span>Send Message</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClient?.(client);
                          }}
                          className="text-red-600 focus:text-red-600 text-xs sm:text-sm"
                        >
                          <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-lavender/10 flex items-center justify-center mb-3 sm:mb-4">
            <User className="h-6 w-6 sm:h-8 sm:w-8 text-lavender" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-ink mb-2">No clients found</h3>
          <p className="text-sm sm:text-base text-muted-text text-center mb-4 max-w-sm">
            {q ? "Try adjusting your search terms" : "Get started by adding your first client"}
          </p>
          {!q && onAddClient && (
            <Button 
              onClick={onAddClient}
              className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-sm sm:text-base"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Add Your First Client
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to get initials
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}
