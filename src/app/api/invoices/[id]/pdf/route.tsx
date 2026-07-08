import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/modules/core/db/prisma'
import { renderToStream } from '@react-pdf/renderer'
import { InvoiceTemplate } from '@/lib/pdf/invoice-template'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { orgId } = await auth()
  
  if (!orgId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params

  const invoice = await prisma.invoice.findFirst({
    where: { id, businessId: orgId },
    include: {
      business: true,
      client: true,
      lineItems: true
    }
  })

  if (!invoice) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // The template requires dates to be Date objects
  const pdfStream = await renderToStream(
    <InvoiceTemplate invoice={invoice as any} />
  )

  // Convert Node readable stream to Web ReadableStream
  const stream = new ReadableStream({
    start(controller) {
      pdfStream.on('data', (chunk) => controller.enqueue(chunk))
      pdfStream.on('end', () => controller.close())
      pdfStream.on('error', (err) => controller.error(err))
    }
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="invoice-${invoice.invoiceNumber}.pdf"`
    }
  })
}
