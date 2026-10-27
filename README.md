# CASEZERO — Full-Stack AI Mystery Investigation Platform
> **“Every Detail Tells a Story. Every Lie Leaves a Trace.”**

CaseZero is a playable, cinematic full-stack detective investigation game. Combining modern forensic analysis, live AI suspect interrogations, an interactive evidence connection board, and a deterministic logical deduction engine, players step into the midnight study of Adrian Vale to solve a locked-room homicide.

---

## 1. Case CZ-001: The Last Guest

- **Genre:** Locked-Room Murder Mystery
- **Difficulty:** Intermediate (20–30 minutes)
- **Victim:** Adrian Vale (CEO & Founder, Vale Technologies)
- **Crime Scene:** Private 2nd-Floor Study, Vale Manor
- **Initial Incident Facts:**
  - At 20:15, Adrian Vale excused himself from the dinner table to attend an urgent matter in his private study.
  - At 20:45, private secretary Oliver Grant knocked on the study door with tea and received no response.
  - At 21:00, the door was forced open. The heavy brass deadbolt was thrown shut from the inside.
  - Adrian Vale was found deceased beside his desk, a tipped crystal scotch glass soaked into financial records.
  - Five guests attended the dinner. Each harbors a concealed secret.

---

## 2. Platform Architecture

```
web application/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI REST endpoints (auth, cases, evidence, interrogation, board, timeline, deduction)
│   │   ├── core/            # Configuration, database engine, JWT & bcrypt security
│   │   ├── game_data/       # Canonical seed data for Case CZ-001
│   │   ├── models/          # Normalized SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas (with hidden solution protection)
│   │   ├── services/        # AI provider abstraction & deterministic scoring engine
│   │   └── main.py          # FastAPI application entrypoint
│   ├── tests/               # 10 Pytest automated tests (auth, gameplay, scoring, secrecy)
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/assets/       # Bespoke high-resolution visuals (mansion, crime scene, 5 suspects, 4 forensic items)
│   ├── src/
│   │   ├── components/      # RainCanvas, TopBar, Sidebar
│   │   ├── pages/           # Landing, Login, Register, Dashboard, Briefing, EvidenceLab, SuspectDirectory, Interrogation, Board, Timeline, Deduction, Review
│   │   ├── services/api.ts  # Client API service
│   │   ├── types/           # TypeScript definitions
│   │   ├── App.tsx          # Master application shell & state orchestration
│   │   └── index.css        # Cinematic noir design tokens & typography
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 3. Technology Stack

- **Backend:** Python 3.14+, FastAPI, SQLAlchemy, Pydantic v2, PyJWT, Bcrypt, Pytest, HTTPX.
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, HTML5 Canvas.
- **AI Engine:** Pluggable provider adapter (Gemini / OpenAI / Contextual Noir Fallback Engine).
- **Database:** SQLite (local development / zero-configuration) or PostgreSQL.

---

## 4. Quick Start & Startup Commands

### Backend Startup

```powershell
# From the root directory:
cd backend

# Install dependencies:
python -m pip install -r requirements.txt

# Run the FastAPI server:
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- API Health Check: `http://127.0.0.1:8000/api/health`
- Interactive API Docs: `http://127.0.0.1:8000/docs`

### Frontend Startup

```powershell
# In a separate terminal, from the root directory:
cd frontend

# Install npm packages:
npm install

# Run the Vite development server:
npm run dev -- --host 127.0.0.1 --port 5173
```
- Open browser at: `http://127.0.0.1:5173/`

---

## 5. Running Automated Backend Tests

The backend test suite verifies authentication, user data isolation, evidence inspection, suspect dialogue, evidence board syncing, deterministic scoring, and solution secrecy:

```powershell
python -m pytest backend/tests -v
```

All 10 test suites pass cleanly.

---

## 6. AI Configuration & Fallback Engine

CaseZero accesses LLMs exclusively through the backend provider abstraction. Configure your API key in `backend/.env`:

```env
DATABASE_URL=sqlite:///./casezero.db
SECRET_KEY=casezero_noir_super_secret_jwt_key_2026_investigation
AI_API_KEY=your_gemini_or_openai_api_key_here
AI_MODEL=gemini-1.5-flash
FRONTEND_ORIGIN=http://localhost:5173
```

- **Graceful Fallback:** If `AI_API_KEY` is not provided or the provider experiences network timeouts, CaseZero activates its built-in rule-governed contextual noir engine. Suspects stay strictly in-character, respond dynamically to discovered evidence (e.g. dropped calls, offshore audits), and the entire game remains 100% playable.

---

## 7. Deterministic Scoring Rubric

Accusations are scored out of **100 Points**:
1. **Culprit Identification (35 pts):** Correct identification of Marcus Reed.
2. **Motive Accuracy (15 pts):** Discovery of the $22.5M Aegis Holdings embezzlement and impending SEC referral.
3. **Method & Locked-Room Mechanics (15 pts):** Digitalis Purpurea poisoning in single malt scotch and the monofilament nylon deadbolt trick.
4. **Timeline Reasoning (15 pts):** Catching the 20:26 carrier phone call drop and hallway sighting at 20:37.
5. **Supporting Evidence Citations (15 pts):** Citing decisive forensic evidence (`EV-01`, `EV-02`, `EV-03`, `EV-04`, `EV-14`) and corroborating clues.
6. **Written Synthesis (5 pts):** Logical detective flow and deduction coherence.
