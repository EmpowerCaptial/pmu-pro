"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Copy, 
  Share2, 
  QrCode, 
  Instagram, 
  Facebook, 
  Twitter,
  ArrowLeft,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import { generateUserHandle, getPublicBookingConfig } from '@/lib/booking';

export default function ShareBookingPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useDemoAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Generate user handle from email (fallback to demo handle)
  const getUserHandle = () => {
    if (currentUser?.email) {
      return generateUserHandle(currentUser.email);
    }
    return 'demo-artist'; // fallback
  };

  const userHandle = getUserHandle();
  const bookingLink = `https://thepmuguide.com/book/${userHandle}`;
  const embedCode = `<iframe 
  src="https://thepmuguide.com/book/${userHandle}/embed" 
  width="100%" 
  height="680" 
  frameborder="0">
</iframe>`;

  // Fetch services for preview
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const config = await getPublicBookingConfig(userHandle, currentUser?.email);
        setServices(config?.services || []);
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    if (userHandle && currentUser?.email) {
      fetchServices();
    }
  }, [userHandle, currentUser?.email]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      alert('Failed to copy link');
    }
  };

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    } catch (err) {
      alert('Failed to copy embed code');
    }
  };

  const handleSocialShare = (platform: string) => {
    const text = `Book your PMU services with me! ${bookingLink}`;
    let url = '';
    
    switch (platform) {
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we'll just copy the link
        handleCopyLink();
        alert('Link copied! Paste it in your Instagram bio or story.');
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(bookingLink)}`;
        window.open(url, '_blank', 'width=600,height=400');
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'width=600,height=400');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-beige p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Calendar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-ink">Share Your Booking Link</h1>
            <p className="text-muted-text">Share your services with clients and grow your business</p>
          </div>
        </div>

        {/* Preview Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-lavender" />
              Your Public Booking Page Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-lavender rounded-xl flex items-center justify-center text-white font-bold">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                  <h3 className="font-semibold">{currentUser?.name || 'Your Name'}</h3>
                  <p className="text-sm text-gray-600">Professional PMU Artist</p>
                </div>
              </div>
              <div className="space-y-3">
                {loadingServices ? (
                  <div className="flex items-center justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin text-lavender" />
                    <span className="ml-2 text-gray-600">Loading services...</span>
                  </div>
                ) : services.length > 0 ? (
                  services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-600">
                          {service.durationMinutes ? `${Math.round(service.durationMinutes / 60)}h` : ''}
                          {service.durationMinutes && service.price ? ' • ' : ''}
                          {service.price ? `$${service.price}` : ''}
                        </p>
                      </div>
                      <Button size="sm" className="bg-lavender hover:bg-lavender-600">
                        Book
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-6 text-gray-500">
                    <p>No services available</p>
                    <p className="text-sm">Add services in the Services page to see them here</p>
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => window.open(bookingLink, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Live Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sharing Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Direct Link Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-lavender" />
                Direct Link Sharing
              </CardTitle>
              <p className="text-sm text-gray-600">
                Share your booking link directly with clients
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Your Booking Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={bookingLink}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant={copiedLink ? "default" : "outline"}
                    size="sm"
                    className={copiedLink ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">Perfect for:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Email signatures</li>
                  <li>Text messages</li>
                  <li>Business cards</li>
                  <li>Direct client communication</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Embed Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-lavender" />
                Website Embed Widget
              </CardTitle>
              <p className="text-sm text-gray-600">
                Embed your booking widget on your website
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Embed Code</Label>
                <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                  {embedCode}
                </div>
                <Button
                  onClick={handleCopyEmbed}
                  variant={copiedEmbed ? "default" : "outline"}
                  size="sm"
                  className={copiedEmbed ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {copiedEmbed ? 'Copied!' : 'Copy Code'}
                </Button>
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">Perfect for:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your website</li>
                  <li>Portfolio sites</li>
                  <li>Landing pages</li>
                  <li>Social media bios</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-lavender" />
                QR Code
              </CardTitle>
              <p className="text-sm text-gray-600">
                Generate a QR code for easy mobile access
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-400">
                  <div className="text-center">
                    <QrCode className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                    <span className="text-xs text-gray-500">QR Code</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-3">
                    Scan this QR code to instantly access your booking page
                  </p>
                  <Button variant="outline" size="sm">
                    Generate QR Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-lavender" />
                Social Media Sharing
              </CardTitle>
              <p className="text-sm text-gray-600">
                Share your booking link on social platforms
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={() => handleSocialShare('instagram')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Instagram className="h-4 w-4 mr-2 text-pink-500" />
                  Share on Instagram
                </Button>
                <Button
                  onClick={() => handleSocialShare('facebook')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                  Share on Facebook
                </Button>
                <Button
                  onClick={() => handleSocialShare('twitter')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                  Share on Twitter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>💡 Pro Tips for Sharing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Best Practices:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Include your booking link in email signatures</li>
                  <li>• Add it to your Instagram bio</li>
                  <li>• Share it in your stories with a call-to-action</li>
                  <li>• Include it on business cards</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Engagement Tips:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Post before/after photos with your link</li>
                  <li>• Share client testimonials with booking info</li>
                  <li>• Create posts about your services</li>
                  <li>• Use relevant hashtags in your posts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
