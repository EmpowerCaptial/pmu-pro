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
      <div className="sticky top-0 z-10 px-4 py-4 flex items-center gap-3 border-b border-beige bg-white/95 backdrop-blur shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/features')}
          className="shrink-0 rounded-xl p-2 border border-lavender/20 hover:bg-lavender/10"
        >
          <ArrowLeft className="h-5 w-5 text-lavender" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-ink tracking-tight">Client Management</h1>
          <p className="text-sm text-muted-text">{clients.length} clients</p>
        </div>
        <Button
          onClick={onAddClient}
          className="shrink-0 rounded-xl bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search clients by name, phone, or email"
            className="w-full h-12 rounded-2xl pl-11 pr-4 text-sm bg-white/80 border border-lavender/20 placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-lavender/60 focus:border-lavender/40 shadow-sm"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text">
            <Search className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-4 gap-3">
          <Card className="border-lavender/20 bg-gradient-to-r from-purple-50 to-lavender/10">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-purple-600">
                {clients.filter(c => getClientStatus(c).status === 'recent').length}
              </div>
              <div className="text-xs text-muted-text">Recent</div>
            </CardContent>
          </Card>
          <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-teal-600">
                {clients.filter(c => getClientStatus(c).status === 'active').length}
              </div>
              <div className="text-xs text-muted-text">Active</div>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-orange-600">
                {clients.filter(c => getClientStatus(c).status === 'new').length}
              </div>
              <div className="text-xs text-muted-text">New</div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-gray-600">
                {clients.filter(c => getClientStatus(c).status === 'inactive').length}
              </div>
              <div className="text-xs text-muted-text">Inactive</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Client List */}
      <div className="divide-y divide-lavender/10">
        {groups.map(({ letter, people }) => (
          <section key={letter} className="">
            <div className="px-4 py-2 text-xs font-medium tracking-widest uppercase text-lavender sticky top-[140px] backdrop-blur bg-white/90 border-l-4 border-lavender/30">
              {letter}
            </div>
            <ul className="">
              {people.map((client) => {
                const clientStatus = getClientStatus(client);
                return (
                  <li 
                    key={client.id} 
                    className="px-4 py-4 flex items-center gap-4 hover:bg-lavender/5 border-l-4 border-transparent hover:border-lavender/30 transition-all duration-200 cursor-pointer"
                    onClick={() => onClientSelect?.(client)}
                  >
                    {/* Avatar with FITZ */}
                    <div className="flex flex-col items-center">
                      {client.avatarUrl ? (
                        <img
                          src={client.avatarUrl}
                          alt=""
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-lavender/20"
                          draggable={false}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full grid place-items-center ring-2 ring-lavender/20 bg-gradient-to-br from-lavender/30 via-teal-400/30 to-lavender/20">
                          <span className="text-sm font-semibold text-white">
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
                        <Badge className={`text-xs px-2 py-1 ${clientStatus.color} text-white`}>
                          {clientStatus.label}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1 text-xs text-muted-text">
                        {client.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </span>
                        )}
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </span>
                        )}
                      </div>
                      {client.lastProcedure && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-text">
                          <Clock className="h-3 w-3" />
                          Last procedure: {new Date(client.lastProcedure.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Action Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-600 hover:text-gray-900 bg-gray-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onClientSelect?.(client);
                        }}>
                          <Eye className="mr-2 h-4 w-4 text-lavender" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onEditClient?.(client);
                        }}>
                          <Edit className="mr-2 h-4 w-4 text-teal-500" />
                          <span>Edit Client</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onBookAppointment?.(client);
                        }}>
                          <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                          <span>Book Appointment</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onSendMessage?.(client);
                        }}>
                          <MessageSquare className="mr-2 h-4 w-4 text-purple-500" />
                          <span>Send Message</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClient?.(client);
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
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
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="w-16 h-16 rounded-full bg-lavender/10 flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-lavender" />
          </div>
          <h3 className="text-lg font-medium text-ink mb-2">No clients found</h3>
          <p className="text-muted-text text-center mb-4">
            {q ? "Try adjusting your search terms" : "Get started by adding your first client"}
          </p>
          {!q && onAddClient && (
            <Button 
              onClick={onAddClient}
              className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600"
            >
              <Plus className="h-4 w-4 mr-2" />
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
