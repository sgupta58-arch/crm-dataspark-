"""
SQLAlchemy ORM models for the Ticket and Note tables.

Each class maps to a database table.
Each attribute maps to a column in that table.
"""

import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database.connection import Base


class Ticket(Base):
    """Represents a support ticket."""

    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String, unique=True, index=True, nullable=False)
    customer_name = Column(String(100), nullable=False)
    customer_email = Column(String(100), nullable=False)
    subject = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), default="Open", nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationship: one Ticket has many Notes
    notes = relationship("Note", back_populates="ticket", cascade="all, delete-orphan")


class Note(Base):
    """Represents a note/comment on a ticket."""

    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    note_text = Column(Text, nullable=False)
    created_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationship: each Note belongs to one Ticket
    ticket = relationship("Ticket", back_populates="notes")