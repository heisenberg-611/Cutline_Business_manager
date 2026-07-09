import { Resend } from 'resend'
import { InvoiceSentEmail } from '@/emails/invoice-sent'
import { FeedbackRequestEmail } from '@/emails/feedback-request'
import { render } from '@react-email/render'
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

  const htmlContent = await render(React.createElement(InvoiceSentEmail, invoiceData))

  const { data, error } = await resend.emails.send({
    from: 'invoices@cutlin.tech',
    to,
    subject: `Invoice ${invoiceData.invoiceNumber} from ${invoiceData.businessName}`,
    html: htmlContent,
  })

  if (error) {
    console.error('Failed to send email:', error)
    throw new Error(`Resend Error: ${error.message || JSON.stringify(error)}`)
  }

  return data
}

export const sendFeedbackEmail = async (
  to: string,
  data: {
    businessName: string;
    clientName: string;
    projectName: string;
    feedbackLink: string;
    customSubject?: string;
    customBody?: string;
  }
) => {
  if (!process.env.RESEND_API_KEY) {
    console.log('STUBBING EMAIL (No RESEND_API_KEY found):', data)
    return { id: 'stub-id' }
  }

  const htmlContent = await render(React.createElement(FeedbackRequestEmail, data))

  const { data: resData, error } = await resend.emails.send({
    from: 'feedback@cutlin.tech',
    to,
    subject: data.customSubject || `We'd love your feedback on ${data.projectName}`,
    html: htmlContent,
  })

  if (error) {
    console.error('Failed to send feedback email:', error)
    throw new Error(`Resend Error: ${error.message || JSON.stringify(error)}`)
  }

  return resData
}
