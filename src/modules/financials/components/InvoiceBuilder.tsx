'use client'

import React, { useState } from 'react'
import { createInvoice } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'

type Client = { id: string, displayName: string }
type Project = { id: string, title: string, clientId: string }

export default function InvoiceBuilder({ clients, projects }: { clients: Client[], projects: Project[] }) {
  const [clientId, setClientId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [dueDate, setDueDate] = useState('')
  
  const [lineItems, setLineItems] = useState([{ id: 1, description: '', amount: '' }])
  const [loading, setLoading] = useState(false)

  // Filter projects by selected client
  const availableProjects = projectId && !clientId 
    ? projects // if they haven't picked a client yet, show all? Better to restrict.
    : projects.filter(p => p.clientId === clientId)

  const handleAddLine = () => {
    setLineItems([...lineItems, { id: Date.now(), description: '', amount: '' }])
  }

  const handleRemoveLine = (id: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id))
    }
  }

  const handleLineChange = (id: number, field: 'description' | 'amount', value: string) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const subtotal = lineItems.reduce((sum, item) => {
    const parsed = parseFloat(item.amount)
    return sum + (isNaN(parsed) ? 0 : parsed)
  }, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!clientId) return alert("Please select a client")
    if (lineItems.some(i => !i.description || !i.amount)) return alert("Please fill out all line items")

    setLoading(true)
    try {
      await createInvoice({
        clientId,
        projectId: projectId || undefined,
        dueDate: dueDate || undefined,
        lineItems: lineItems.map(i => ({
          description: i.description,
          amount: Math.round(parseFloat(i.amount) * 100) // Convert to cents
        }))
      })
      // Server action handles redirect
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label>Client *</Label>
          <Select value={clientId} onValueChange={(val) => {
            setClientId(val || '')
            setProjectId('') // reset project when client changes
          }} required>
            <SelectTrigger>
              <SelectValue placeholder="Select Client">
                {clientId ? clients.find(c => c.id === clientId)?.displayName : ""}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {clients.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.displayName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Project (Optional)</Label>
          <Select value={projectId} onValueChange={(val) => setProjectId(val || '')} disabled={!clientId || availableProjects.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder={!clientId ? "Select a client first" : "Select Project"}>
                 {projectId ? projects.find(p => p.id === projectId)?.title : ""}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableProjects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Due Date</Label>
          <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Line Items</h4>
        </div>
        
        {lineItems.map((item, index) => (
          <div key={item.id} className="flex gap-4 items-start">
            <div className="flex-1 space-y-2">
              {index === 0 && <Label className="text-xs text-zinc-500">Description</Label>}
              <Input 
                placeholder="e.g. YouTube Edit - Ep 5" 
                value={item.description}
                onChange={e => handleLineChange(item.id, 'description', e.target.value)}
                required
              />
            </div>
            <div className="w-32 space-y-2">
              {index === 0 && <Label className="text-xs text-zinc-500">Amount ($)</Label>}
              <Input 
                type="number" 
                step="0.01"
                min="0"
                placeholder="0.00" 
                value={item.amount}
                onChange={e => handleLineChange(item.id, 'amount', e.target.value)}
                required
              />
            </div>
            <div className={index === 0 ? "pt-6" : ""}>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleRemoveLine(item.id)}
                disabled={lineItems.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="mt-2 text-xs border-dashed"
          onClick={handleAddLine}
        >
          <Plus className="w-3 h-3 mr-1" /> Add Line
        </Button>
      </div>

      {/* Totals */}
      <div className="flex justify-end pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Tax</span>
            <span className="font-medium">$0.00</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-zinc-200 dark:border-zinc-800 pt-3">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading} className="w-40 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
          {loading ? "Generating..." : "Generate Invoice"}
        </Button>
      </div>
    </form>
  )
}
