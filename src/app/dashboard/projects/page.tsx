import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProjects, getOrgUsers } from '@/modules/projects/actions'
import { getClients } from '@/modules/clients/actions'
import { getPendingProjectRequests } from '@/modules/prodp/actions'
import { ProjectRequestsPanel } from '@/modules/prodp/components/ProjectRequestsPanel'
import { ProjectForm } from '@/modules/projects/components/ProjectForm'
import { ExportProjectsButton } from '@/modules/projects/components/ExportProjectsButton'
import { StageProgressPipeline } from '@/modules/projects/components/StageProgressPipeline'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'

export const metadata = {
  title: 'Projects',
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { orgId } = await auth()
  const resolvedSearchParams = await searchParams
  const shouldOpenNewProject = resolvedSearchParams.newProject === '1'
  
  if (!orgId) {
    redirect('/dashboard/select-business')
  }

  const [projects, clients, pendingRequests, members] = await Promise.all([
    getProjects(orgId),
    getClients(orgId),
    getPendingProjectRequests(),
    getOrgUsers(orgId)
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h3 className="text-xl font-semibold leading-6 text-zinc-900 dark:text-zinc-100">
            Projects
          </h3>
          <p className="mt-2 text-sm text-zinc-500">
            Manage your active editing projects, track deadlines, and priorities.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <ExportProjectsButton projects={projects} />
          <ProjectForm
            clients={clients.map(c => ({ id: c.id, displayName: c.displayName }))}
            members={members}
            defaultOpen={shouldOpenNewProject}
          />
        </div>
      </div>
      
      <ProjectRequestsPanel requests={pendingRequests as any} />
      
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm flex flex-col items-center">
            {clients.length === 0 ? (
              <>
                <p>You need to create a Client before you can create a project.</p>
                <p className="mt-2 text-xs">Go to the Clients tab to get started.</p>
              </>
            ) : (
              <p>You don't have any projects yet. Click "New Project" to get started!</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Project Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="w-[300px]">Pipeline Progress</TableHead>
                <TableHead>Deadline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                    <Link href={`/dashboard/projects/${project.id}`} className="hover:underline flex flex-col">
                      <span>{project.title}</span>
                      {project.displayId && (
                        <span className="text-xs text-zinc-500 font-normal">{project.displayId}</span>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {/* @ts-ignore - TS doesn't know client is included despite prisma query include */}
                    {project.client?.displayName || '-'}
                  </TableCell>
                  <TableCell>{project.type || '-'}</TableCell>
                  <TableCell>
                    {project.priority ? (
                      <Badge 
                        variant="secondary" 
                        className={
                          project.priority?.toLowerCase() === 'high' ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/50 dark:border-red-500/20' :
                          project.priority?.toLowerCase() === 'medium' ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200/50 dark:border-orange-500/20' :
                          'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20'
                        }
                      >
                        {project.priority}
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="min-w-[250px]">
                    <StageProgressPipeline project={project as any} />
                  </TableCell>
                  <TableCell>
                    {project.deadline ? format(new Date(project.deadline), 'MMM d, yyyy') : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
