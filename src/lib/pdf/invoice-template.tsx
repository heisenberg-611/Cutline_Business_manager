import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#3f3f46', // zinc-700
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  brand: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#18181b', // zinc-900
  },
  invoiceTitle: {
    fontSize: 20,
    color: '#71717a', // zinc-500
    textAlign: 'right',
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  metaCol: {
    width: '45%',
  },
  metaTitle: {
    fontSize: 10,
    color: '#a1a1aa', // zinc-400
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metaText: {
    fontSize: 10,
    color: '#18181b',
    marginBottom: 2,
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  colDesc: { width: '55%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colAmount: { width: '15%', textAlign: 'right' },
  headerText: {
    color: '#a1a1aa',
    fontSize: 9,
    textTransform: 'uppercase',
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  totalsArea: {
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    color: '#71717a',
  },
  totalValue: {
    color: '#18181b',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7',
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#18181b',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#18181b',
  },
  notesArea: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7',
  },
  notesTitle: {
    fontSize: 10,
    color: '#a1a1aa',
    marginBottom: 4,
    textTransform: 'uppercase',
  }
})

// Define the shape of data required by the template
export type InvoiceData = {
  invoiceNumber: string
  issuedAt: Date | null
  dueDate: Date | null
  currency: string
  subtotalCents: number
  taxRateBps: number
  taxAmountCents: number
  totalCents: number
  notes: string | null
  business: {
    name: string
  }
  client: {
    displayName: string
    companyName: string | null
  }
  lineItems: Array<{
    description: string
    quantity: number
    amountCents: number
  }>
}

const formatMoney = (cents: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(cents / 100)
}

const formatDate = (date: Date | null) => {
  if (!date) return 'N/A'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export const InvoiceTemplate = ({ invoice }: { invoice: InvoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>{invoice.business.name}</Text>
        <View>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <Text style={{ textAlign: 'right', color: '#18181b', marginTop: 4 }}>
            {invoice.invoiceNumber}
          </Text>
        </View>
      </View>

      {/* Meta Info */}
      <View style={styles.meta}>
        <View style={styles.metaCol}>
          <Text style={styles.metaTitle}>Bill To</Text>
          <Text style={styles.metaText}>{invoice.client.companyName || invoice.client.displayName}</Text>
          {invoice.client.companyName && (
            <Text style={styles.metaText}>{invoice.client.displayName}</Text>
          )}
        </View>
        <View style={styles.metaCol}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={styles.metaTitle}>Issued</Text>
            <Text style={styles.metaText}>{formatDate(invoice.issuedAt)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.metaTitle}>Due Date</Text>
            <Text style={styles.metaText}>{formatDate(invoice.dueDate)}</Text>
          </View>
        </View>
      </View>

      {/* Line Items */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colDesc, styles.headerText]}>Description</Text>
          <Text style={[styles.colQty, styles.headerText]}>Qty</Text>
          <Text style={[styles.colPrice, styles.headerText]}>Rate</Text>
          <Text style={[styles.colAmount, styles.headerText]}>Amount</Text>
        </View>
        
        {invoice.lineItems.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>{formatMoney(item.amountCents, invoice.currency)}</Text>
            <Text style={styles.colAmount}>
              {formatMoney(item.amountCents * item.quantity, invoice.currency)}
            </Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totalsContainer}>
        <View style={styles.totalsArea}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatMoney(invoice.subtotalCents, invoice.currency)}</Text>
          </View>
          
          {invoice.taxAmountCents > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({(invoice.taxRateBps / 100).toFixed(2)}%)</Text>
              <Text style={styles.totalValue}>{formatMoney(invoice.taxAmountCents, invoice.currency)}</Text>
            </View>
          )}

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total Due</Text>
            <Text style={styles.grandTotalValue}>{formatMoney(invoice.totalCents, invoice.currency)}</Text>
          </View>
        </View>
      </View>

      {/* Notes */}
      {invoice.notes && (
        <View style={styles.notesArea}>
          <Text style={styles.notesTitle}>Notes / Payment Instructions</Text>
          <Text style={{ fontSize: 10, lineHeight: 1.4 }}>{invoice.notes}</Text>
        </View>
      )}

    </Page>
  </Document>
)
