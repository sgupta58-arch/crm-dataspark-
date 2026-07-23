"""
FastAPI application entry point.

Initializes the app, creates database tables, and includes routers.
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import engine, Base
from app.routers import tickets

# Create all database tables that don't exist yet
# SQLAlchemy reads all models that inherit from Base
print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Database tables created successfully!")

app = FastAPI(
    title="Datastraw Support CRM",
    description="Customer Support Ticket Management System",
    version="1.0.0",
)

# Allow requests from any origin (for frontend access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the tickets router
app.include_router(tickets.router)


@app.get("/")
def root():
    """Health check endpoint."""
    return {"message": "Datastraw Support CRM API is running"}