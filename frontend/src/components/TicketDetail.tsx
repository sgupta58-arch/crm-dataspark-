import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTicket, updateTicket } from '../api/tickets'
import { STATUS_BADGES } from '../constants'
import type { TicketDetail as TicketDetailType, TicketUpdatePayload } from '../types/ticket'

interface Props {
  ticketId: string
  onBack: () => void
}

export default function TicketDetail({ ticketId, onBack }: Props) {
  const queryClient = useQueryClient()
  const [newStatus, setNewStatus] = useState('')
  const [commentText, setCommentText] = useState('')

  const { data: ticket, isLoading } = useQuery<TicketDetailType>({
    queryKey: ['ticket', ticketId],
    queryFn: () => fetchTicket(ticketId),
  })

  const mutation = useMutation({
    mutationFn: (payload: TicketUpdatePayload) =>
      updateTicket(ticketId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      setNewStatus('')
      setCommentText('')
    },
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading ticket...</p>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-medium">Ticket not found</p>
        <button onClick={onBack} className="mt-3 text-sm text-blue-600 hover:underline cursor-pointer">
          &larr; Back to tickets
        </button>
      </div>
    )
  }

  const badge = STATUS_BADGES[ticket.status] || STATUS_BADGES['Open']

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: TicketUpdatePayload = {}
    if (newStatus) payload.status = newStatus as TicketDetailType['status']
    if (commentText.trim()) payload.comment = commentText.trim()
    if (Object.keys(payload).length > 0) mutation.mutate(payload)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to tickets
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                  {ticket.status}
                </span>
              </div>
              <p className="font-mono text-sm text-gray-400">{ticket.ticket_id}</p>
            </div>
          </div>

          {/* Customer Info Grid */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {ticket.customer_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p className="text-sm font-medium text-gray-900">{ticket.customer_name}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm text-gray-700">{ticket.customer_email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Created</p>
              <p className="text-sm text-gray-700">{new Date(ticket.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last Updated</p>
              <p className="text-sm text-gray-700">{new Date(ticket.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
        </div>

        {/* Update Form */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Update Ticket</h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-700 font-medium min-w-[80px]">Status:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
              >
                <option value="">Keep current</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700 font-medium block mb-1.5">Add a comment:</label>
              <textarea
                placeholder="Type your comment here..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-y"
              />
            </div>
            <button
              type="submit"
              disabled={mutation.isPending || (!newStatus && !commentText.trim())}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-sm transition-all cursor-pointer"
            >
              {mutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Updating...
                </>
              ) : (
                'Update Ticket'
              )}
            </button>
            {mutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {(mutation.error as Error).message}
              </div>
            )}
          </form>
        </div>

        {/* Comments Section */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Comments {ticket.comments.length > 0 && <span className="text-gray-400">({ticket.comments.length})</span>}
          </h3>
          {ticket.comments.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <p className="text-sm text-gray-400">No comments yet. Add one above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ticket.comments.map((comment, idx) => (
                <div
                  key={comment.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.comment_text}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(comment.created_at).toLocaleString()}
                        {comment.created_by && ` — by ${comment.created_by}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}