import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button
} from '@react-email/components';
import * as React from 'react';

interface InvoiceEmailProps {
  invoiceNumber: string;
  amountDue: string;
  dueDate: string;
  businessName: string;
  clientName: string;
  pdfLink: string;
  paymentLink?: string;
}

export const InvoiceSentEmail = ({
  invoiceNumber = 'CUT-2026-0042',
  amountDue = '$1,500.00',
  dueDate = 'Oct 31, 2026',
  businessName = 'Cutline Studio',
  clientName = 'Acme Corp',
  pdfLink = '#',
  paymentLink = '#'
}: InvoiceEmailProps) => {
  const previewText = `Invoice ${invoiceNumber} from ${businessName} is ready`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Invoice {invoiceNumber}</Heading>
          
          <Text style={text}>Hi {clientName},</Text>
          <Text style={text}>
            Here is your invoice from {businessName} for the amount of <strong>{amountDue}</strong>.
            This invoice is due on <strong>{dueDate}</strong>.
          </Text>

          <Section style={btnContainer}>
            <Button style={button} href={pdfLink}>
              View & Download PDF
            </Button>
          </Section>

          {paymentLink && paymentLink !== '#' && (
            <Section style={btnContainer}>
              <Button style={buttonSecondary} href={paymentLink}>
                Pay Online
              </Button>
            </Section>
          )}

          <Hr style={hr} />
          
          <Text style={footer}>
            If you have any questions about this invoice, simply reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default InvoiceSentEmail;

const main = {
  backgroundColor: '#f4f4f5',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  marginTop: '40px',
  marginBottom: '40px',
  maxWidth: '600px',
  border: '1px solid #e4e4e7',
};

const h1 = {
  color: '#18181b',
  fontSize: '24px',
  fontWeight: 'bold',
  padding: '0',
  margin: '0 0 24px 0',
};

const text = {
  color: '#3f3f46',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '24px',
};

const btnContainer = {
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const button = {
  backgroundColor: '#18181b',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
};

const buttonSecondary = {
  backgroundColor: '#ffffff',
  border: '1px solid #e4e4e7',
  borderRadius: '6px',
  color: '#18181b',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
};

const hr = {
  borderColor: '#e4e4e7',
  margin: '32px 0 24px 0',
};

const footer = {
  color: '#71717a',
  fontSize: '14px',
  lineHeight: '22px',
};
