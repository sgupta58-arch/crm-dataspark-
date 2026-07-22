"""
Application-wide enumerations.

Using Python Enum prevents magic strings and makes status values
discoverable and type-safe.
"""

from enum import Enum


class TicketStatus(str, Enum):
    """
    Valid statuses for a support ticket.

    Inheriting from str AND Enum makes values JSON-serializable
    automatically (FastAPI can return them in responses).
    """

    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    CLOSED = "Closed"