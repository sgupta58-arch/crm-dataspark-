"""
Business logic for ticket operations.

Routes call these functions.
Services handle database operations and business rules.
"""

from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.ticket import Ticket, Note
from app.schemas.ticket import TicketCreate, TicketUpdate


def generate_ticket_id(db: Session) -> str:
    """
    Generate a unique ticket ID in format TKT-XXX.

    Counts existing tickets and increments by 1.
    Example: if 5 tickets exist, returns TKT-006.
    """
    count = db.query(Ticket).count()
    return f"TKT-{count + 1:03d}"


def create_ticket(db: Session, ticket_data: TicketCreate) -> Ticket:
    """
    Create a new ticket in the database.

    Steps:
    1. Generate a unique ticket_id
    2. Create a Ticket ORM object
    3. Add to session
    4. Commit to persist
    5. Refresh to get server-generated values (id, timestamps)
    6. Return the created ticket
    """
    ticket_id = generate_ticket_id(db)

    ticket = Ticket(
        ticket_id=ticket_id,
        customer_name=ticket_data.customer_name,
        customer_email=ticket_data.customer_email,
        subject=ticket_data.subject,
        description=ticket_data.description,
        status="Open",
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return ticket


def list_tickets(
    db: Session,
    status: Optional[str] = None,
    search: Optional[str] = None,
) -> List[Ticket]:
    """
    List tickets with optional status filter and search.

    - status: filter by Open/In Progress/Closed
    - search: match against customer_name, customer_email, subject,
              description, or ticket_id (case-insensitive)
    """
    query = db.query(Ticket)

    if status:
        query = query.filter(Ticket.status == status)

    if search:
        like_pattern = f"%{search}%"
        query = query.filter(
            Ticket.customer_name.ilike(like_pattern)
            | Ticket.customer_email.ilike(like_pattern)
            | Ticket.subject.ilike(like_pattern)
            | Ticket.description.ilike(like_pattern)
            | Ticket.ticket_id.ilike(like_pattern)
        )

    return query.order_by(Ticket.created_at.desc()).all()


def get_ticket_by_ticket_id(db: Session, ticket_id: str) -> Optional[Ticket]:
    """
    Get a single ticket by its human-readable ticket_id (TKT-XXX).

    Returns None if not found.
    """
    return db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()


def update_ticket(
    db: Session,
    ticket: Ticket,
    update_data: TicketUpdate,
) -> Ticket:
    """
    Update a ticket's status and/or add a note.

    1. If status is provided, update it.
    2. If note_text is provided, create a new Note record linked to this ticket.
    3. Commit and refresh.
    """
    if update_data.status is not None:
        ticket.status = update_data.status

    if update_data.note_text is not None:
        note = Note(
            ticket_id=ticket.id,
            note_text=update_data.note_text,
        )
        db.add(note)

    db.commit()
    db.refresh(ticket)

    return ticket