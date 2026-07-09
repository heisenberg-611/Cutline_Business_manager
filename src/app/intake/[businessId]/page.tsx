import { IntakeForm } from '@/modules/prodp/components/IntakeForm'
import { notFound } from 'next/navigation'
import prisma from '@/modules/core/db/prisma'

export default async function PublicIntakePage(props: { params: Promise<{ businessId: string }> }) {
  const params = await props.params
  const businessId = params.businessId

  if (!businessId) {
    notFound()
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId }
  })

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="max-w-md w-full text-center p-10 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Invalid Link</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">This intake link is invalid or does not exist.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-16 pb-24 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <IntakeForm 
        businessId={business.id} 
        businessName={business.name}
      />
    </div>
  )
}
