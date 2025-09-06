"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  DollarSign,
  Calendar,
  User,
  Phone,
  Mail,
  Loader2,
  ExternalLink
} from "lucide-react";

interface DepositPayment {
  id: string;
  clientId: string;
  appointmentId?: string;
  userId: string;
  amount: number;
  totalAmount: number;
  remainingAmount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'REFUNDED' | 'CANCELLED';
  depositLink: string;
  depositLinkExpiresAt: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientInfo {
  name: string;
  email?: string;
  phone?: string;
}

interface UserInfo {
  name: string;
  businessName: string;
}

export default function ClientDepositPage() {
  const params = useParams();
  const depositLink = params.depositLink as string;
  
  const [depositPayment, setDepositPayment] = useState<DepositPayment | null>(null);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (depositLink) {
      loadDepositPayment();
    }
  }, [depositLink]);

  const loadDepositPayment = async () => {
    try {
      const response = await fetch(`/api/deposit-payments/${depositLink}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to load deposit payment');
      }

      const data = await response.json();
      setDepositPayment(data.depositPayment);
      
      // Load additional client and user info
      await loadAdditionalInfo(data.depositPayment);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load deposit payment');
    } finally {
      setLoading(false);
    }
  };

  const loadAdditionalInfo = async (deposit: DepositPayment) => {
    try {
      // Load client info
      const clientResponse = await fetch(`/api/clients/${deposit.clientId}`);
      if (clientResponse.ok) {
        const clientData = await clientResponse.json();
        setClientInfo({
          name: clientData.client.name,
          email: clientData.client.email,
          phone: clientData.client.phone
        });
      }

      // Load user info
      const userResponse = await fetch(`/api/users/${deposit.userId}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserInfo({
          name: userData.user.name,
          businessName: userData.user.businessName
        });
      }
    } catch (error) {
      console.error('Failed to load additional info:', error);
    }
  };

  const handlePayment = async () => {
    if (!depositPayment) return;

    setProcessingPayment(true);
    
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-deposit-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          depositId: depositPayment.id,
          amount: depositPayment.amount,
          currency: depositPayment.currency,
          clientName: clientInfo?.name || 'Client',
          successUrl: `${window.location.origin}/deposit/${depositLink}/success`,
          cancelUrl: `${window.location.origin}/deposit/${depositLink}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Payment</Badge>;
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-gray-100 text-gray-800">Refunded</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-lavender" />
          <p className="text-gray-600">Loading deposit payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Link Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!depositPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Deposit Not Found</h2>
            <p className="text-gray-600">This deposit payment link is invalid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink mb-2">Deposit Payment</h1>
          <p className="text-muted">Complete your deposit payment for your upcoming appointment</p>
        </div>

        {/* Main Payment Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-lavender" />
                Payment Details
              </CardTitle>
              {getStatusBadge(depositPayment.status)}
            </div>
            <CardDescription>
              {userInfo && `Payment for ${userInfo.businessName}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Amounts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(depositPayment.amount, depositPayment.currency)}
                </div>
                <div className="text-sm text-blue-800">Deposit Amount</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(depositPayment.totalAmount, depositPayment.currency)}
                </div>
                <div className="text-sm text-green-800">Total Procedure Cost</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(depositPayment.remainingAmount, depositPayment.currency)}
                </div>
                <div className="text-sm text-orange-800">Due on Procedure Day</div>
              </div>
            </div>

            {/* Client Information */}
            {clientInfo && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{clientInfo.name}</span>
                  </div>
                  {clientInfo.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{clientInfo.email}</span>
                    </div>
                  )}
                  {clientInfo.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{clientInfo.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Status Messages */}
            {depositPayment.status === 'PENDING' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-800">Payment Required</h4>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  Your deposit payment is required to secure your appointment. 
                  The remaining balance will be due on the day of your procedure.
                </p>
                <p className="text-xs text-yellow-600">
                  This link expires on {formatDate(depositPayment.depositLinkExpiresAt)}
                </p>
              </div>
            )}

            {depositPayment.status === 'PAID' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Payment Confirmed</h4>
                </div>
                <p className="text-sm text-green-700 mb-2">
                  Your deposit payment has been successfully processed.
                </p>
                {depositPayment.paidAt && (
                  <p className="text-xs text-green-600">
                    Paid on {formatDate(depositPayment.paidAt)}
                  </p>
                )}
              </div>
            )}

            {depositPayment.status === 'EXPIRED' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-red-800">Payment Link Expired</h4>
                </div>
                <p className="text-sm text-red-700">
                  This payment link has expired. Please contact your artist to get a new payment link.
                </p>
              </div>
            )}

            {/* Payment Button */}
            {depositPayment.status === 'PENDING' && (
              <Button
                onClick={handlePayment}
                disabled={processingPayment}
                className="w-full bg-lavender hover:bg-lavender-600 text-white py-3 text-lg"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Pay Deposit Now
                  </>
                )}
              </Button>
            )}

            {/* Additional Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Important Information</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your deposit secures your appointment time</li>
                <li>• The remaining balance is due on the day of your procedure</li>
                <li>• All payments are processed securely through Stripe</li>
                <li>• You will receive a receipt via email after payment</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Powered by PMU Pro • Secure payment processing by Stripe</p>
        </div>
      </div>
    </div>
  );
}
