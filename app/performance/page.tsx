import PerformanceMonitor from '@/components/performance/performance-monitor'

export default function PerformancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Performance Monitor
          </h1>
          <p className="text-xl text-gray-600">
            Real-time monitoring of Undici-powered performance improvements
          </p>
        </div>
        
        <PerformanceMonitor />
      </div>
    </div>
  )
}
