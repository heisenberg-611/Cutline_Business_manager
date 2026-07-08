'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import type { InvoiceData } from '@/lib/pdf/invoice-template'

interface DownloadInvoiceButtonProps {
  invoiceData: InvoiceData
}

/**
 * Client-side PDF download button.
 *
 * Instead of using next/dynamic + PDFDownloadLink (which breaks under
 * Turbopack because the named export gets mangled), we use a simple
 * click handler that dynamically imports @react-pdf/renderer's `pdf()`
 * function only when the user clicks. This:
 *   1. Avoids all SSR/hydration issues (import happens in a click handler)
 *   2. Avoids Turbopack's named-export mangling with next/dynamic
 *   3. Lazy-loads the heavy PDF library only when actually needed
 */
export function DownloadInvoiceButton({ invoiceData }: DownloadInvoiceButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      // Dynamic import at click-time — guaranteed client-only, no SSR risk
      const { pdf } = await import('@react-pdf/renderer')
      const { InvoiceTemplate } = await import('@/lib/pdf/invoice-template')

      const blob = await pdf(<InvoiceTemplate invoice={invoiceData} />).toBlob()

      // Trigger browser download
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${invoiceData.invoiceNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      disabled={isGenerating}
      className="text-zinc-500"
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating…
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </>
      )}
    </Button>
  )
}
