'use client'

import { useState, useTransition } from 'react'
import { approveProjectRequest, rejectProjectRequest } from '@/modules/prodp/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Clock, User, Mail, Building, Phone, Video, FileText, Link as LinkIcon, ChevronDown, ChevronUp, Inbox } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface ProjectRequest {
  id: string
  clientName: string
  clientEmail: string
  companyName: string | null
  phone: string | null
  industry: string | null
  preferredChannel: string | null
  projectTitle: string
  projectType: string | null
  scriptText: string | null
  scriptLink: string | null
  rawFootageLink: string | null
  createdAt: string
  existingClient?: { id: string; displayName: string } | null
}

interface ProjectRequestsPanelProps {
  requests: ProjectRequest[]
}

export function ProjectRequestsPanel({ requests }: ProjectRequestsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      await approveProjectRequest(id)
      startTransition(() => {
        router.refresh()
      })
    } catch (err: any) {
      alert(err.message || 'Failed to approve request')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this project request?')) return
    setProcessingId(id)
    try {
      await rejectProjectRequest(id)
      startTransition(() => {
        router.refresh()
      })
    } catch (err: any) {
      alert(err.message || 'Failed to reject request')
    } finally {
      setProcessingId(null)
    }
  }

  if (requests.length === 0) {
    return null
  }

  return (
    <Card className="bg-white dark:bg-zinc-950 border-amber-200 dark:border-amber-900/40 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-950/40 rounded-lg flex items-center justify-center">
              <Inbox className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Project Requests</CardTitle>
              <p className="text-xs text-zinc-500 mt-0.5">
                {requests.length} pending {requests.length === 1 ? 'request' : 'requests'} awaiting your approval
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30">
            {requests.length} Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <AnimatePresence mode="popLayout">
          {requests.map((req) => {
            const isExpanded = expandedId === req.id
            const isProcessing = processingId === req.id
            const timeAgo = getRelativeTime(new Date(req.createdAt))

            return (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden"
              >
                {/* Collapsed header - always visible */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {req.projectTitle}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {req.clientName} • {timeAgo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {req.projectType && (
                      <Badge variant="outline" className="text-xs hidden sm:flex">
                        {req.projectType}
                      </Badge>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-4 border-t border-zinc-100 dark:border-zinc-800/50 pt-4">
                        {/* Client Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Client Details</h4>
                            {req.existingClient ? (
                              <Badge variant="secondary" className="text-[10px] h-5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-none">
                                Existing Client
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] h-5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none">
                                New Client
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                              <User className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{req.clientName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{req.clientEmail}</span>
                            </div>
                            {req.companyName && (
                              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                <Building className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{req.companyName}</span>
                              </div>
                            )}
                            {req.phone && (
                              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{req.phone}</span>
                              </div>
                            )}
                            {req.industry && (
                              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                <span className="text-xs font-medium text-zinc-500">Industry:</span>
                                <span>{req.industry}</span>
                              </div>
                            )}
                            {req.preferredChannel && (
                              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                <span className="text-xs font-medium text-zinc-500">Channel:</span>
                                <span>{req.preferredChannel}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Assets & Links */}
                        {(req.scriptText || req.scriptLink || req.rawFootageLink) && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Attached Assets</h4>
                            <div className="space-y-1.5">
                              {req.scriptText && (
                                <div className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                  <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                  <p className="line-clamp-3">{req.scriptText}</p>
                                </div>
                              )}
                              {req.scriptLink && (
                                <div className="flex items-center gap-2 text-sm">
                                  <LinkIcon className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                                  <a href={req.scriptLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate">
                                    Script Document
                                  </a>
                                </div>
                              )}
                              {req.rawFootageLink && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Video className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                                  <a href={req.rawFootageLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate">
                                    Raw Footage
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(req.id)}
                            disabled={isProcessing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 flex-1 sm:flex-none"
                          >
                            <Check className="w-4 h-4 mr-1.5" />
                            {isProcessing ? 'Approving...' : 'Approve & Create Project'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(req.id)}
                            disabled={isProcessing}
                            className="border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex-1 sm:flex-none"
                          >
                            <X className="w-4 h-4 mr-1.5" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
