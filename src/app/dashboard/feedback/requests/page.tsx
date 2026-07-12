import { getFeedbackRequests } from '@/modules/feedback/actions'
import { getProjects } from '@/modules/projects/actions'
import { auth } from '@clerk/nextjs/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { DeleteFeedbackRequestButton } from '@/modules/feedback/components/delete-feedback-request-button'
import { ResendFeedbackEmailButton } from '@/modules/feedback/components/resend-feedback-email-button'
import { CreateFeedbackRequestDialog } from '@/modules/feedback/components/create-feedback-request-dialog'
import { getAppUrl } from '@/lib/utils'

export const metadata = {
  title: 'Feedback Requests',
}

export default async function FeedbackRequestsPage() {
  const { orgId } = await auth()
  
  const [requests, projects] = await Promise.all([
    getFeedbackRequests(),
    orgId ? getProjects(orgId) : Promise.resolve([])
  ])

  const appUrl = getAppUrl()

  return (
    <div className="p-8 w-full mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Feedback Requests</h1>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/feedback" className="text-sm font-medium hover:underline">
            &larr; Back to Inbox
          </Link>
          <CreateFeedbackRequestDialog projects={projects} />
        </div>
      </div>
      
      {requests.length === 0 ? (
        <div className="text-center text-muted-foreground p-12 border border-dashed rounded-lg">
          No feedback requests found. Generate one to get started!
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xl">
                    {request.project.title} - {request.client.displayName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Sent on {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={
                      request.status === 'COMPLETED' ? 'default' : 
                      request.status === 'RESOLVED' ? 'outline' : 'secondary'
                    }
                  >
                    {request.status}
                  </Badge>
                  {request.status === 'PENDING' && (
                    <ResendFeedbackEmailButton projectId={request.projectId} token={request.token} />
                  )}
                  <DeleteFeedbackRequestButton requestId={request.id} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground break-all bg-muted p-2 rounded-md">
                  <strong>Link:</strong> {`${appUrl}/feedback/${request.token}`}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
