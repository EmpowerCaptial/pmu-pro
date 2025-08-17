export default function BillingCancelLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red/10 via-white to-gray/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Main cancel card loading */}
        <div className="bg-white rounded-lg border border-red/20 shadow-lg p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-red/40 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="h-6 w-48 mx-auto bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-64 mx-auto bg-gray-200 animate-pulse rounded" />
            </div>
          </div>

          {/* Content loading */}
          <div className="mt-6 space-y-4">
            <div className="bg-red/5 p-4 rounded-lg space-y-2">
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
            </div>

            {/* Action buttons loading */}
            <div className="space-y-3 pt-4">
              <div className="h-11 w-full bg-lavender/30 animate-pulse rounded-md" />
              <div className="h-10 w-full bg-gray-200 animate-pulse rounded-md" />
            </div>
          </div>
        </div>

        {/* Footer loading */}
        <div className="text-center space-y-2">
          <div className="h-4 w-56 mx-auto bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}
