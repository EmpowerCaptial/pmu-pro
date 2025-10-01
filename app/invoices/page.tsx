'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import { SubscriptionGate } from '@/components/auth/subscription-gate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Save, 
  Send, 
  FileText, 
  Calendar,
  DollarSign,
  User,
  Package,
  ShoppingCart,
  Wrench
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface InvoiceItem {
  id?: string;
  type: 'service' | 'product' | 'package' | 'custom';
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PaymentSchedule {
  type: 'full' | 'installments';
  installments?: number;
  amount?: number;
}

export default function InvoicesPage() {
  const router = useRouter();
  const { currentUser, isLoading: authLoading, isAuthenticated } = useDemoAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);

  // Invoice form state
  const [invoice, setInvoice] = useState({
    title: '',
    providerName: currentUser?.name || '',
    memo: '',
    clientId: '',
    taxRate: 0,
    dueDate: '',
    paymentSchedule: { type: 'full' as 'full' | 'installments', installments: 2 }
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (currentUser?.email) {
      loadData();
    }
  }, [currentUser?.email]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsRes, servicesRes, productsRes] = await Promise.all([
        fetch('/api/clients', {
          headers: { 'x-user-email': currentUser!.email }
        }),
        fetch('/api/services', {
          headers: { 'x-user-email': currentUser!.email }
        }),
        fetch('/api/products', {
          headers: { 'x-user-email': currentUser!.email }
        })
      ]);

      const [clientsData, servicesData, productsData] = await Promise.all([
        clientsRes.json(),
        servicesRes.json(),
        productsRes.json()
      ]);

      setClients(clientsData.clients || []);
      setServices(servicesData.services || []);
      setProducts(productsData.products || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (type: 'service' | 'product' | 'package' | 'custom', item?: any) => {
    const newItem: InvoiceItem = {
      type,
      name: item?.name || '',
      description: item?.description || '',
      quantity: 1,
      unitPrice: item?.price || 0,
      total: item?.price || 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * (invoice.taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const createNewClient = async () => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser!.email
        },
        body: JSON.stringify(newClient)
      });

      if (response.ok) {
        const client = await response.json();
        setClients([...clients, client.client]);
        setInvoice({ ...invoice, clientId: client.client.id });
        setIsNewClientOpen(false);
        setNewClient({ name: '', email: '', phone: '' });
      }
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const saveInvoice = async () => {
    try {
      const { subtotal, taxAmount, total } = calculateTotals();
      
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser!.email
        },
        body: JSON.stringify({
          ...invoice,
          items,
          subtotal,
          taxAmount,
          total
        })
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/invoices/${result.invoice.id}`);
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ivory via-white to-beige">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender mx-auto mb-4"></div>
          <p className="text-muted-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ivory via-white to-beige">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-text">Please log in to access invoices.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SubscriptionGate>
      <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-beige pb-20 sm:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Invoice</h1>
              <p className="text-gray-600">Create and manage invoices for your clients</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={saveInvoice}>
                <Save className="h-4 w-4 mr-2" />
                Save Invoice
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Invoice Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Invoice Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Invoice Title</Label>
                      <Input
                        id="title"
                        value={invoice.title}
                        onChange={(e) => setInvoice({ ...invoice, title: e.target.value })}
                        placeholder="e.g., PMU Services Invoice"
                      />
                    </div>
                    <div>
                      <Label htmlFor="providerName">Provider Name</Label>
                      <Input
                        id="providerName"
                        value={invoice.providerName}
                        onChange={(e) => setInvoice({ ...invoice, providerName: e.target.value })}
                        placeholder="Your business name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="memo">Memo/Notes</Label>
                    <Textarea
                      id="memo"
                      value={invoice.memo}
                      onChange={(e) => setInvoice({ ...invoice, memo: e.target.value })}
                      placeholder="Additional notes or terms..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        value={invoice.taxRate}
                        onChange={(e) => setInvoice({ ...invoice, taxRate: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={invoice.dueDate}
                        onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Client Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Client Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="client">Select Client</Label>
                    <div className="flex gap-2">
                      <Select value={invoice.clientId} onValueChange={(value) => setInvoice({ ...invoice, clientId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name} {client.email && `(${client.email})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            New Client
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Client</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="clientName">Name</Label>
                              <Input
                                id="clientName"
                                value={newClient.name}
                                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                placeholder="Client name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="clientEmail">Email</Label>
                              <Input
                                id="clientEmail"
                                type="email"
                                value={newClient.email}
                                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                placeholder="client@example.com"
                              />
                            </div>
                            <div>
                              <Label htmlFor="clientPhone">Phone</Label>
                              <Input
                                id="clientPhone"
                                value={newClient.phone}
                                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                placeholder="(555) 123-4567"
                              />
                            </div>
                            <Button onClick={createNewClient} className="w-full">
                              Create Client
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Line Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Line Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Item Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addItem('service')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Service
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addItem('product')}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addItem('custom')}
                    >
                      <Wrench className="h-4 w-4 mr-2" />
                      Custom Charge
                    </Button>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{item.type}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Name</Label>
                            {item.type === 'service' ? (
                              <Select
                                value={item.name}
                                onValueChange={(value) => {
                                  const service = services.find(s => s.name === value);
                                  updateItem(index, 'name', value);
                                  if (service) {
                                    updateItem(index, 'unitPrice', service.price);
                                    updateItem(index, 'description', service.description || '');
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select service" />
                                </SelectTrigger>
                                <SelectContent>
                                  {services.map((service) => (
                                    <SelectItem key={service.id} value={service.name}>
                                      {service.name} - ${service.price}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : item.type === 'product' ? (
                              <Select
                                value={item.name}
                                onValueChange={(value) => {
                                  const product = products.find(p => p.name === value);
                                  updateItem(index, 'name', value);
                                  if (product) {
                                    updateItem(index, 'unitPrice', product.price);
                                    updateItem(index, 'description', product.description || '');
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map((product) => (
                                    <SelectItem key={product.id} value={product.name}>
                                      {product.name} - ${product.price}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                value={item.name}
                                onChange={(e) => updateItem(index, 'name', e.target.value)}
                                placeholder="Item name"
                              />
                            )}
                          </div>

                          <div>
                            <Label>Description</Label>
                            <Input
                              value={item.description || ''}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              placeholder="Optional description"
                            />
                          </div>

                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              min="1"
                            />
                          </div>

                          <div>
                            <Label>Unit Price</Label>
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-semibold">Total: ${item.total.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Invoice Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Invoice Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({invoice.taxRate}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Payment Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="paymentType">Payment Type</Label>
                    <Select
                      value={invoice.paymentSchedule.type}
                      onValueChange={(value: 'full' | 'installments') => 
                        setInvoice({ 
                          ...invoice, 
                          paymentSchedule: { 
                            type: value,
                            installments: value === 'installments' ? (invoice.paymentSchedule.installments || 2) : 2
                          }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Payment</SelectItem>
                        <SelectItem value="installments">Installments</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {invoice.paymentSchedule.type === 'installments' && (
                    <div>
                      <Label htmlFor="installments">Number of Installments</Label>
                      <Input
                        id="installments"
                        type="number"
                        value={invoice.paymentSchedule.installments || 2}
                        onChange={(e) => setInvoice({
                          ...invoice,
                          paymentSchedule: {
                            type: 'installments',
                            installments: parseInt(e.target.value) || 2
                          }
                        })}
                        min="2"
                        max="12"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="text-center border-b pb-6">
                <h1 className="text-2xl font-bold">{invoice.title || 'Invoice'}</h1>
                <p className="text-gray-600">{invoice.providerName}</p>
                <p className="text-sm text-gray-500">Invoice #INV-0001</p>
              </div>

              {/* Client Info */}
              {invoice.clientId && (
                <div>
                  <h3 className="font-semibold mb-2">Bill To:</h3>
                  {(() => {
                    const client = clients.find(c => c.id === invoice.clientId);
                    return client ? (
                      <div>
                        <p className="font-medium">{client.name}</p>
                        {client.email && <p>{client.email}</p>}
                        {client.phone && <p>{client.phone}</p>}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="font-semibold mb-4">Items:</h3>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                        <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
                      </div>
                      <p className="font-semibold">${item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({invoice.taxRate}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Memo */}
              {invoice.memo && (
                <div>
                  <h3 className="font-semibold mb-2">Notes:</h3>
                  <p className="text-gray-600">{invoice.memo}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SubscriptionGate>
  );
}
