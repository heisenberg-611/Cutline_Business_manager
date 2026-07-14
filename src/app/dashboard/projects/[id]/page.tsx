import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getProjectDetails } from '@/modules/projects/detail-actions'
import { getOrgUsers } from '@/modules/projects/actions'
import { NotesPanel } from '@/modules/projects/components/NotesPanel'
import { LinksPanel } from '@/modules/projects/components/LinksPanel'
import { TimePanel } from '@/modules/projects/components/TimePanel'
import { AssetPanel } from '@/modules/projects/components/AssetPanel'
import { ProjectActions } from '@/modules/projects/components/ProjectActions'
import prisma from '@/modules/core/db/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, CalendarDays, Folder } from 'lucide-react'
import { format } from 'date-fns'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { orgId } = await auth()
  
  if (!orgId) {
    redirect('/dashboard/select-business')
  }

  // Next.js 15: params must be awaited
  const { id } = await params
  
  const [project, availableAssets, members] = await Promise.all([
    getProjectDetails(id),
    prisma.asset.findMany({
      where: { businessId: orgId },
      orderBy: { name: 'asc' }
    }),
    getOrgUsers(orgId)
  ])

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold leading-6 text-zinc-900 dark:text-zinc-100">
              {project.title}
            </h3>
            {project.displayId && (
              <Badge variant="outline" className="text-xs bg-zinc-50 dark:bg-zinc-900">
                {project.displayId}
              </Badge>
            )}
            {project.isArchived && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-100">
                Archived
              </Badge>
            )}
          </div>
          <p className="mt-2 text-sm text-zinc-500 flex items-center gap-2">
            Client: <span className="font-medium text-zinc-700 dark:text-zinc-300">{project.client?.displayName}</span>
            {project.priority && (
              <>
                <span>•</span>
                Priority: <span className="font-medium text-zinc-700 dark:text-zinc-300">{project.priority}</span>
              </>
            )}
            {project.assigneeId && (
              <>
                <span>•</span>
                Assignee: <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {members.find(m => m.user.id === project.assigneeId)?.user.firstName || 'Assigned'}
                </span>
              </>
            )}
          </p>
        </div>
        <ProjectActions project={{
          id: project.id,
          title: project.title,
          priority: project.priority,
          deadline: project.deadline,
          isArchived: project.isArchived,
          assigneeId: project.assigneeId,
          clientId: project.clientId,
          clientHasEmail: !!project.client?.email
        }} members={members} />
      </div>
      
      {/* Main Content Area - Split into Panels */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 min-h-0">
        {/* Notes Column */}
        <div className="min-h-0">
          <NotesPanel projectId={project.id} notes={project.notes} />
        </div>

        {/* Links Column */}
        <div className="min-h-0">
          <LinksPanel projectId={project.id} links={project.links as any} />
        </div>

        {/* Time Tracking Column */}
        <div className="min-h-0">
          <TimePanel projectId={project.id} timeEntries={project.timeEntries} />
        </div>

        {/* Assets Column */}
        <div className="min-h-0">
          <AssetPanel 
            projectId={project.id} 
            currentAssets={project.assets} 
            availableAssets={availableAssets} 
          />
        </div>
      </div>
    </div>
  )
}
