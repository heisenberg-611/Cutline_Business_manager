import { getReviewRequestByToken } from '@/modules/prodp/actions'
import { ReviewForm } from '@/modules/prodp/components/ReviewForm'
import { notFound } from 'next/navigation'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default async function PublicReviewPage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  const token = params.token;

  if (!token) {
    notFound()
  }

  const request = await getReviewRequestByToken(token)

  if (!request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="max-w-md w-full text-center p-10 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
             <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Invalid Link</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">This review link is invalid or does not exist.</p>
          </div>
        </div>
      </div>
    )
  }

  if (request.status !== 'PENDING') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="max-w-md w-full text-center p-10 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm space-y-4">
          <div className="w-16 h-16 mx-auto bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-900 dark:text-zinc-100">
             <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Already Submitted</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">You have already submitted revisions for this request.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-16 pb-24 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <ReviewForm 
        token={token} 
        projectName={request.project.title}
        businessName={request.business.name}
        draftLink={request.draftLink}
      />
    </div>
  )
}
