import { Client } from '@upstash/qstash'

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN || '',
})

export async function triggerPdfGeneration(invoiceId: string, orgId: string) {
  if (!process.env.QSTASH_TOKEN) {
    console.warn('QSTASH_TOKEN is not set, skipping background PDF generation.')
    return
  }
  
  // The absolute URL of our Vercel app webhook endpoint
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')
  const webhookUrl = `${baseUrl}/api/webhooks/qstash/pdf`

  try {
    await qstashClient.publishJSON({
      url: webhookUrl,
      body: { invoiceId, orgId },
      // Optional: Prevent duplicates in case of quick rapid edits (but here we want the latest to generate, so we'll omit deduplicationId to allow it to overwrite)
    })
  } catch (error) {
    console.error('Failed to trigger QStash PDF generation:', error)
  }
}
