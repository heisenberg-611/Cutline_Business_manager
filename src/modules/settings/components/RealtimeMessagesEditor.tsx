'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { updateRealtimeMessagesSetting } from '../actions'
import { Loader2 } from 'lucide-react'

export function RealtimeMessagesEditor({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isSaving, setIsSaving] = useState(false)

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      const confirmed = window.confirm(
        "WARNING: Enabling real-time messages will cause continuous background requests from all users.\n\nThis will consume Vercel's fluid active CPU limits very quickly and could significantly increase your hosting costs.\n\nAre you sure you want to enable real-time messaging?"
      )
      if (!confirmed) return
    }

    setEnabled(checked)
    setIsSaving(true)
    try {
      await updateRealtimeMessagesSetting(checked)
    } catch (e: any) {
      alert(e.message || 'An error occurred')
      setEnabled(!checked) // revert
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label className="text-sm font-medium">Enable Real-time Messages</Label>
        <p className="text-xs text-muted-foreground">
          Turn off to disable automatic background refreshing (saves server resources). Users will need to refresh manually to see new messages.
        </p>
      </div>
      <div className="flex items-center gap-3">
        {isSaving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        <Switch 
          checked={enabled} 
          onCheckedChange={handleToggle}
          disabled={isSaving}
        />
      </div>
    </div>
  )
}
