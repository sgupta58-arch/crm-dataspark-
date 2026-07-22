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


class TicketCreate(BaseModel):
    """
    Schema for creating a new ticket.

    This is what the client sends in the POST request body.
    """

    customer_name: str = Field(
        ...,  # "..." means required (ellipsis)
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
    Schema for returning ticket data to the client.

    This includes all fields including server-generated ones
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
    status: str = Field(
        default="Open",
        description="Current status: Open, In Progress, or Closed",
    )
    created_at: datetime
    updated_at: datetime


class TicketListItem(BaseModel):
    """
    Schema for list view — lighter than full response.

    Only includes fields shown in the table/list.
    """

    ticket_id: str
    customer_name: str
    subject: str
    status: str
    created_at: datetime


class TicketUpdate(BaseModel):
    """
    Schema for updating a ticket.

    All fields are optional — client only sends what they want to change.
    """

    status: Optional[str] = Field(
        default=None,
        description="New status: Open, In Progress, or Closed",
    )
    note_text: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Note/comment to add to the ticket",
    )


class NoteResponse(BaseModel):
    """Schema for returning a note."""

    id: int
    note_text: str
    created_by: Optional[str] = None
    created_at: datetime


class TicketDetailResponse(BaseModel):
    """
    Schema for the detailed ticket view.

    Includes all ticket fields plus associated notes.
    """

    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime
    notes: List[NoteResponse] = []


class TicketUpdateResponse(BaseModel):
    """Schema returned after a successful update."""

    success: bool = True
    updated_at: datetime
