import os
import json
import uuid
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.models import FAQEntry, SupportTicket
from app.core.mongodb import mongo_manager
from app.core.config import settings
from app.services.ai_service import ai_service
from app.api.diagnostics_and_errors import SUPPORTED_ERROR_CODES

try:
    from google import genai
    from google.genai import types
    HAS_GOOGLE_GENAI = True
except ImportError:
    HAS_GOOGLE_GENAI = False

class SupportAssistantService:
    """
    Website Support Assistant:
    - Answers user questions strictly grounded in SQL FAQ entries and Error Code documentation.
    - Clearly distinguishes confirmed information from uncertain information.
    - Explains HTTP error codes (400, 401, 403, 404, 429, 500, 503) and custom CZ-423.
    - Creates an SQL support ticket when unable to answer confidently or upon user request.
    - Stores interaction logs in MongoDB.
    """

    def _build_faq_context(self, db: Session) -> str:
        faqs = db.query(FAQEntry).order_by(FAQEntry.order_index, FAQEntry.id).all()
        lines = []
        for f in faqs:
            lines.append(f"Q: {f.question}\nA: {f.answer} [Category: {f.category}]")
        return "\n\n".join(lines) if lines else "No FAQs found in database."

    def _build_error_context(self) -> str:
        lines = []
        for err in SUPPORTED_ERROR_CODES:
            lines.append(
                f"HTTP {err['status_code']} ({err['name']}):\n"
                f"  Meaning: {err['description']}\n"
                f"  CaseZero Context: {err['casezero_context']}\n"
                f"  Resolution: {err['resolution']}"
            )
        return "\n\n".join(lines)

    async def handle_user_query(
        self,
        message: str,
        db: Session,
        session_id: Optional[str] = None,
        chat_history: Optional[List[Dict[str, str]]] = None,
        user_email: Optional[str] = "investigator@casezero.local",
        user_name: Optional[str] = "Investigator"
    ) -> Dict[str, Any]:
        session_id = session_id or str(uuid.uuid4())
        msg_clean = message.strip()
        msg_lower = msg_clean.lower()

        # 1. Fetch current SQL FAQ entries
        faq_context = self._build_faq_context(db)
        error_context = self._build_error_context()

        # 2. Check for explicit escalation triggers or clear unknown topics
        force_ticket = any(k in msg_lower for k in [
            "create ticket", "file ticket", "open ticket", "submit ticket",
            "support ticket", "speak to human", "contact support", "helpdesk",
            "report a bug", "broken feature", "billing issue", "refund"
        ])

        system_instruction = f"""You are the official CaseZero Website Support Assistant.
Your mission is to provide helpful, accurate technical and gameplay assistance for players and visitors of the CaseZero platform.

OFFICIAL KNOWLEDGE BASE (SQL FAQs):
{faq_context}

OFFICIAL ERROR CODE CATALOG (Supported & Site-Specific Codes):
{error_context}

CORE RULES:
1. Ground your answers strictly in the official SQL FAQs and Error Code Catalog above.
2. DISTINGUISH CONFIRMED FROM UNCERTAIN:
   - For facts explicitly documented in the knowledge base, prefix with "[Confirmed Information]:" and state the answer concisely.
   - If a detail is not explicitly stated in the documentation, state that it is unconfirmed or speculative.
3. ERROR CODE QUERIES:
   - If the user asks about HTTP 400, 401, 403, 404, 429, 500, 503 or custom code CZ-423 (Case File Sealed), explain what the error means in CaseZero and how to resolve it.
4. CONFIDENCE & TICKET ESCALATION:
   - If the user asks about something NOT explicitly documented in the official SQL FAQs or Error Catalog (such as other platforms, consoles, Bluetooth, billing/refunds, custom server hosting, or unverified technical requests), or if the user asks for human support / bug report / ticket:
     You MUST set "needs_ticket": true, "confidence": "low", "confirmed_status": "escalated", and specify "ticket_subject", "ticket_description", and "ticket_category".
     State politely in "answer" that the question cannot be answered from the confirmed knowledge base and that an official support ticket is being opened for the investigation team.
5. CONCISE & POLITE: Keep answers direct, friendly, and under 150 words.
6. JSON OUTPUT FORMAT:
Respond with a JSON object in this exact schema:
{{
  "answer": "Your direct, helpful response to the user. Include [Confirmed Information]: when referencing documented facts.",
  "confidence": "high" | "medium" | "low",
  "confirmed_status": "confirmed" | "unconfirmed" | "escalated",
  "needs_ticket": true | false,
  "ticket_subject": "Brief subject for support ticket if needed, else empty",
  "ticket_description": "Summary of unresolved user query if needed, else empty",
  "ticket_category": "Gameplay" | "Technical" | "Account" | "Bug Report" | "General"
}}"""



        history_lines = []
        if chat_history:
            for item in chat_history[-6:]:
                role = "User" if item.get("role") in ["user", "player"] else "Assistant"
                history_lines.append(f"{role}: {item.get('content', '')}")
        history_str = "\n".join(history_lines) if history_lines else "None (Opening inquiry)"

        full_prompt = f"""CHAT HISTORY:
{history_str}

USER QUERY:
"{msg_clean}"

Generate JSON response:"""

        response_payload = None
        is_real_ai = False
        model_used = None
        error_msg = None

        # Check if Gemini is configured and available
        ai_service._ensure_credentials()
        if ai_service.api_key and not force_ticket:
            try:
                models_to_try = [ai_service.model, "gemini-3.5-flash-lite", "gemini-flash-latest"]
                if HAS_GOOGLE_GENAI:
                    client = ai_service._genai_client or genai.Client(api_key=ai_service.api_key)
                    for m_cand in models_to_try:
                        try:
                            gemini_resp = await client.aio.models.generate_content(
                                model=m_cand,
                                contents=full_prompt,
                                config=types.GenerateContentConfig(
                                    system_instruction=system_instruction,
                                    response_mime_type="application/json",
                                    temperature=0.2,
                                    max_output_tokens=600
                                )
                            )
                            raw_text = (gemini_resp.text or "").strip()
                            if raw_text:
                                parsed = json.loads(raw_text)
                                response_payload = parsed
                                is_real_ai = True
                                model_used = m_cand
                                break
                        except Exception as ex_m:
                            print(f"[SupportAssistant] Model {m_cand} failed: {ai_service._sanitize_error(str(ex_m))}")
                            continue
            except Exception as e:
                error_msg = ai_service._sanitize_error(str(e))
                print(f"[SupportAssistant] Gemini AI call failed: {error_msg}")

        # Fallback keyword and rule-based answering if AI failed or force_ticket
        if not response_payload:
            response_payload = self._local_faq_matcher(
                msg_clean, db, force_ticket=force_ticket
            )
            is_real_ai = False

        # Handle ticket creation in SQL if needed
        ticket_info = None
        if response_payload.get("needs_ticket"):
            ticket_subj = response_payload.get("ticket_subject") or f"Support Request: {msg_clean[:50]}"
            ticket_desc = response_payload.get("ticket_description") or f"Investigator query required escalation:\n{msg_clean}"
            ticket_cat = response_payload.get("ticket_category") or "General Support"
            ticket_num = f"CZ-TICK-{datetime.datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

            new_ticket = SupportTicket(
                ticket_number=ticket_num,
                user_email=user_email,
                user_name=user_name,
                subject=ticket_subj,
                description=ticket_desc,
                category=ticket_cat,
                status="open",
                priority="normal",
                source="assistant_auto_escalation"
            )
            db.add(new_ticket)
            db.commit()
            db.refresh(new_ticket)

            ticket_info = {
                "ticket_id": new_ticket.id,
                "ticket_number": new_ticket.ticket_number,
                "status": new_ticket.status,
                "category": new_ticket.category,
                "subject": new_ticket.subject
            }

            # Append ticket confirmation note to response
            ticket_suffix = f"\n\n[Official Support Ticket Created]: A support ticket ({ticket_num}) has been logged in our system. Our engineering/forensics team will follow up at {user_email}."
            if ticket_num not in response_payload.get("answer", ""):
                response_payload["answer"] = response_payload.get("answer", "").strip() + ticket_suffix

        # Log chat to MongoDB
        final_answer = response_payload.get("answer", "I could not generate a response.")
        mongo_metadata = {
            "is_real_ai": is_real_ai,
            "model_used": model_used,
            "confidence": response_payload.get("confidence", "unknown"),
            "ticket_created": bool(ticket_info),
            "ticket_number": ticket_info.get("ticket_number") if ticket_info else None,
            "user_email": user_email
        }
        mongo_log_id = mongo_manager.save_chat_log(
            session_id=session_id,
            user_message=msg_clean,
            assistant_response=final_answer,
            metadata=mongo_metadata
        )

        return {
            "session_id": session_id,
            "answer": final_answer,
            "confidence": response_payload.get("confidence", "high"),
            "confirmed_status": response_payload.get("confirmed_status", "confirmed"),
            "ticket_created": bool(ticket_info),
            "ticket": ticket_info,
            "is_real_ai": is_real_ai,
            "model_used": model_used,
            "mongo_log_id": mongo_log_id,
            "error": error_msg
        }

    def _local_faq_matcher(self, query: str, db: Session, force_ticket: bool = False) -> Dict[str, Any]:
        """High-fidelity local matcher against SQL FAQs and Error Codes when Gemini is unreachable."""
        q_lower = query.lower()

        if force_ticket:
            return {
                "answer": "I have created an official support ticket for your inquiry so our support team can assist you directly.",
                "confidence": "high",
                "confirmed_status": "escalated",
                "needs_ticket": True,
                "ticket_subject": f"Investigator Escalation: {query[:60]}",
                "ticket_description": query,
                "ticket_category": "Technical Support"
            }

        # Check for error codes
        for err in SUPPORTED_ERROR_CODES:
            code_str = str(err["status_code"])
            name_str = err["name"].lower()
            if code_str in q_lower or name_str in q_lower or (code_str == "423" and ("sealed" in q_lower or "cz-423" in q_lower)):
                return {
                    "answer": f"[Confirmed Information]: HTTP {err['status_code']} ({err['name']})\n\n{err['description']}\n\nCaseZero Context: {err['casezero_context']}\n\nResolution: {err['resolution']}",
                    "confidence": "high",
                    "confirmed_status": "confirmed",
                    "needs_ticket": False
                }

        # Match against SQL FAQ entries
        faqs = db.query(FAQEntry).all()
        best_faq = None
        best_matches = 0
        q_words = set(q_lower.split())

        for f in faqs:
            f_words = set(f.question.lower().split())
            overlap = len(q_words.intersection(f_words))
            if overlap > best_matches:
                best_matches = overlap
                best_faq = f

        if best_faq and best_matches >= 2:
            return {
                "answer": f"[Confirmed Information]: {best_faq.answer}",
                "confidence": "high",
                "confirmed_status": "confirmed",
                "needs_ticket": False
            }

        # Unconfident / Unanswerable: Automatically trigger support ticket creation
        return {
            "answer": "I apologize, but this topic is not documented in our verified knowledge base. To ensure you receive accurate help, I have automatically escalated this inquiry and generated an official support ticket for our engineering team.",
            "confidence": "low",
            "confirmed_status": "escalated",
            "needs_ticket": True,
            "ticket_subject": f"Unresolved Inquiry: {query[:60]}",
            "ticket_description": f"User asked a question outside current SQL FAQ coverage:\n{query}",
            "ticket_category": "Investigation Support"
        }

support_assistant_service = SupportAssistantService()
