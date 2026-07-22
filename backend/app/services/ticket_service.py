"""
Business logic for ticket operations.

Routes call these functions.
Services handle database operations and business rules.
"""

from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.ticket import Ticket, Note
from app.schemas.ticket import TicketCreate, TicketUpdate
from app.utils.enums import TicketStatus


def generate_ticket_id(db: Session) -> str:
    """
    Generate a unique ticket ID in format TKT-XXX.

    Uses the current count of tickets to produce sequential IDs.
    Note: This is not concurrency-safe — two simultaneous requests
    could get the same ID. In production, use a DB sequence or UUID.
    """
    count = db.query(Ticket).count()
    return f"TKT-{count + 1:03d}"


def _sanitize_string(value: str) -> str:
    """Strip whitespace from string inputs."""
    return value.strip()


def create_ticket(db: Session, ticket_data: TicketCreate) -> Ticket:
    """
    Create a new ticket in the database.

    Steps:
    1. Sanitize all string inputs
    2. Generate a unique ticket_id
    3. Create a Ticket ORM object with status defaulting to OPEN
    4. Add to session (in-memory)
    5. Commit to persist (disk write)
    6. Refresh to get server-generated values (id, timestamps)
    7. Return the created ticket
    """
    ticket_id = generate_ticket_id(db)

    ticket = Ticket(
        ticket_id=ticket_id,
        customer_name=_sanitize_string(ticket_data.customer_name),
        customer_email=_sanitize_string(ticket_data.customer_email),
        subject=_sanitize_string(ticket_data.subject),
        description=_sanitize_string(ticket_data.description),
        status=TicketStatus.OPEN.value,
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
    - search: case-insensitive match against customer_name,
              customer_email, subject, description, or ticket_id
    """
    query = db.query(Ticket)

    if status:
        query = query.filter(Ticket.status == status)

    if search:
        like_pattern = f"%{search.strip()}%"
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

    Returns None if no matching ticket is found.
    """
    return db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()


def update_ticket(
    db: Session,
    ticket: Ticket,
    update_data: TicketUpdate,
) -> Ticket:
    """
    Update a ticket's status and/or add a comment.

    1. If status is provided, set the ticket's status.
    2. If comment text is provided, create a new Note record.
    3. Commit all changes in a single transaction.
    4. Refresh the ticket to get updated timestamps.

    Both operations happen in one commit — if either fails,
    neither is persisted (atomic transaction).
    """
    if update_data.status is not None:
        ticket.status = update_data.status.value

    if update_data.comment is not None:
        comment_text = _sanitize_string(update_data.comment)
        if comment_text:  # Only create note if there's actual content
            note = Note(
                ticket_id=ticket.id,
                note_text=comment_text,
            )
            db.add(note)

    db.commit()
    db.refresh(ticket)

    return ticket