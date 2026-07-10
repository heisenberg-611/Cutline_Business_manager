import React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'

interface Project {
  id: string
  title: string
  deadline: Date | null
  client: { displayName: string }
  statusStage: { 
    id: string
    name: string
    estimatedHours: number | null
    template: {
      stages: { id: string }[]
    }
  } | null
  stageHistory: { enteredAt: Date }[]
}

export function UpcomingDeadlines({ projects }: { projects: Project[] }) {
  const now = new Date()
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(now.getDate() + 3)

  const upcoming = projects
    .filter(p => p.deadline && p.deadline.getTime() >= now.getTime())
    .sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime())
    .slice(0, 5)

  if (upcoming.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500 text-sm">
        No upcoming deadlines.
      </div>
    )
  }

  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {upcoming.map(project => {
        let status = 'on-track'
        let hoursInStage = 0

        if (project.deadline && project.deadline <= threeDaysFromNow) {
          status = 'watch'
        }

        if (project.statusStage?.estimatedHours && project.stageHistory[0]) {
          // Check if this is the final stage
          const stages = project.statusStage.template.stages
          const currentIndex = stages.findIndex(s => s.id === project.statusStage!.id)
          const isFinal = currentIndex === stages.length - 1
          
          if (!isFinal) {
            hoursInStage = (now.getTime() - new Date(project.stageHistory[0].enteredAt).getTime()) / (1000 * 60 * 60)
            if (hoursInStage > project.statusStage.estimatedHours) {
              status = 'at-risk'
            }
          }
        }

        return (
          <li key={project.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
            <Link href={`/dashboard/projects/${project.id}`} className="flex justify-between items-center w-full">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{project.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-zinc-500">{project.client.displayName}</p>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {project.deadline!.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {status === 'at-risk' ? (
                  <Badge variant="destructive">At Risk</Badge>
                ) : status === 'watch' ? (
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-900/70 border-amber-200 dark:border-amber-800">Watch</Badge>
                ) : (
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-900/50 dark:bg-emerald-950/30">On Track</Badge>
                )}
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
