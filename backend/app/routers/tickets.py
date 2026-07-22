"""
API routes for ticket operations.

Each function maps to an HTTP endpoint.
These routes are thin — they delegate to the service layer
for all business logic.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.ticket import (
    TicketCreate,
    TicketResponse,
    TicketListItem,
    TicketDetailResponse,
    TicketUpdate,
    TicketUpdateResponse,
)
from app.services.ticket_service import (
    create_ticket,
    list_tickets,
    get_ticket_by_ticket_id,
    update_ticket,
)

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])


@router.post("", response_model=TicketResponse, status_code=201)
def create_new_ticket(
    ticket_data: TicketCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new support ticket.

    Accepts customer_name, customer_email, subject, and description.
    Returns the created ticket with auto-generated ticket_id and timestamp.
    """
    ticket = create_ticket(db=db, ticket_data=ticket_data)
    return ticket


@router.get("", response_model=list[TicketListItem])
def list_all_tickets(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    List all tickets with optional filters.

    - **status**: Filter by Open, In Progress, or Closed
    - **search**: Case-insensitive search across name, email, subject, description, and ticket ID
    """
    tickets = list_tickets(db=db, status=status, search=search)
    return tickets


@router.get("/{ticket_id}", response_model=TicketDetailResponse)
def get_ticket_detail(
    ticket_id: str,
    db: Session = Depends(get_db),
):
    """
    Get full details of a single ticket including all comments.

    - **ticket_id**: The human-readable ID (e.g., TKT-001)
    """
    ticket = get_ticket_by_ticket_id(db=db, ticket_id=ticket_id)

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail=f"Ticket {ticket_id} not found",
        )

    return ticket


@router.put("/{ticket_id}", response_model=TicketUpdateResponse)
def update_existing_ticket(
    ticket_id: str,
    update_data: TicketUpdate,
    db: Session = Depends(get_db),
):
    """
    Update a ticket's status and/or add a comment.

    - **ticket_id**: The human-readable ID (e.g., TKT-001)
    - **update_data**: JSON body with optional status and/or comment fields
    """
    ticket = get_ticket_by_ticket_id(db=db, ticket_id=ticket_id)

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail=f"Ticket {ticket_id} not found",
        )

    updated_ticket = update_ticket(db=db, ticket=ticket, update_data=update_data)

    return {
        "success": True,
        "updated_at": updated_ticket.updated_at,
    }