import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"

interface RiskPillProps {
  risk: "safe" | "precaution" | "not_recommended"
  className?: string
}

export function RiskPill({ risk, className }: RiskPillProps) {
  const riskConfig = {
    safe: {
      label: "Safe",
      icon: CheckCircle,
      className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
    },
    precaution: {
      label: "Precaution",
      icon: AlertTriangle,
      className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
    },
    not_recommended: {
      label: "Not Recommended",
      icon: XCircle,
      className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
    },
  }

  const config = riskConfig[risk]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn(config.className, "gap-1.5 px-3 py-1", className)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  )
}
