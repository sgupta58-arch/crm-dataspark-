import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchTickets } from '../api/tickets'
import type { TicketListItem } from '../types/ticket'

interface Props {
  onSelect: (ticketId: string) => void
  onCreateNew: () => void
}

const STATUS_OPTIONS = ['', 'Open', 'In Progress', 'Closed'] as const

const STATUS_BADGES: Record<string, { bg: string; text: string; dot: string }> = {
  'Open': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'In Progress': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Closed': { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
}

export default function TicketList({ onSelect, onCreateNew }: Props) {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  const { data: tickets, isLoading, isError, error } = useQuery<TicketListItem[]>({
    queryKey: ['tickets', status, search],
    queryFn: () => fetchTickets(status || undefined, search || undefined),
  })

  // Stats summary
  const openCount = tickets?.filter(t => t.status === 'Open').length ?? 0
  const inProgressCount = tickets?.filter(t => t.status === 'In Progress').length ?? 0
  const closedCount = tickets?.filter(t => t.status === 'Closed').length ?? 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track support requests</p>
        </div>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all font-medium text-sm cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Ticket
        </button>
      </div>

      {/* Stats Cards */}
      {tickets && tickets.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Open', count: openCount, color: 'border-emerald-500 bg-emerald-50' },
            { label: 'In Progress', count: inProgressCount, color: 'border-amber-500 bg-amber-50' },
            { label: 'Closed', count: closedCount, color: 'border-gray-400 bg-gray-50' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-lg border-l-4 ${stat.color} p-4 bg-white shadow-sm`}
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.count}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, ID, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white min-w-[140px]"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.filter(Boolean).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading tickets...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          Failed to load tickets: {(error as Error).message}
        </div>
      )}

      {/* Empty State */}
      {tickets && tickets.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No tickets found</h3>
          <p className="text-gray-500 text-sm mb-6">
            {search || status ? 'Try adjusting your search or filter criteria.' : 'Get started by creating your first support ticket.'}
          </p>
          {!search && !status && (
            <button
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-medium text-sm cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create First Ticket
            </button>
          )}
        </div>
      )}

      {/* Table */}
      {tickets && tickets.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.map((t, i) => {
                  const badge = STATUS_BADGES[t.status] || STATUS_BADGES['Open']
                  return (
                    <tr
                      key={t.ticket_id}
                      onClick={() => onSelect(t.ticket_id)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                          {t.ticket_id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {t.customer_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{t.customer_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{t.subject}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(t.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 text-sm text-gray-500">
            Showing {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
            {(search || status) && ' (filtered)'}
          </div>
        </div>
      )}
    </div>
  )
}