export default function BillingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header loading */}
        <div className="text-center space-y-4">
          <div className="h-8 w-64 mx-auto bg-gray-200 animate-pulse rounded" />
          <div className="h-5 w-96 mx-auto bg-gray-200 animate-pulse rounded" />
        </div>

        {/* Current plan loading */}
        <div className="bg-white rounded-lg border border-lavender/20 p-6 space-y-4">
          <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 w-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
            </div>
            <div className="h-9 w-24 bg-lavender/30 animate-pulse rounded" />
          </div>
        </div>

        {/* Pricing cards loading */}
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-lavender/20 p-6 space-y-6">
              {/* Card header */}
              <div className="text-center space-y-4">
                <div className="h-6 w-32 mx-auto bg-gray-200 animate-pulse rounded" />
                <div className="space-y-1">
                  <div className="h-10 w-24 mx-auto bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-20 mx-auto bg-gray-200 animate-pulse rounded" />
                </div>
              </div>

              {/* Features list */}
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-lavender/30 animate-pulse" />
                    <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                  </div>
                ))}
              </div>

              {/* CTA button */}
              <div className="h-11 w-full bg-lavender/30 animate-pulse rounded-md" />
            </div>
          ))}
        </div>

        {/* FAQ section loading */}
        <div className="space-y-6">
          <div className="h-6 w-48 mx-auto bg-gray-200 animate-pulse rounded" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-lavender/20 p-4">
                <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
