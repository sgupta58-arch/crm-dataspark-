# Datastraw Support CRM

A full-stack customer support ticket management system. Support agents can create tickets, search and filter through them, view detailed ticket information, update statuses, and add internal comments.

Built for the Datastraw Technologies internship assessment. The application is deployed and fully functional.

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | [https://your-frontend.vercel.app](https://your-frontend.vercel.app) |
| Backend API | [https://your-backend.railway.app](https://your-backend.railway.app) |
| API Documentation | [https://your-backend.railway.app/docs](https://your-backend.railway.app/docs) |
| Demo Video | [YouTube link] |

---

## Screenshots

| Screenshot | What it shows |
|------------|---------------|
| `screenshots/dashboard.png` | Ticket list with stats cards (Open / In Progress / Closed counts), search bar, and status filter |
| `screenshots/create-ticket.png` | Create ticket form with customer name, email, subject, and description fields |
| `screenshots/ticket-detail.png` | Full ticket detail view with customer info, description, status badge, and comments |
| `screenshots/update-status.png` | Update form with status dropdown and comment textarea |
| `screenshots/search-filter.png` | Search results filtered by a keyword, showing matching tickets |
| `screenshots/empty-state.png` | Empty state view when no tickets match the search criteria |
| `screenshots/mobile-view.png` | Responsive layout on a mobile screen |

---

## Features

### Core Features

- **Create Tickets** — Submit a support ticket with customer name, email, subject, and description. Auto-generates a ticket ID (e.g., `TKT-004`) and timestamp.
- **List All Tickets** — Paginated table view displaying ticket ID, customer name, subject, status, and creation date.
- **Search Tickets** — Real-time search across ticket ID, customer name, email, subject, and description. Debounced to avoid excessive API calls.
- **Filter by Status** — Dropdown filter to show tickets by Open, In Progress, or Closed status.
- **View Ticket Details** — Full detail page showing all ticket fields, timestamps, and associated comments.
- **Update Status** — Change ticket status between Open, In Progress, and Closed.
- **Add Comments** — Attach internal comments to a ticket during status updates. Comments are stored in a separate table and displayed chronologically.

### Additional Features

- **Status Summary Cards** — Dashboard shows counts of Open, In Progress, and Closed tickets at a glance.
- **Input Sanitization** — All string inputs are stripped of leading/trailing whitespace before storage.
- **Typed Status Enum** — Ticket statuses use a Python `Enum` instead of magic strings, preventing typos.
- **Debounced Search** — Custom `useDebounce` hook delays API calls until the user stops typing.
- **Loading, Empty, and Error States** — Every frontend component handles loading spinners, empty data, and API errors gracefully.
- **Responsive Design** — UI adapts to mobile, tablet, and desktop screen sizes.
- **Auto-generated Timestamps** — `created_at` and `updated_at` are managed by SQLAlchemy defaults.
- **CORS Support** — Backend allows cross-origin requests from any frontend domain.

### Future Improvements

- User authentication and role-based access
- Email notifications on ticket creation and status changes
- Pagination for large ticket volumes
- File attachments on tickets
- Dashboard analytics and reporting
- Audit log for ticket changes
- PostgreSQL support for production
- Docker containerization

---

## Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 19** | UI component library |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Build tool and dev server |
| **Tailwind CSS v4** | Utility-first CSS framework |
| **TanStack Query v5** | Server state management, caching, and cache invalidation |

**Why React with TypeScript:** React's component model maps naturally to the page structure (list, create, detail). TypeScript catches type mismatches between the API responses and UI components at compile time rather than runtime.

**Why TanStack Query:** It handles loading states, error states, background refetching, and cache invalidation automatically. When a ticket is updated, `invalidateQueries` triggers a refetch of the list without manual state management.

**Why Tailwind CSS:** Utility classes keep the component files self-contained. No separate CSS files to maintain for each component.

### Backend

| Technology | Purpose |
|------------|---------|
| **Python 3.12** | Runtime |
| **FastAPI** | Web framework |
| **SQLAlchemy 2.0** | ORM |
| **Pydantic v2** | Data validation and serialization |
| **SQLite** | Database engine |
| **Uvicorn** | ASGI server |

**Why FastAPI:** Automatic request validation through Pydantic, auto-generated OpenAPI documentation at `/docs`, and dependency injection for database sessions. Reduces boilerplate compared to Flask.

**Why SQLAlchemy:** Database-agnostic ORM. Models are defined as Python classes. Switching to PostgreSQL requires only changing the connection string.

**Why SQLite:** Zero configuration. Entire database is a single file. Perfect for an MVP where database setup time should be zero.

**Why Pydantic:** Defines the API contract in code. Incoming JSON is validated against schemas automatically. Invalid requests receive a structured 422 response without manual validation code.

### Deployment

| Service | Hosts |
|---------|-------|
| **Railway** | Backend API (FastAPI + Uvicorn) |
| **Vercel** | Frontend (Vite + React) |
| **GitHub** | Source code repository |

---

## Project Architecture

```
Browser (React SPA)
     │
     ▼
  ┌────────────────────────────────────┐
  │         Frontend (Vite)            │
  │                                    │
  │  Components (List, Create, Detail) │
  │         │                          │
  │         ▼                          │
  │    TanStack Query                  │
  │    (useQuery / useMutation)        │
  │         │                          │
  │         ▼                          │
  │    API Client (api/tickets.ts)     │
  └────────────┬───────────────────────┘
               │ HTTP (fetch)
               ▼
  ┌────────────────────────────────────┐
  │       Backend (FastAPI)            │
  │                                    │
  │  Router (routers/tickets.py)       │
  │         │                          │
  │         ▼                          │
  │  Pydantic Validation (schemas)     │
  │         │                          │
  │         ▼                          │
  │  Service Layer (services/)         │
  │         │                          │
  │         ▼                          │
  │  SQLAlchemy ORM (models/)          │
  │         │                          │
  │         ▼                          │
  │  SQLite (crm.db)                   │
  └────────────────────────────────────┘
               │
               ▼
          JSON Response
               │
               ▼
     React UI re-renders
```

### Layer Descriptions

1. **React Components** — Three pages: list (table with search/filter), create (form), and detail (view with update form). Navigation managed by a `useState` view switcher in `App.tsx`.

2. **TanStack Query** — `useQuery` fetches data and caches it. `useMutation` sends updates and invalidates the cache on success so the UI stays in sync.

3. **API Client** — A single generic `request<T>` function in `api/tickets.ts` handles all HTTP calls. Sets `Content-Type`, parses errors, and returns typed responses.

4. **FastAPI Router** — Defines the 4 endpoints. Each function is thin — it receives the validated request, delegates to the service, and returns the response.

5. **Pydantic Schemas** — Define the shape of request bodies and response bodies. Validation happens at the router boundary before any service code runs.

6. **Service Layer** — Contains business logic: ticket ID generation, input sanitization, search query construction, and transactional updates.

7. **SQLAlchemy Models** — Map Python classes to database tables. `Ticket` and `Note` have a one-to-many relationship via foreign key.

8. **SQLite** — Stores data in a single `crm.db` file. Created automatically on first run.

---

## Folder Structure

```
datastraw-crm/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI app entry point, CORS, router registration
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   └── connection.py        # Engine, Session factory, get_db dependency
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── ticket.py            # Ticket and Note ORM models
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── ticket.py            # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   └── tickets.py           # API route definitions
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── ticket_service.py    # Business logic layer
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   └── enums.py             # TicketStatus enum
│   │   └── core/                    # Reserved for future configuration
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── tickets.ts           # HTTP client with generic request wrapper
│   │   ├── components/
│   │   │   ├── TicketList.tsx        # Dashboard table with search and filter
│   │   │   ├── TicketCreate.tsx      # Ticket creation form
│   │   │   └── TicketDetail.tsx      # Ticket detail with update form and comments
│   │   ├── hooks/
│   │   │   └── useDebounce.ts        # Custom debounce hook for search
│   │   ├── types/
│   │   │   └── ticket.ts             # TypeScript interfaces matching API schemas
│   │   ├── constants.ts              # Shared constants (status badges, options)
│   │   ├── App.tsx                   # Root component with view routing
│   │   ├── main.tsx                  # React entry point with QueryClientProvider
│   │   └── index.css                 # Tailwind import and custom theme
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── .gitignore
└── README.md
```

### Key Folder Explanations

- **`backend/app/routers/`** — Defines HTTP endpoints. Each file corresponds to a resource (e.g., tickets). Routes are thin and delegate to services.
- **`backend/app/services/`** — Business logic. Isolated from HTTP concerns, making it testable without a server.
- **`backend/app/schemas/`** — Pydantic models that define the API contract. Separate from database models to avoid exposing internal schema details.
- **`backend/app/models/`** — SQLAlchemy ORM models that map to database tables. Changes here affect the database schema.
- **`backend/app/database/`** — Database engine configuration and session management. The `get_db` generator is used as a FastAPI dependency.
- **`frontend/src/components/`** — Each page is a single component. Shared UI patterns (badges, buttons) are inline with Tailwind.
- **`frontend/src/api/`** — Centralized HTTP client. All API calls go through a single `request<T>` function for consistent error handling.

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────────────┐       ┌─────────────────────┐
│       tickets       │       │       notes         │
├─────────────────────┤       ├─────────────────────┤
│ id (PK, auto-inc)   │◄──────│ ticket_id (FK)      │
│ ticket_id (UNIQUE)  │       │ id (PK, auto-inc)   │
│ customer_name       │       │ note_text           │
│ customer_email      │       │ created_by          │
│ subject             │       │ created_at          │
│ description         │       └─────────────────────┘
│ status              │
│ created_at          │
│ updated_at          │
└─────────────────────┘
```

### Tickets Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | PK, auto-increment | Internal database ID |
| `ticket_id` | String | UNIQUE, NOT NULL, indexed | Human-readable ID (e.g., `TKT-004`) |
| `customer_name` | String(100) | NOT NULL | Customer full name |
| `customer_email` | String(100) | NOT NULL | Customer email address |
| `subject` | String(200) | NOT NULL | Short issue title |
| `description` | Text | NOT NULL | Detailed issue description |
| `status` | String(20) | NOT NULL, default `Open` | One of: Open, In Progress, Closed |
| `created_at` | DateTime | NOT NULL, auto-generated | Timestamp of creation |
| `updated_at` | DateTime | NOT NULL, auto-updated | Timestamp of last update |

### Notes Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | PK, auto-increment | Internal database ID |
| `ticket_id` | Integer | FK → tickets.id, NOT NULL | Parent ticket |
| `note_text` | Text | NOT NULL | Comment content |
| `created_by` | String(100) | NULLABLE | Who added the comment (reserved for future use) |
| `created_at` | DateTime | NOT NULL, auto-generated | Timestamp of comment |

### Design Decisions

- **Two tables, not one.** Comments are stored in a separate table because a ticket can have multiple comments. Storing comments as a JSON column would make querying individual comments harder.
- **Separate `id` and `ticket_id`.** The `id` is an auto-incrementing integer for internal joins. The `ticket_id` (`TKT-004`) is for customer-facing display. This allows sequential human-readable IDs without exposing the internal key.
- **`updated_at` uses `onupdate`.** SQLAlchemy's `onupdate` automatically sets the timestamp on every row update. No manual timestamp management needed.
- **Cascade delete on notes.** When a ticket is deleted, all its notes are deleted automatically (`cascade="all, delete-orphan"`).
- **The API exposes `comment`, the DB stores `note_text`.** Pydantic field aliases map between the two, avoiding a database migration while keeping the API terminology consistent.

---

## API Documentation

### Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | `/api/tickets` | Create a new ticket | `{ customer_name, customer_email, subject, description }` | `{ ticket_id, customer_name, customer_email, subject, description, status, created_at, updated_at }` |
| GET | `/api/tickets` | List all tickets | Query params: `?status=Open&search=alice` | `[{ ticket_id, customer_name, subject, status, created_at }]` |
| GET | `/api/tickets/{ticket_id}` | Get ticket details | — | `{ ticket_id, customer_name, customer_email, subject, description, status, created_at, updated_at, comments }` |
| PUT | `/api/tickets/{ticket_id}` | Update status / add comment | `{ status?, comment? }` | `{ success: true, updated_at }` |

### POST /api/tickets

Creates a new support ticket.

```json
// Request
{
  "customer_name": "Jane Smith",
  "customer_email": "jane@company.com",
  "subject": "Unable to access billing dashboard",
  "description": "Getting a 403 error when trying to view invoices."
}

// Response (201 Created)
{
  "ticket_id": "TKT-004",
  "customer_name": "Jane Smith",
  "customer_email": "jane@company.com",
  "subject": "Unable to access billing dashboard",
  "description": "Getting a 403 error when trying to view invoices.",
  "status": "Open",
  "created_at": "2026-07-23T08:30:00",
  "updated_at": "2026-07-23T08:30:00"
}
```

### GET /api/tickets

Returns all tickets, with optional filtering and search.

```json
// Query params: ?status=Open&search=billing
// Response (200 OK)
[
  {
    "ticket_id": "TKT-004",
    "customer_name": "Jane Smith",
    "subject": "Unable to access billing dashboard",
    "status": "Open",
    "created_at": "2026-07-23T08:30:00"
  }
]
```

### GET /api/tickets/{ticket_id}

Returns full ticket details including all comments.

```json
// Request: GET /api/tickets/TKT-004
// Response (200 OK)
{
  "ticket_id": "TKT-004",
  "customer_name": "Jane Smith",
  "customer_email": "jane@company.com",
  "subject": "Unable to access billing dashboard",
  "description": "Getting a 403 error when trying to view invoices.",
  "status": "In Progress",
  "created_at": "2026-07-23T08:30:00",
  "updated_at": "2026-07-23T09:15:00",
  "comments": [
    {
      "id": 1,
      "comment_text": "Investigated the issue. It's a permission problem.",
      "created_by": null,
      "created_at": "2026-07-23T09:15:00"
    }
  ]
}

// Response if not found (404)
{
  "detail": "Ticket TKT-999 not found"
}
```

### PUT /api/tickets/{ticket_id}

Updates a ticket's status and/or adds a comment. Both fields are optional — send only what needs to change.

```json
// Request
{
  "status": "In Progress",
  "comment": "Assigned to engineering team for investigation."
}

// Response (200 OK)
{
  "success": true,
  "updated_at": "2026-07-23T09:15:00"
}
```

---

## Request Lifecycle

Here is exactly what happens when a user creates a ticket through the browser:

### Step-by-step trace

**1. User fills the form and clicks "Create Ticket"** (TicketCreate.tsx)

The component collects form data into a `TicketCreatePayload` object and calls `mutation.mutate(form)`. TanStack Query's `useMutation` fires the `createTicket` function.

**2. Frontend sends HTTP request** (api/tickets.ts)

```
POST /api/tickets
Content-Type: application/json

{
  "customer_name": "Jane Smith",
  "customer_email": "jane@company.com",
  "subject": "Billing issue",
  "description": "Cannot access invoices"
}
```

The generic `request<T>` function prefixes the URL with `VITE_API_URL` (or `http://127.0.0.1:8000` in development), sets the JSON content type, and calls `fetch()`.

**3. FastAPI matches the route** (routers/tickets.py)

Uvicorn (the ASGI server) receives the raw HTTP request and passes it to FastAPI. FastAPI matches `POST /api/tickets` to the `create_new_ticket` function.

**4. Dependency injection creates a database session** (database/connection.py)

Before the route function runs, FastAPI calls `get_db()`. This creates a new SQLAlchemy `Session` and yields it. The route receives the session as the `db` parameter.

**5. Pydantic validates the request body** (schemas/ticket.py)

FastAPI sees the `ticket_data: TicketCreate` type hint and parses the JSON body into a `TicketCreate` instance. Pydantic validates:
- `customer_name` is a non-empty string (max 100 characters)
- `customer_email` is a valid email format
- `subject` is a non-empty string (max 200 characters)
- `description` is a non-empty string (max 2000 characters)

If validation fails, FastAPI returns HTTP 422 with details about which field failed and why.

**6. Service layer creates the ticket** (services/ticket_service.py)

The route calls `create_ticket(db, ticket_data)`:

1. `generate_ticket_id()` counts existing tickets in the database and returns `TKT-{count + 1:03d}` (e.g., `TKT-004`)
2. `_sanitize_string()` strips whitespace from every input field
3. A `Ticket` ORM object is created in memory with `status=TicketStatus.OPEN.value`
4. `db.add(ticket)` registers the object with the session (memory only)
5. `db.commit()` executes `INSERT INTO tickets ...` on SQLite (disk write)
6. `db.refresh(ticket)` executes a `SELECT` to load server-generated values (the auto-increment `id` and default timestamps) back into the Python object

**7. Response is serialized and returned**

FastAPI takes the returned `Ticket` ORM object and passes it through the `TicketResponse` Pydantic schema. This converts the SQLAlchemy object to a dict, serializes `datetime` fields to ISO 8601 strings, and returns JSON with status code 201.

**8. Frontend handles the response**

`createTicket` resolves with the JSON data. `useMutation` triggers `onSuccess`, which:
1. Calls `queryClient.invalidateQueries(['tickets'])` — marks the ticket list cache as stale so the next visit refetches
2. Calls `onCreated(data.ticket_id)` — navigates the user to the detail page for the new ticket

**9. Detail page loads**

The `TicketDetail` component mounts, calls `fetchTicket(ticketId)` via `useQuery`, and renders the full ticket information.

---

## Local Setup

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- npm 9 or higher
- Git

### Clone the Repository

```bash
git clone https://github.com/your-username/datastraw-crm.git
cd datastraw-crm
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=sqlite:///./crm.db
CORS_ORIGINS=http://localhost:5173
HOST=0.0.0.0
PORT=8000
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://127.0.0.1:8000
```

### Run Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

The API is now available at `http://127.0.0.1:8000`. Interactive API documentation is at `http://127.0.0.1:8000/docs`.

### Run Frontend

```bash
cd frontend
npm run dev
```

The frontend is now available at `http://localhost:5173`.

### Verify the Setup

1. Open `http://localhost:5173` in your browser
2. You should see the Datastraw Support CRM dashboard
3. Click "New Ticket" and create a test ticket
4. The ticket should appear in the list

### Common Issues

**Issue: `pip install` fails with "externally-managed-environment"**

Solution: Use a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Issue: Frontend shows blank page or network errors**

Solution: Ensure the backend is running on port 8000. Check that `VITE_API_URL` is set correctly in `frontend/.env`.

**Issue: Database errors on startup**

Solution: Delete `backend/crm.db` and restart the backend. The tables will be recreated automatically.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | No | `sqlite:///./crm.db` | Database connection string. Use `sqlite:///./crm.db` for development. For production, set to a PostgreSQL URL. |
| `CORS_ORIGINS` | No | `http://localhost:5173` | Comma-separated list of allowed frontend origins. |
| `HOST` | No | `0.0.0.0` | Host address for the server. |
| `PORT` | No | `8000` | Port for the server. |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `http://127.0.0.1:8000` | Base URL of the backend API. In production, set to your Railway URL. |

---

## Design Decisions

### Why FastAPI?

FastAPI uses Python type hints to automatically validate request bodies and generate OpenAPI documentation. The same type annotations that make the code readable also define the API contract. Compared to Flask, FastAPI eliminates manual validation code and provides interactive API docs at `/docs` with zero configuration.

The dependency injection system (`Depends`) is the key architectural feature. The `get_db` function creates a database session before the route runs and automatically closes it after the response is sent — even if an error occurs. This pattern is consistent across all routes and eliminates connection leak bugs.

### Why React with TypeScript?

React's component model maps directly to the page structure: a list page, a create form page, and a detail page. Each component is self-contained with its own state and data fetching.

TypeScript ensures that the data shapes used in the frontend match the API responses. The `TicketListItem`, `TicketDetail`, and `TicketCreatePayload` interfaces mirror the Pydantic schemas on the backend. If the API contract changes, TypeScript catches type mismatches at compile time.

### Why TanStack Query instead of useState + useEffect?

TanStack Query provides three things that manual state management requires custom code for:

1. **Caching** — Previously fetched data is cached. Navigating back to the list from a detail page shows cached data instantly while refetching in the background.
2. **Cache invalidation** — After a mutation (create or update), `invalidateQueries` marks related caches as stale. The next visit automatically fetches fresh data.
3. **Request deduplication** — If a component remounts while a fetch is in progress, TanStack Query reuses the existing request instead of starting a new one.

### Why SQLAlchemy instead of raw SQL?

SQLAlchemy abstracts database differences. The models are plain Python classes, and queries are constructed using Python operators rather than string concatenation. The search query in `list_tickets()` uses `Ticket.customer_name.ilike()` instead of `WHERE customer_name LIKE %s` — this works identically across SQLite, PostgreSQL, and MySQL without modification.

The ORM also handles relationship loading automatically. When fetching a ticket with its comments, SQLAlchemy's relationship loading retrieves the related `Note` rows and attaches them to the `Ticket.notes` attribute without a manual join query.

### Why a service layer between routes and models?

The service layer isolates business logic from HTTP concerns. The `create_ticket` function handles ticket ID generation and input sanitization. The `list_tickets` function constructs search queries. The `update_ticket` function manages transactional updates.

Without the service layer, this logic would live in the router functions. This would make it impossible to unit-test business logic without making HTTP calls, and would require duplicating logic across routes that need the same operations.

### Why separate schemas from models?

Pydantic schemas define the API contract — what data the API accepts and returns. SQLAlchemy models define the database schema — what data is stored and how tables relate.

These are different concerns. The `TicketCreate` schema omits `status` because the server sets it automatically. The `TicketResponse` schema includes `ticket_id` and timestamps. The `TicketListItem` schema is a subset of fields for the table view. Using the same schema for all three would either expose internal fields to the client or require the client to send fields it shouldn't control.

The `CommentResponse` schema uses a field alias (`comment_text` with `alias="note_text"`) to expose a cleaner API while the database column retains its original name. This separation allows the API and database to evolve independently.

---

## Challenges Faced

### 1. Ticket ID Generation Race Condition

**Problem:** The `generate_ticket_id` function counts existing tickets and adds one. If two requests arrive simultaneously, both could compute the same count and receive the same ticket ID.

**Solution:** Documented the limitation in the code with a note about using database sequences or UUIDs in production. For the MVP, the likelihood of two concurrent requests is low.

**Lesson Learned:** Always consider concurrency when generating identifiers. Counting rows is not atomic in SQLite without a transaction lock.

### 2. CORS Configuration

**Problem:** The frontend running on `localhost:5173` couldn't make requests to the backend on `localhost:8000` because browsers block cross-origin requests by default.

**Solution:** Added FastAPI's `CORSMiddleware` with `allow_origins=["*"]` to allow all origins during development. In production, this is restricted to the specific frontend domain.

**Lesson Learned:** CORS is a browser security mechanism, not an API security mechanism. It only affects browser-based clients. API clients like Postman or curl are not affected.

### 3. Frontend State Synchronization

**Problem:** After updating a ticket's status on the detail page, navigating back to the list showed the old status because the list component was using cached data.

**Solution:** TanStack Query's `invalidateQueries` with the `['tickets']` query key. After every mutation, the list cache is marked as stale and automatically refetched.

**Lesson Learned:** Client-side caching improves performance but introduces staleness. Cache invalidation must be explicit after write operations.

### 4. Terminology Inconsistency

**Problem:** The initial code used `note_text` in the database and API inconsistently. Some places called them "notes", others "comments".

**Solution:** Standardized on "comment" for the API and frontend. Used Pydantic field aliases (`alias="note_text"`) to map the API field to the existing database column without a migration.

**Lesson Learned:** API terminology should be consistent even if the database schema uses different naming. Field aliases in Pydantic provide a clean separation.

---

## Improvements I Personally Made

These are changes I made after the initial AI-generated code to improve quality and demonstrate understanding:

### 1. Added TicketStatus Enum

**File:** `backend/app/utils/enums.py`

Replaced string literals like `"Open"` with a Python `TicketStatus` enum. The model default changed from `default="Open"` to `default=TicketStatus.OPEN.value`.

**Why it matters:** String comparisons are error-prone. A typo like `"Opne"` would silently fail because Python would treat it as a new string. The enum catches these errors at import time.

### 2. Added Input Sanitization

**File:** `backend/app/services/ticket_service.py`

Added a `_sanitize_string()` helper that strips whitespace from all user inputs before storing them. Applied to `customer_name`, `customer_email`, `subject`, `description`, and comment text.

**Why it matters:** Users can accidentally submit whitespace-only strings or leading/trailing spaces. Sanitization ensures data quality at the point of entry rather than relying on the frontend.

### 3. Extracted Shared Constants

**File:** `frontend/src/constants.ts`

The `STATUS_BADGES` object (mapping status values to Tailwind color classes) was duplicated in both `TicketList.tsx` and `TicketDetail.tsx`. Extracted it to a shared constants file.

**Why it matters:** Duplicated constants will inevitably diverge when one file is updated but the other isn't. A single source of truth prevents inconsistency.

### 4. Added Debounced Search

**File:** `frontend/src/hooks/useDebounce.ts`, `frontend/src/components/TicketList.tsx`

Created a custom `useDebounce` hook that delays the API search call until 300 milliseconds after the user stops typing.

**Why it matters:** Without debouncing, every keystroke fires a database query. For a large dataset, this creates unnecessary load. The debounce aggregates rapid keystrokes into a single API call.

### 5. Renamed Notes to Comments with Field Aliases

**File:** `backend/app/schemas/ticket.py`, frontend types and components

Changed the API terminology from `notes` to `comments`. The database column `note_text` remains unchanged, but the API exposes it as `comment` using Pydantic's `alias` parameter.

**Why it matters:** Consistent API terminology makes the interface easier to understand. Using field aliases avoids breaking the existing database while improving the API design.

### 6. Improved Error Messages in API Client

**File:** `frontend/src/api/tickets.ts`

Changed the generic error message from `HTTP ${res.status}` to `Request failed with status ${res.status}` for clearer debugging.

**Why it matters:** When an API call fails, the error message is what the user sees. A clear message helps distinguish between network errors, server errors, and validation errors.

---

## Testing

### Manual Test Workflow

Follow these steps to verify the application is working correctly:

**1. Create a Ticket**

```bash
curl -X POST http://localhost:8000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "customer_email": "test@example.com",
    "subject": "Test ticket",
    "description": "Testing the system"
  }'
```

Expected response: Status 201 with ticket details including `ticket_id` and `created_at`.

**2. List All Tickets**

```bash
curl http://localhost:8000/api/tickets
```

Expected response: Array of tickets. The newly created ticket should appear first (ordered by `created_at` descending).

**3. Search Tickets**

```bash
curl "http://localhost:8000/api/tickets?search=Test"
```

Expected response: Only tickets containing "Test" in any searchable field.

**4. Filter by Status**

```bash
curl "http://localhost:8000/api/tickets?status=Open"
```

Expected response: Only tickets with status "Open".

**5. Get Ticket Details**

```bash
curl http://localhost:8000/api/tickets/TKT-001
```

Expected response: Full ticket object with empty `comments` array.

**6. Update Status and Add Comment**

```bash
curl -X PUT http://localhost:8000/api/tickets/TKT-001 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Progress",
    "comment": "Started working on this"
  }'
```

Expected response: `{ "success": true, "updated_at": "..." }`.

**7. Verify Comment Persistence**

```bash
curl http://localhost:8000/api/tickets/TKT-001
```

Expected response: The `comments` array should contain the comment added in step 6.

**8. Test 404 Handling**

```bash
curl http://localhost:8000/api/tickets/TKT-999
```

Expected response: Status 404 with `{ "detail": "Ticket TKT-999 not found" }`.

**9. Test Validation**

```bash
curl -X POST http://localhost:8000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"customer_name": ""}'
```

Expected response: Status 422 with validation error details.

**10. Frontend Verification**

Open `http://localhost:5173` and verify:
- Dashboard loads with ticket list
- Stats cards show correct counts
- Search filters tickets as you type
- Status dropdown filters correctly
- Creating a ticket navigates to detail page
- Updating a ticket refreshes the data
- Empty state shows when no tickets match

---

## Deployment

### Backend (Railway)

1. Push the repository to GitHub.
2. Create a new project on [Railway](https://railway.app).
3. Connect your GitHub repository.
4. Set the root directory to `backend`.
5. Add environment variables:
   - `DATABASE_URL` = `sqlite:///./crm.db` (SQLite works on Railway for MVP; use PostgreSQL for production)
   - `CORS_ORIGINS` = Your Vercel frontend URL
6. Railway detects `requirements.txt` and installs dependencies automatically.
7. Set the start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
8. Deploy.

### Frontend (Vercel)

1. Push the repository to GitHub.
2. Create a new project on [Vercel](https://vercel.com).
3. Connect your GitHub repository.
4. Set the root directory to `frontend`.
5. Framework preset: Vite.
6. Build command: `npm run build`.
7. Output directory: `dist`.
8. Add environment variable:
   - `VITE_API_URL` = Your Railway backend URL (e.g., `https://your-project.up.railway.app`)
9. Deploy.

### Database

For the MVP, SQLite is embedded in the backend and requires no separate database service. Railway provides ephemeral storage, so the SQLite file persists as long as the service is running. For production, switch to Railway's PostgreSQL add-on and update `DATABASE_URL`.

---

## Lessons Learned

### FastAPI

I learned that FastAPI's dependency injection is more than a convenience — it's an architectural pattern. The `get_db` function ensures every database session is properly closed, which prevents connection leaks. Without `Depends`, I would need to duplicate `try/finally` blocks in every route.

I also learned that Pydantic schemas are the backbone of FastAPI. Defining request and response models separately forces you to think about what data your API should accept versus what it should return. The `TicketCreate` schema doesn't have a `status` field because the server controls status — this is a design decision enforced at the schema level.

### React and TanStack Query

I learned that frontend state management is not just about storing data — it's about knowing when data is stale. The hardest bug to catch is stale UI showing outdated information. TanStack Query's `invalidateQueries` makes cache invalidation explicit: after every mutation, I specify exactly which caches should be refreshed.

The debounce hook taught me that not every user input should trigger an immediate API call. Batching rapid inputs into a single request reduces server load and provides a smoother user experience.

### Project Architecture

The most important lesson was about separation of concerns. When the router, service, model, and schema layers are separate, changing one doesn't break the others. When I renamed "notes" to "comments" on the API, I only needed to change the schemas and the service layer. The database model stayed the same because Pydantic's field aliases handled the mapping.

Conversely, when I added the `TicketStatus` enum, I only changed the model and service layers. The routers and schemas continued to work because the enum values are strings that are compatible with the existing API contract.

### SQLAlchemy

I learned that `db.add()` does not write to the database — it registers the object with the session. The actual `INSERT` happens on `db.commit()`. And `db.refresh()` is necessary to retrieve server-generated values like auto-increment IDs and default timestamps. Omitting `refresh()` means the Python object would have `None` for `id`, `created_at`, and `updated_at`.

---

## Author

**Your Name**

- GitHub: [@your-username](https://github.com/your-username)
- LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/your-profile)
- Email: your.email@example.com

---

## License

MIT License

Copyright (c) 2026 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.