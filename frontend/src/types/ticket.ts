export interface TicketListItem {
  ticket_id: string
  customer_name: string
  subject: string
  status: string
  created_at: string
}

export interface Note {
  id: number
  note_text: string
  created_by: string | null
  created_at: string
}

export interface TicketDetail {
  ticket_id: string
  customer_name: string
  customer_email: string
  subject: string
  description: string
  status: string
  created_at: string
  updated_at: string
  notes: Note[]
}

export interface TicketCreatePayload {
  customer_name: string
  customer_email: string
  subject: string
  description: string
}

export interface TicketUpdatePayload {
  status?: string
  note_text?: string
}

export interface TicketUpdateResponse {
  success: boolean
  updated_at: string
}