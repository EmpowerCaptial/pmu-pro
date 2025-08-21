import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, FileText, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function VerificationPendingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-lavender/30 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-lavender/10 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-lavender" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            License Verification Pending
          </CardTitle>
          <CardDescription className="text-gray-600">
            We're reviewing your professional credentials
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert className="border-lavender/30 bg-lavender/5">
            <FileText className="h-4 w-4 text-lavender" />
            <AlertDescription>
              Your license and insurance documents are being reviewed by our verification team.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Application submitted successfully</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-orange-500" />
              <span>Verification in progress (24-48 hours)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="h-4 w-4 text-blue-500" />
              <span>Documents under review</span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button 
              variant="outline" 
              className="w-full"
              disabled
            >
              <Clock className="mr-2 h-4 w-4" />
              Verification in Progress
            </Button>
            
            <Link href="/auth/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </div>

          <div className="text-center text-xs text-gray-500 pt-4 space-y-2">
            <p>What happens next?</p>
            <ul className="text-left space-y-1">
              <li>• Our team reviews your documents</li>
              <li>• You'll receive an email when verified</li>
              <li>• Then you can complete payment and access PMU Pro</li>
            </ul>
          </div>

          <div className="text-center text-xs text-gray-500 pt-4">
            <p>Questions? Contact support at support@pmupro.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
