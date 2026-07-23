"""
Database connection and session management.

SQLAlchemy uses an "Engine" to talk to the database.
A "Session" is a transactional workspace for operations.
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Database URL from environment variable
# Defaults to SQLite for local development
# For production (Vercel), set DATABASE_URL to PostgreSQL connection string
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./crm.db"  # Default for local development
)

# Create the engine — this is the connection factory
# SQLite needs check_same_thread=False for concurrent reads
# PostgreSQL doesn't need this flag
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
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