from sqlalchemy.orm import Session
from app.models.models import FAQEntry

INITIAL_FAQS = [
    {
        "order_index": 1,
        "category": "Getting Started",
        "question": "How do I start and play an investigation in CaseZero?",
        "answer": "Click 'Quick Investigator Demo' or create an account to start Case CZ-001 ('The Last Guest'). You progress through Crime Scene inspection, Evidence Lab analysis, Suspect Interrogation, and submit your Final Accusation."
    },
    {
        "order_index": 2,
        "category": "Interrogation & AI",
        "question": "How does the suspect interrogation system work?",
        "answer": "Suspects are roleplayed by live Google Gemini AI using in-depth character profiles, private alibis, and case secrets. You can choose from recommended tactical questions, confront them directly with discovered evidence, or type custom free-form inquiries."
    },
    {
        "order_index": 3,
        "category": "Interrogation & AI",
        "question": "What happens if Gemini AI experiences high traffic or quota limits?",
        "answer": "CaseZero features automated multi-model failover across gemini-3.5-flash-lite, gemini-flash-latest, and gemini-3.5-flash. If all cloud AI endpoints are unreachable, the system transparently utilizes our contextual noir fallback engine and labels responses with a clear service notice."
    },
    {
        "order_index": 4,
        "category": "Evidence & Forensics",
        "question": "How do I discover and inspect evidence in the Crime Scene?",
        "answer": "Navigate to the Crime Scene and click on interactive hot zones (such as the locked oak study door, spilled scotch glass, or terrace footprints). Discovered items appear in the Evidence Lab where you can read full forensic reports and log detective notes."
    },
    {
        "order_index": 5,
        "category": "Deduction & Scoring",
        "question": "How is the final deduction score calculated?",
        "answer": "When submitting your Final Accusation, your solution is scored across Culprit Identification (40 pts), Motive ($22.5M Aegis wire transfers, 15 pts), Murder Weapon (Digitalis Purpurea, 15 pts), Locked-Room Mechanism (Monofilament thread, 15 pts), and Timeline Proof (Marcus Reed's dropped call, 15 pts) for a maximum score of 100."
    },
    {
        "order_index": 6,
        "category": "Error Codes & Troubleshooting",
        "question": "What standard HTTP error codes does CaseZero support?",
        "answer": "CaseZero handles HTTP 400 (Bad Request), HTTP 401 (Unauthorized session), HTTP 403 (Forbidden investigation access), HTTP 404 (Resource or case file not found), HTTP 429 (Rate limit reached), HTTP 500 (Internal server error), and HTTP 503 (Service unavailable during maintenance)."
    },
    {
        "order_index": 7,
        "category": "Error Codes & Troubleshooting",
        "question": "What is custom error code CZ-423 (Case File Sealed)?",
        "answer": "HTTP 423 / CZ-423 (Case File Sealed) is a site-specific forensic error code raised when a detective attempts to inspect, modify, or confront suspects with classified case materials currently impounded under judicial warrant before mandatory procedural prerequisites are satisfied."
    },
    {
        "order_index": 8,
        "category": "Support & Escalation",
        "question": "How does the Support Assistant handle questions it cannot answer?",
        "answer": "When the Support Assistant encounters an inquiry outside its verified FAQ knowledge base or case parameters, it automatically escalates the issue by generating a formal Support Ticket stored directly in our SQL database, providing you with a tracking reference."
    },
    {
        "order_index": 9,
        "category": "Databases & Storage",
        "question": "Where are support tickets and chat logs stored?",
        "answer": "Case data, user accounts, and support tickets are persisted in our relational SQL database (SQLite). Assistant chat sessions, telemetry, and player satisfaction feedback are archived in MongoDB for analytics and reliability tracking."
    },
    {
        "order_index": 10,
        "category": "Weather & Environment",
        "question": "What is the third-party Weather & Incident Advisory service?",
        "answer": "CaseZero connects to the Open-Meteo atmospheric forecast API to retrieve real-time precipitation, wind, and barometric conditions for the Blackwood Manor estate. This third-party integration features a 3-second timeout and graceful cached fallback."
    },
    {
        "order_index": 11,
        "category": "Account & Progress",
        "question": "Can I replay or start multiple investigations simultaneously?",
        "answer": "Yes. Each investigator account can start fresh case runs or review previously completed investigations with full score breakdowns from the Case Review screen."
    },
    {
        "order_index": 12,
        "category": "Security & Privacy",
        "question": "Are my API keys and personal data secure?",
        "answer": "All API keys (including GEMINI_API_KEY) and JWT secrets are stored exclusively server-side in environment variables and are never transmitted to client JavaScript, HTML, logs, or external browsers."
    }
]

def seed_faqs(db: Session):
    existing_count = db.query(FAQEntry).count()
    if existing_count < len(INITIAL_FAQS):
        for entry in INITIAL_FAQS:
            found = db.query(FAQEntry).filter(FAQEntry.question == entry["question"]).first()
            if not found:
                faq = FAQEntry(
                    order_index=entry["order_index"],
                    category=entry["category"],
                    question=entry["question"],
                    answer=entry["answer"]
                )
                db.add(faq)
        db.commit()
