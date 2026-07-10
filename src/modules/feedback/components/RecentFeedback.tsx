import React from 'react'
import { Star } from 'lucide-react'

interface Feedback {
  id: string
  overallScore: number
  commentText: string | null
  submittedAt: Date
  request: {
    project: { title: string }
    client: { displayName: string }
  }
}

export function RecentFeedback({ feedback }: { feedback: Feedback[] }) {
  if (feedback.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500 text-sm">
        No recent feedback.
      </div>
    )
  }

  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {feedback.map(item => (
        <li key={item.id} className="p-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {item.request.client.displayName}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {item.request.project.title}
              </p>
            </div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${star <= item.overallScore ? 'fill-amber-400 text-amber-400' : 'fill-zinc-200 text-zinc-200 dark:fill-zinc-800 dark:text-zinc-800'}`}
                />
              ))}
            </div>
          </div>
          {item.commentText && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 italic line-clamp-3">
              "{item.commentText}"
            </p>
          )}
          <p className="text-xs text-zinc-400 mt-3">
            {item.submittedAt.toLocaleDateString()}
          </p>
        </li>
      ))}
    </ul>
  )
}
