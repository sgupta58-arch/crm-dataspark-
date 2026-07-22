import type {
  TicketListItem,
  TicketDetail,
  TicketCreatePayload,
  TicketUpdatePayload,
  TicketUpdateResponse,
} from '../types/ticket'

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export function fetchTickets(status?: string, search?: string) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (search) params.set('search', search)
  const qs = params.toString()
  return request<TicketListItem[]>(`/api/tickets${qs ? `?${qs}` : ''}`)
}

export function fetchTicket(ticketId: string) {
  return request<TicketDetail>(`/api/tickets/${ticketId}`)
}

export function createTicket(payload: TicketCreatePayload) {
  return request<TicketDetail>('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateTicket(ticketId: string, payload: TicketUpdatePayload) {
  return request<TicketUpdateResponse>(`/api/tickets/${ticketId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}