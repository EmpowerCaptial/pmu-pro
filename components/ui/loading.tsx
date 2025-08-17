// Generic loading component for pages with search params
export default function SearchParamsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-lg border border-lavender/20 shadow-lg p-8">
          <div className="text-center space-y-6">
            {/* Loading spinner */}
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-lavender/30 border-t-lavender rounded-full animate-spin"></div>
            </div>
            
            {/* Loading text */}
            <div className="space-y-2">
              <div className="h-6 w-32 mx-auto bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-48 mx-auto bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// You can also export named loading components for specific use cases
export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-lavender/30 border-t-lavender rounded-full animate-spin mx-auto"></div>
        <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mx-auto" />
      </div>
    </div>
  )
}

export function FormLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
          <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
        </div>
      ))}
      <div className="h-11 w-full bg-lavender/30 animate-pulse rounded-md mt-6" />
    </div>
  )
}
