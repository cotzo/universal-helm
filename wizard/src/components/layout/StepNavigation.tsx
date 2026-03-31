import { useState } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronRight, Box, Settings, Container, PlayCircle, Cpu, Target, Network, Shield, Lock, FileKey, ShieldCheck, FileText, HardDrive, Users, TrendingUp, Activity, Anchor, GitBranch, Globe, Plus, Download } from 'lucide-react'
import { type StepGroup } from '../../lib/step-config'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Box, Settings, Container, PlayCircle, Cpu, Target, Network, Shield, Lock, FileKey, ShieldCheck, FileText, HardDrive, Users, TrendingUp, Activity, Anchor, GitBranch, Globe, Plus, Download, Circle,
}

interface StepNavigationProps {
  groups: StepGroup[]
  currentStep: string
  onStepClick: (stepId: string) => void
  completedSteps: Set<string>
}

export function StepNavigation({ groups, currentStep, onStepClick, completedSteps }: StepNavigationProps) {
  // Auto-expand group containing current step
  const activeGroup = groups.find(g => g.steps.some(s => s.id === currentStep))?.label
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set(activeGroup ? [activeGroup] : []))

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  // Ensure active group is always expanded
  if (activeGroup && !expandedGroups.has(activeGroup)) {
    setExpandedGroups(prev => new Set([...prev, activeGroup]))
  }

  return (
    <nav className="w-64 shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="px-4 py-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">Chartpack Wizard</h1>
        <p className="text-xs text-gray-500 mt-0.5">Values file generator</p>
      </div>
      <div className="py-2">
        {groups.map(group => {
          const isSingle = group.steps.length === 1 && !group.steps[0].group
          const isExpanded = expandedGroups.has(group.label)
          const groupHasActive = group.steps.some(s => s.id === currentStep)
          const groupAllComplete = group.steps.every(s => completedSteps.has(s.id))

          // Single ungrouped step (e.g., Review & Export)
          if (isSingle) {
            const step = group.steps[0]
            return <StepButton key={step.id} step={step} isCurrent={step.id === currentStep} isCompleted={completedSteps.has(step.id)} onClick={() => onStepClick(step.id)} />
          }

          return (
            <div key={group.label}>
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className={`w-full flex items-center justify-between px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors ${
                  groupHasActive ? 'text-blue-700 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  {group.label}
                  {groupAllComplete && !groupHasActive && (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  )}
                </span>
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
              {isExpanded && (
                <ul>
                  {group.steps.map(step => (
                    <li key={step.id}>
                      <StepButton step={step} isCurrent={step.id === currentStep} isCompleted={completedSteps.has(step.id)} onClick={() => onStepClick(step.id)} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}

function StepButton({ step, isCurrent, isCompleted, onClick }: {
  step: { id: string; label: string; icon: string }
  isCurrent: boolean
  isCompleted: boolean
  onClick: () => void
}) {
  const IconComponent = ICON_MAP[step.icon] || Circle
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 pl-6 pr-4 py-1.5 text-left text-sm transition-colors cursor-pointer ${
        isCurrent
          ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-700'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <span className="flex items-center justify-center w-5 h-5 shrink-0">
        {isCompleted && !isCurrent ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <IconComponent className={`h-3.5 w-3.5 ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`} />
        )}
      </span>
      <span className="truncate">{step.label}</span>
    </button>
  )
}
