import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BillingSuccessLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Main success card loading */}
        <Card className="border-lavender/20 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-lavender/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-lavender/40 animate-pulse" />
              </div>
            </div>
            <CardTitle className="space-y-2">
              <div className="h-6 w-48 mx-auto bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-32 mx-auto bg-gray-200 animate-pulse rounded" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subscription details loading */}
            <div className="bg-lavender/5 p-4 rounded-lg space-y-3">
              <div className="h-5 w-36 bg-gray-200 animate-pulse rounded" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            </div>

            {/* What's included loading */}
            <div className="space-y-3">
              <div className="h-5 w-32 bg-gray-200 animate-pulse rounded" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons loading */}
            <div className="space-y-3 pt-4">
              <div className="h-11 w-full bg-lavender/30 animate-pulse rounded-md" />
              <div className="h-10 w-full bg-gray-200 animate-pulse rounded-md" />
            </div>
          </CardContent>
        </Card>

        {/* Footer loading */}
        <div className="text-center space-y-2">
          <div className="h-4 w-64 mx-auto bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-48 mx-auto bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}
