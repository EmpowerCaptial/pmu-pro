'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import { SubscriptionGate } from '@/components/auth/subscription-gate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Edit, 
  Send, 
  Download, 
  Printer, 
  FileText, 
  Calendar,
  DollarSign,
  User,
  Mail,
  Phone,
  MapPin,
  Building
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  title: string;
  providerName: string;
  memo?: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: string;
  dueDate?: string;
  paymentSchedule?: string;
  createdAt: string;
  client?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  items: Array<{
    id: string;
    type: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  user: {
    id: string;
    name: string;
    businessName: string;
    email: string;
    phone?: string;
    address?: string;
  };
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { currentUser, isLoading: authLoading, isAuthenticated } = useDemoAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.email && params.id) {
      loadInvoice();
    }
  }, [currentUser?.email, params.id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invoices/${params.id}`, {
        headers: { 'x-user-email': currentUser!.email }
      });

      if (response.ok) {
        const data = await response.json();
        setInvoice(data.invoice);
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSend = async () => {
    // TODO: Implement email sending functionality
    console.log('Send invoice via email');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ivory via-white to-beige">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender mx-auto mb-4"></div>
          <p className="text-muted-text">Loading invoice...</p>
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
            <p className="text-muted-text">Please log in to view invoices.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ivory via-white to-beige">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Invoice Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-text">The requested invoice could not be found.</p>
            <Button onClick={() => router.push('/invoices')} className="mt-4">
              Back to Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SubscriptionGate>
      <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-beige pb-20 sm:pb-0">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{invoice.title}</h1>
                <p className="text-gray-600">Invoice #{invoice.invoiceNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </Badge>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" onClick={handleSend}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
              <Button onClick={() => router.push(`/invoices/${invoice.id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Invoice Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8">
                  {/* Invoice Header */}
                  <div className="text-center border-b pb-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{invoice.title}</h2>
                    <p className="text-gray-600 text-lg">{invoice.providerName}</p>
                    <p className="text-sm text-gray-500 mt-2">Invoice #{invoice.invoiceNumber}</p>
                    <p className="text-sm text-gray-500">Created: {formatDate(invoice.createdAt)}</p>
                    {invoice.dueDate && (
                      <p className="text-sm text-gray-500">Due: {formatDate(invoice.dueDate)}</p>
                    )}
                  </div>

                  {/* Business Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        From:
                      </h3>
                      <div className="text-gray-600">
                        <p className="font-medium">{invoice.user.businessName || invoice.user.name}</p>
                        <p>{invoice.user.email}</p>
                        {invoice.user.phone && <p>{invoice.user.phone}</p>}
                        {invoice.user.address && (
                          <p className="mt-2">{JSON.parse(invoice.user.address).formatted || invoice.user.address}</p>
                        )}
                      </div>
                    </div>

                    {invoice.client && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Bill To:
                        </h3>
                        <div className="text-gray-600">
                          <p className="font-medium">{invoice.client.name}</p>
                          {invoice.client.email && <p>{invoice.client.email}</p>}
                          {invoice.client.phone && <p>{invoice.client.phone}</p>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-900 mb-4">Items:</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Item</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Qty</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Price</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {invoice.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium text-gray-900">{item.name}</p>
                                  {item.description && (
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                  )}
                                  <Badge variant="outline" className="mt-1">
                                    {item.type}
                                  </Badge>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center text-gray-900">{item.quantity}</td>
                              <td className="px-4 py-3 text-right text-gray-900">${item.unitPrice.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right font-medium text-gray-900">${item.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="border-t pt-6">
                    <div className="max-w-sm ml-auto space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-900">${invoice.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
                        <span className="text-gray-900">${invoice.taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span className="text-gray-900">Total:</span>
                          <span className="text-gray-900">${invoice.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Memo */}
                  {invoice.memo && (
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="font-semibold text-gray-900 mb-2">Notes:</h3>
                      <p className="text-gray-600">{invoice.memo}</p>
                    </div>
                  )}

                  {/* Payment Schedule */}
                  {invoice.paymentSchedule && (
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="font-semibold text-gray-900 mb-2">Payment Schedule:</h3>
                      {(() => {
                        try {
                          const schedule = JSON.parse(invoice.paymentSchedule);
                          if (schedule.type === 'installments') {
                            return (
                              <p className="text-gray-600">
                                Payment in {schedule.installments} installments of ${(invoice.total / schedule.installments).toFixed(2)} each
                              </p>
                            );
                          } else {
                            return <p className="text-gray-600">Full payment due upon receipt</p>;
                          }
                        } catch {
                          return <p className="text-gray-600">{invoice.paymentSchedule}</p>;
                        }
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Invoice Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Invoice Number</Label>
                    <p className="text-sm text-gray-900">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Created</Label>
                    <p className="text-sm text-gray-900">{formatDate(invoice.createdAt)}</p>
                  </div>
                  {invoice.dueDate && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Due Date</Label>
                      <p className="text-sm text-gray-900">{formatDate(invoice.dueDate)}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Total Amount</Label>
                    <p className="text-lg font-semibold text-gray-900">${invoice.total.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => router.push(`/invoices/${invoice.id}/edit`)} className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Invoice
                  </Button>
                  <Button variant="outline" onClick={handleSend} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send to Client
                  </Button>
                  <Button variant="outline" onClick={handlePrint} className="w-full">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Invoice
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SubscriptionGate>
  );
}
