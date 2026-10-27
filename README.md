# CASEZERO — Full-Stack AI Mystery Investigation & Support Platform
> **“Every Detail Tells a Story. Every Lie Leaves a Trace.”**

CaseZero is a playable, cinematic full-stack detective investigation web application. Combining forensic crime scene analysis, live Gemini-powered suspect interrogations, an interactive evidence connection board, deterministic logical deduction scoring, and an independent website support portal with SQL-backed FAQs, error diagnostic sandboxes, and MongoDB telemetry archiving.

---

## 1. Project Overview & Features

### Core Detective Investigation Game (Case CZ-001: The Last Guest)
- **Genre:** Locked-Room Murder Mystery
- **Difficulty:** Intermediate (20–30 minutes)
- **Victim:** Adrian Vale (CEO & Founder, Vale Technologies)
- **Crime Scene:** Private 2nd-Floor Study, Vale Manor
- **Interactive Story & Crime Scene:** Uncover 14 distinct forensic exhibits (monofilament thread, scotch glass, digitalis phial, phone carrier logs, financial ledgers).
- **Gemini-Powered Suspect Interrogation:** Live roleplaying of five suspects (Evelyn Vale, Marcus Reed, Dr. Nina Shah, Oliver Grant, Clara Bennett) using Google Gemini AI, reacting dynamically to player questions and presented evidence.
- **Evidence Board & Timeline:** Visual graph linking clues, alibis, and contradictions.
- **Deterministic Scoring Engine:** Mathematical 100-point rubric grading culprit, motive, method, timeline, evidence citations, and written synthesis.

### Independent Website Support Infrastructure
- **SQL FAQ Knowledge Base (`/faq`):** 12 genuine, categorized FAQ entries stored in SQLite and retrieved via REST API, complete with live search and category filters.
- **System Health & Diagnostic Portal (`/support`):** Real-time health monitoring of SQLite, MongoDB, Gemini AI, Open-Meteo Weather API, and request logging middleware.
- **Supported Error Code Matrix & Sandbox:** Comprehensive handling and simulation for HTTP 400, 401, 403, 404, 429, 500, 503, and site-specific custom code `CZ-423 (Case File Sealed)`.
- **Custom Error Pages:** Dedicated noir-themed 404 and 500 pages equipped with one-click "Ask the assistant" troubleshooting.
- **Assignment Support Assistant:** Separate support assistant grounded in SQL FAQs and error documentation. Automatically logs SQL support tickets upon detecting unresolved queries, and archives interactions in MongoDB.
- **Additional 3rd-Party API Integration:** Open-Meteo meteorological telemetry providing live weather advisories for Blackwood Manor with configurable timeout and offline cache fallback.

---

## 2. Technology Stack & Database Architecture

### Frontend
- **Framework:** React 19 with TypeScript
- **Tooling:** Vite 8.3+, Tailwind CSS v4
- **Icons & Audio:** Lucide React, HTML5 Audio Noir Ambiance
- **Responsive Layout:** Desktop and mobile viewport optimization (Tailwind fluid breakpoints `sm:`, `md:`, `lg:`)

### Backend
- **Framework:** FastAPI (Python 3.14+) with asynchronous endpoints
- **Server:** Uvicorn ASGI server
- **Security:** Bcrypt password hashing, PyJWT authentication, request sanitization middleware

### Relational Database (SQL)
- **Engine:** SQLite with SQLAlchemy ORM (`casezero.db`)
- **Key Tables:**
  - `users`: Investigator accounts, hashed credentials, badge titles.
  - `cases`, `evidence`, `suspects`: Canonical Case CZ-001 mystery dossiers.
  - `investigations`, `discovered_evidence`, `interviews`: User playthrough state.
  - `faq_entries`: Genuine FAQ items stored in SQL and served dynamically.
  - `support_tickets`: Support tickets generated manually or escalated automatically by the assistant.

### Document Database (NoSQL)
- **Engine:** MongoDB (`casezero_support`) via PyMongo
- **Collections:**
  - `assistant_chat_logs`: Complete conversational session logs, user questions, assistant responses, model metadata, and SQL ticket references.
  - `user_feedback`: User ratings (1-5 stars) and comments.
- **Graceful Fallback:** If a local MongoDB daemon or Atlas cluster is unreachable, CaseZero seamlessly activates an in-memory `mongomock` store, ensuring zero downtime or application crashes.

### External APIs
1. **Google Gemini AI:** Official `google-genai` SDK using `gemini-3.5-flash-lite` (with automatic failover to `gemini-flash-latest`) for suspect interrogation and support assistant intelligence.
2. **Open-Meteo REST API:** Real-time atmospheric telemetry (temperature, precipitation, wind speed, humidity) for Blackwood Manor grounds.

---

## 3. Environment Variables Setup

Configure environment variables in `backend/.env`. A template is provided in `backend/.env.example`:

```env
# Application Settings
PROJECT_NAME="CaseZero Detective API"
VERSION="2.1.0"
DEBUG=True

# Relational Database (SQL)
DATABASE_URL=sqlite:///./casezero.db

# JWT & Authentication Secret
SECRET_KEY=casezero_noir_super_secret_jwt_key_2026_investigation
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AI Provider Configuration (Google Gemini)
# Obtain your key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_google_gemini_api_key_here
AI_PROVIDER=gemini
AI_MODEL=gemini-3.5-flash-lite

# Document Database (MongoDB)
# Local daemon: mongodb://localhost:27017 or MongoDB Atlas connection string
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=casezero_support

# Third-Party Weather API Settings
WEATHER_API_TIMEOUT=3.0

# CORS Allowed Origin
FRONTEND_ORIGIN=http://localhost:5173
```

> **Security Note:** Never commit `backend/.env` to source control. `.gitignore` is configured to exclude all `.env` files. Secrets are never sent to the frontend or exposed in server logs.

---

## 4. Installation & Startup Instructions

### Prerequisites
- Python 3.11+ (Tested on Python 3.14)
- Node.js 18+ and npm
- (Optional) MongoDB running locally on port 27017 or a MongoDB Atlas cluster URI.

### 1. Backend Setup & Startup

```powershell
# Navigate to the backend directory:
cd backend

# Install dependencies:
python -m pip install -r requirements.txt

# Start the FastAPI server on port 8001:
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Backend will be accessible at: `http://127.0.0.1:8001`
Interactive API Docs (Swagger): `http://127.0.0.1:8001/docs`

### 2. Frontend Setup & Startup

```powershell
# In a separate terminal, navigate to the frontend directory:
cd frontend

# Install npm dependencies:
npm install

# Start the Vite development server:
npm run dev
```

Frontend will be accessible at: `http://127.0.0.1:5173`

---

## 5. API & Health-Check Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Comprehensive system health check (SQL, Mongo, Gemini AI, Weather API, Logger) |
| `GET` | `/api/support/health` | Diagnostic component breakdown with uptime and memory buffer |
| `GET` | `/api/support/faqs` | Retrieves all 12 genuine FAQ items from SQL database |
| `POST` | `/api/support/assistant/chat` | Support assistant chat with SQL grounding, ticket escalation & Mongo logging |
| `POST` | `/api/support/tickets` | Explicitly creates a support ticket in SQLite |
| `GET` | `/api/support/tickets` | Retrieves support tickets stored in SQLite |
| `POST` | `/api/support/feedback` | Saves user satisfaction feedback in MongoDB |
| `GET` | `/api/support/feedback` | Retrieves feedback records from MongoDB |
| `GET` | `/api/support/assistant/logs` | Retrieves assistant chat history archived in MongoDB |
| `GET` | `/api/support/weather` | Open-Meteo weather telemetry with configurable timeout & fallback |
| `GET` | `/api/errors/documentation` | Documentation for all 8 supported error codes |
| `GET` | `/api/errors/trigger/{code}` | Triggers controlled HTTP errors (400, 401, 403, 404, 429, 500, 503, 423) |

### Error Code Reference
- **HTTP 400 Bad Request:** Malformed payload or missing investigation parameters.
- **HTTP 401 Unauthorized:** Missing or expired Bearer JWT authentication token.
- **HTTP 403 Forbidden:** Access restricted to unauthorized case files.
- **HTTP 404 Not Found:** Dossier, suspect, or crime scene exhibit does not exist.
- **HTTP 429 Too Many Requests:** Gemini API rate limit or quota exceeded.
- **HTTP 500 Internal Server Error:** Unexpected backend exception during processing.
- **HTTP 503 Service Unavailable:** Upstream AI provider temporarily overloaded.
- **CZ-423 (HTTP 423 Case File Sealed):** Site-specific forensic lockout indicating classified case material impounded under judicial warrant.

---

## 6. Live Deployment URL Status

- **Status:** **Not currently deployed to an external cloud production URL.**
- **Active Local Host:** Running locally on `http://127.0.0.1:5173/` (Frontend) and `http://127.0.0.1:8001/` (FastAPI Backend).
- In accordance with assignment instructions, no fake or unverified live production URL is claimed.

---

## 7. MongoDB & Third-Party API Setup Details

### MongoDB Setup
1. **Live MongoDB Daemon (Optional):** Start a local MongoDB instance on port 27017 or create a free MongoDB Atlas cluster.
2. **Configure URI:** Set `MONGODB_URI` in `backend/.env` (e.g. `mongodb://localhost:27017` or `mongodb+srv://user:pass@cluster.mongodb.net/`).
3. **Graceful Fallback:** If MongoDB is not running, `app.core.mongodb` automatically catches the connection timeout and boots an in-memory `mongomock` instance. Support chat logs and feedback remain fully functional and queryable without errors.

### Open-Meteo Weather API Setup
1. **Zero-Configuration:** Open-Meteo is an open meteorological REST API requiring no API key or paid subscription.
2. **Configurable Timeout:** Controlled via `WEATHER_API_TIMEOUT` in `backend/.env` (default: 3.0s).
3. **Graceful Fallback:** If the external API request fails or times out, the backend gracefully falls back to cached historical telemetry (`13.8°C, Continuous Rain & Heavy Mist`), ensuring the user interface never hangs.

---

## 8. Proposed Future Improvement

**Real-Time Collaborative Multi-Detective Syndicate Mode:**
A proposed future enhancement is a multiplayer syndicate room powered by WebSockets and Redis Pub/Sub. Multiple detectives could enter the same crime scene together, collaborate on a shared real-time evidence board, cross-examine suspects in turn-based audio/text interrogation rounds, and cast consensus votes on the final indictment before the judicial magistrate.

---

## 9. Verification & Automated Tests

Run backend tests using pytest:

```powershell
python -m pytest backend/tests -v
```

All test suites verify:
- Complete authentication and JWT isolation.
- Evidence discovery, inspection, and forensic integrity.
- Live Gemini AI suspect interrogation and emotional nuance.
- Mathematical accusation scoring against ground truth.
- Total secrecy of the case solution from frontend queries.
