import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export default function CrmReportsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Revenue & Performance Reports</h1>
        <p className="text-sm text-slate-600">
          Build dashboards for pipeline conversion, show rates, time-to-first-touch, and enrollment forecasts.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <BarChart3 className="h-5 w-5 text-slate-500" />
            Reporting Starter Kit
          </CardTitle>
          <CardDescription>
            Utilize Prisma aggregations or SQL views. Expose API routes such as `/api/reports/pipeline` for client-side visualizations.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <p>• Pipeline conversion by stage and lead source.</p>
          <p>• Tour show rate by advisor and campus.</p>
          <p>• Enrollment forecast grouped by upcoming cohorts.</p>
        </CardContent>
      </Card>
    </div>
  )
}
