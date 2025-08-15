import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step {
  id: string
  title: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep
            const isUpcoming = stepNumber > currentStep

            return (
              <li key={step.id} className={cn("relative", index !== steps.length - 1 && "flex-1")}>
                <div className="flex items-center">
                  <div className="relative flex items-center justify-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium",
                        isCompleted && "border-primary bg-primary text-primary-foreground",
                        isCurrent && "border-primary bg-background text-primary",
                        isUpcoming && "border-muted-foreground bg-background text-muted-foreground",
                      )}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
                    </div>
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isCompleted && "text-primary",
                        isCurrent && "text-primary",
                        isUpcoming && "text-muted-foreground",
                      )}
                    >
                      {step.title}
                    </p>
                    {step.description && <p className="text-xs text-muted-foreground">{step.description}</p>}
                  </div>
                </div>
                {index !== steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-4 top-8 h-6 w-0.5",
                      isCompleted ? "bg-primary" : "bg-muted-foreground/30",
                    )}
                  />
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
