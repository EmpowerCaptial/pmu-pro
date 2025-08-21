import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Activity } from "lucide-react"
import Link from "next/link"

export default function PerformanceCard() {
  return (
    <Card className="hover:shadow-lg transition-shadow border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-blue-800">Performance Monitor</CardTitle>
        <Zap className="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-blue-800">Undici Powered</div>
        <p className="text-xs text-blue-600 mb-2">
          Real-time performance monitoring
        </p>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Activity className="h-3 w-3 mr-1" />
            +25-40% Faster
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Zap className="h-3 w-3 mr-1" />
            Enhanced
          </Badge>
        </div>
        <div className="mt-4">
          <Link href="/performance">
            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
              View Performance
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
