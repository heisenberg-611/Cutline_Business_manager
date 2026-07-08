'use client'

import { useState } from 'react'
import { createProject } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'

type Client = {
  id: string
  displayName: string
}

export function ProjectForm({ clients }: { clients: Client[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Track standard HTML form state for selects
  const [clientId, setClientId] = useState('')
  const [priority, setPriority] = useState('')

  async function handleSubmit(formData: FormData) {
    if (clientId) formData.set('clientId', clientId)
    if (priority) formData.set('priority', priority)

    setLoading(true)
    try {
      await createProject(formData)
      setOpen(false)
      setClientId('')
      setPriority('')
    } catch (error) {
      console.error("Failed to create project", error)
      alert("Error creating project.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle>Create a New Project</DialogTitle>
          <DialogDescription>
            Assign a new project to an existing client.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input id="title" name="title" placeholder="e.g. Q3 Marketing Ad" required />
          </div>

          <div className="space-y-2">
            <Label>Client *</Label>
            <Select value={clientId} onValueChange={(val) => setClientId(val || '')} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a client">
                  {clients.find(c => c.id === clientId)?.displayName}
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
            <Label htmlFor="type">Project Type</Label>
            <Input id="type" name="type" placeholder="e.g. YouTube Long-Form" />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(val) => setPriority(val || '')}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority">
                  {priority}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input id="deadline" name="deadline" type="date" />
          </div>
          
          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading || !clientId}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
