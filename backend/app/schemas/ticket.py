"""
Pydantic schemas for Ticket API.

These schemas define:
1. What data we expect from the client (request)
2. What data we return to the client (response)
3. How data is validated at the API boundary
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field

from app.utils.enums import TicketStatus


class TicketCreate(BaseModel):
    """
    Schema for creating a new ticket.

    This is what the client sends in the POST request body.
    """

    customer_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Full name of the customer",
    )
    customer_email: EmailStr = Field(
        ...,
        description="Valid email address of the customer",
    )
    subject: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Short title of the issue",
    )
    description: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Detailed description of the issue",
    )


class TicketResponse(BaseModel):
    """
    Schema for returning ticket data after creation.

    Includes all fields including server-generated ones
    like ticket_id, status, and timestamps.
    """

    ticket_id: str = Field(
        ...,
        description="Unique ticket identifier (e.g., TKT-001)",
    )
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: TicketStatus = Field(
        default=TicketStatus.OPEN,
        description="Current ticket status",
    )
    created_at: datetime
    updated_at: datetime


class TicketListItem(BaseModel):
    """
    Schema for list view — lighter summary for table rows.

    Only includes fields shown in the dashboard table.
    """

    ticket_id: str
    customer_name: str
    subject: str
    status: TicketStatus
    created_at: datetime


class TicketUpdate(BaseModel):
    """
    Schema for updating a ticket's status and/or adding a note.

    All fields are optional — client only sends what they want to change.
    Field names match the PDF specification exactly (status, notes).
    """

    status: Optional[TicketStatus] = Field(
        default=None,
        description="New ticket status: Open, In Progress, or Closed",
    )
    notes: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Note text to attach to this ticket",
    )


class NoteResponse(BaseModel):
    """Schema for returning a single note on a ticket."""

    id: int
    note_text: str
    created_by: Optional[str] = None
    created_at: datetime


class TicketDetailResponse(BaseModel):
    """
    Schema for the detailed ticket view.

    Includes all ticket fields plus associated notes.
    The notes field name matches the PDF specification exactly.
    """

    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: TicketStatus
    created_at: datetime
    updated_at: datetime
    notes: List[NoteResponse] = Field(
        default=[],
        description="List of notes/comments on this ticket",
    )


class TicketUpdateResponse(BaseModel):
    """Schema returned after a successful ticket update."""

    success: bool = True
    updated_at: datetime