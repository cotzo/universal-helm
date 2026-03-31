import { CheckCircle2, Circle, Box, Settings, Container, PlayCircle, Cpu, Target, Network, Shield, Lock, FileKey, ShieldCheck, FileText, HardDrive, Users, TrendingUp, Activity, Anchor, GitBranch, Globe, Plus, Download } from 'lucide-react'
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Box, Settings, Container, PlayCircle, Cpu, Target, Network, Shield, Lock, FileKey, ShieldCheck, FileText, HardDrive, Users, TrendingUp, Activity, Anchor, GitBranch, Globe, Plus, Download, Circle,
}

interface NavStep {
  id: string
  label: string
  icon: string
}

interface StepNavigationProps {
  steps: NavStep[]
  currentStep: string
  onStepClick: (stepId: string) => void
  completedSteps: Set<string>
}

export function StepNavigation({ steps, currentStep, onStepClick, completedSteps }: StepNavigationProps) {
  return (
    <nav className="w-64 shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="px-4 py-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">Chartpack Wizard</h1>
        <p className="text-xs text-gray-500 mt-0.5">Values file generator</p>
      </div>
      <ul className="py-2">
        {steps.map((step, idx) => {
          const IconComponent = ICON_MAP[step.icon] || Circle
          const isCurrent = step.id === currentStep
          const isCompleted = completedSteps.has(step.id)

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onStepClick(step.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                  isCurrent
                    ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center justify-center w-6 h-6 shrink-0">
                  {isCompleted && !isCurrent ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <IconComponent className={`h-4 w-4 ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`} />
                  )}
                </span>
                <span className="truncate">
                  <span className="text-gray-400 mr-1.5">{idx + 1}.</span>
                  {step.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
