import React from 'react'

interface Stage {
  id: string
  name: string
  orderIndex: number
  estimatedHours: number | null
}

interface ProjectData {
  id: string
  title: string
  client: { displayName: string }
  statusStage: {
    id: string
    name: string
    orderIndex: number
    estimatedHours: number | null
    template: {
      stages: Stage[]
    }
  } | null
  stageHistory: {
    stageId: string
    enteredAt: Date
  }[]
}

export function StageProgressPipeline({ project }: { project: ProjectData }) {
  if (!project.statusStage) {
    return <div className="text-sm text-zinc-500 mt-2">No active stage workflow assigned.</div>
  }

  const stages = project.statusStage.template.stages
  const currentStageIndex = stages.findIndex(s => s.id === project.statusStage!.id)
  const isFinalStage = currentStageIndex === stages.length - 1

  // Calculate if at risk in current stage
  const currentHistory = project.stageHistory.find(h => h.stageId === project.statusStage!.id)
  let isAtRisk = false
  let hoursInStage = 0
  if (currentHistory) {
    hoursInStage = (new Date().getTime() - new Date(currentHistory.enteredAt).getTime()) / (1000 * 60 * 60)
    if (project.statusStage.estimatedHours && hoursInStage > project.statusStage.estimatedHours) {
      isAtRisk = true
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full mt-3">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Stage: {project.statusStage.name}
        </span>
        {currentHistory && !isFinalStage && (
          <span className={`${isAtRisk ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-zinc-500 dark:text-zinc-400'}`}>
            {hoursInStage.toFixed(1)}h
            {project.statusStage.estimatedHours ? ` / ${project.statusStage.estimatedHours}h est.` : ''}
          </span>
        )}
        {isFinalStage && (
          <span className="text-emerald-600 dark:text-emerald-500 font-medium">
            Completed
          </span>
        )}
      </div>

      <div className="flex h-1.5 w-full gap-1">
        {stages.map((stage, idx) => {
          const isCompleted = idx < currentStageIndex
          const isCurrent = idx === currentStageIndex

          let bgColor = 'bg-zinc-200 dark:bg-zinc-800/50'
          if (isCompleted) bgColor = 'bg-zinc-800 dark:bg-zinc-200'
          if (isCurrent) bgColor = isAtRisk ? 'bg-red-500' : 'bg-emerald-500'

          return (
            <div
              key={stage.id}
              className={`flex-1 rounded-full ${bgColor} transition-colors`}
              title={stage.name}
            />
          )
        })}
      </div>
    </div>
  )
}
