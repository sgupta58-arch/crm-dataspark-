"""
Database connection and session management.

SQLAlchemy uses an "Engine" to talk to the database.
A "Session" is a transactional workspace for operations.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite database file path
# The "///" means relative to the current directory
DATABASE_URL = "sqlite:///./crm.db"

# Create the engine — this is the connection factory
# connect_args is SQLite-specific: allows concurrent reads
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# SessionLocal is a factory that creates new database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is the parent class for all ORM models
# SQLAlchemy reads the attributes of Base subclasses to create tables
Base = declarative_base()


def get_db():
    """
    Dependency that provides a database session.

    Used by FastAPI routes via Depends().
    Ensures the session is closed after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()