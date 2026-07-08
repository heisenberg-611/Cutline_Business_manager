import { Resend } from 'resend'
import { InvoiceSentEmail } from '@/emails/invoice-sent'
import React from 'react'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendInvoiceEmail = async (
  to: string,
  invoiceData: {
    invoiceNumber: string;
    amountDue: string;
    dueDate: string;
    businessName: string;
    clientName: string;
    pdfLink: string;
  }
) => {
  if (!process.env.RESEND_API_KEY) {
    console.log('STUBBING EMAIL (No RESEND_API_KEY found):', invoiceData)
    return { id: 'stub-id' }
  }

  const { data, error } = await resend.emails.send({
    from: 'billing@yourdomain.com', // Replace with verified domain later
    to,
    subject: `Invoice ${invoiceData.invoiceNumber} from ${invoiceData.businessName}`,
    react: React.createElement(InvoiceSentEmail, invoiceData),
  })

  if (error) {
    console.error('Failed to send email:', error)
    throw new Error('Failed to send email')
  }

  return data
}
