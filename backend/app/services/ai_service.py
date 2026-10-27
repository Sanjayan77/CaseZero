import os
import json
import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings

try:
    from google import genai
    from google.genai import types
    HAS_GOOGLE_GENAI = True
except ImportError:
    HAS_GOOGLE_GENAI = False

class AIService:
    def __init__(self):
        self.last_interrogation_error = None
        self._ensure_credentials()

    def _ensure_credentials(self):
        from pathlib import Path
        from dotenv import load_dotenv
        backend_env = Path(__file__).resolve().parent.parent.parent / ".env"
        if backend_env.exists():
            load_dotenv(dotenv_path=backend_env, override=True)

        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY") or settings.GEMINI_API_KEY or ""
        self.model = os.getenv("AI_MODEL") or settings.AI_MODEL or "gemini-3.5-flash-lite"
        self.provider = os.getenv("AI_PROVIDER") or settings.AI_PROVIDER or "gemini"
        self.base_url = settings.AI_BASE_URL
        self._genai_client = None
        if self.api_key and HAS_GOOGLE_GENAI and self.get_provider_name() == "gemini":
            try:
                self._genai_client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[AIService] Warning initializing google-genai Client: {e}")

    def _sanitize_error(self, err: str) -> str:
        import re
        if self.api_key and self.api_key in err:
            err = err.replace(self.api_key, "[REDACTED_API_KEY]")
        err = re.sub(r'AIza[0-9A-Za-z-_]{35}', '[REDACTED_API_KEY]', err)
        err = re.sub(r'sk-[0-9A-Za-z-_]{30,}', '[REDACTED_API_KEY]', err)
        err = re.sub(r'key=[0-9A-Za-z-_]+', 'key=[REDACTED]', err)
        if "503" in err or "high demand" in err.lower():
            return "Gemini API 503 (Model temporarily experiencing high demand)"
        if "429" in err or "quota" in err.lower():
            return "Gemini API 429 (Rate limit or quota threshold reached on current tier)"
        if "404" in err or "not found" in err.lower():
            return "Gemini API 404 (Configured model not found or retired)"
        return err[:200]

    def get_provider_name(self) -> str:
        if not self.api_key:
            return "none"
        if self.provider == "gemini":
            return "gemini"
        if self.provider == "openai":
            return "openai"
        # Auto-detect
        if self.api_key.startswith("AIza") or "gemini" in self.model.lower():
            return "gemini"
        if self.api_key.startswith("sk-") or "gpt" in self.model.lower():
            return "openai"
        return "gemini"

    async def check_health(self) -> Dict[str, Any]:
        """
        Diagnoses AI availability honestly for the Junior Detective status bar.
        Executes a real test query to Gemini when credentials exist.
        """
        self._ensure_credentials()
        provider_name = self.get_provider_name()
        if not self.api_key:
            return {
                "status": "development_fallback",
                "error_category": "missing_key",
                "provider": "gemini",
                "model": self.model,
                "real_ai_active": False,
                "has_api_key": False,
                "message": "GEMINI_API_KEY is not configured in backend/.env. Add your API key to backend/.env to connect real Gemini AI.",
                "env_var_name": "GEMINI_API_KEY",
                "help": "Open backend/.env and set GEMINI_API_KEY=your_key, then run diagnostics."
            }


        # Perform actual lightweight test request
        try:
            if provider_name == "gemini" and HAS_GOOGLE_GENAI:
                client = self._genai_client or genai.Client(api_key=self.api_key)
                test_models = [self.model, "gemini-3.5-flash-lite", "gemini-flash-latest"]
                active_model = self.model
                last_test_err = None
                test_ok = False
                for m_test in test_models:
                    try:
                        test_resp = await client.aio.models.generate_content(
                            model=m_test,
                            contents="ping",
                            config=types.GenerateContentConfig(max_output_tokens=5)
                        )
                        active_model = m_test
                        test_ok = True
                        break
                    except Exception as te:
                        last_test_err = te
                        continue

                if not test_ok and last_test_err:
                    raise last_test_err

                warn_extra = ""
                if self.last_interrogation_error:
                    warn_extra = f" (Recent Interrogation Note: {self.last_interrogation_error.get('error')})"

                return {
                    "status": "connected",
                    "provider": "gemini",
                    "model": active_model,
                    "real_ai_active": True,
                    "has_api_key": True,
                    "message": f"Connected to Google Gemini ({active_model}). Live model interrogation active via official SDK.{warn_extra}",
                    "env_var_name": "GEMINI_API_KEY",
                    "help": "Google Gemini official SDK is active and successfully responding.",
                    "last_interrogation_error": self.last_interrogation_error.get("error") if self.last_interrogation_error else None
                }
            elif provider_name == "gemini":
                # Fallback to direct HTTP if SDK was somehow unavailable
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.post(
                        url,
                        headers={"Content-Type": "application/json"},
                        json={"contents": [{"parts": [{"text": "ping"}]}]}
                    )
                    if resp.status_code == 200:
                        return {
                            "status": "connected",
                            "provider": "gemini",
                            "model": self.model,
                            "real_ai_active": True,
                            "has_api_key": True,
                            "message": f"Connected to Google Gemini ({self.model}). Real-time suspect AI active.",
                            "env_var_name": "GEMINI_API_KEY",
                            "help": "Google Gemini provider is active and successfully responding."
                        }
                    else:
                        return {
                            "status": "unavailable",
                            "provider": "gemini",
                            "model": self.model,
                            "real_ai_active": False,
                            "has_api_key": True,
                            "message": f"Gemini API returned status {resp.status_code}. Falling back to contextual engine.",
                            "env_var_name": "GEMINI_API_KEY",
                            "help": f"Check your Gemini API quota or model permissions (HTTP {resp.status_code})."
                        }
            else:
                base = self.base_url or "https://api.openai.com/v1"
                url = f"{base}/chat/completions"
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.post(
                        url,
                        headers={
                            "Content-Type": "application/json",
                            "Authorization": f"Bearer {self.api_key}"
                        },
                        json={
                            "model": self.model,
                            "messages": [{"role": "user", "content": "ping"}],
                            "max_tokens": 5
                        }
                    )
                    if resp.status_code == 200:
                        return {
                            "status": "connected",
                            "provider": "openai",
                            "model": self.model,
                            "real_ai_active": True,
                            "has_api_key": True,
                            "message": f"Connected to OpenAI ({self.model}). Real-time suspect AI active.",
                            "env_var_name": "AI_API_KEY",
                            "help": "OpenAI provider is active and successfully responding."
                        }
                    else:
                        return {
                            "status": "unavailable",
                            "provider": "openai",
                            "model": self.model,
                            "real_ai_active": False,
                            "has_api_key": True,
                            "message": f"OpenAI API returned status {resp.status_code}. Falling back to contextual engine.",
                            "env_var_name": "AI_API_KEY",
                            "help": f"Check your OpenAI API key or quota (HTTP {resp.status_code})."
                        }
        except Exception as e:
            err_msg = str(e)
            low_err = err_msg.lower()
            if "api_key_invalid" in low_err or "api key not valid" in low_err or "invalid api key" in low_err or "unregistered" in low_err:
                error_category = "invalid_api_key"
                safe_msg = "The provided GEMINI_API_KEY was rejected by Google Gemini as invalid."
                safe_help = "Verify your key at https://aistudio.google.com/app/apikey and ensure it has no extra whitespace."
            elif "resource_exhausted" in low_err or "429" in low_err or "quota" in low_err:
                error_category = "quota_exceeded"
                safe_msg = "Gemini API quota exceeded or rate limit reached."
                safe_help = "Wait a moment for quota to reset, or check your billing and rate limits on Google AI Studio."
            elif "not_found" in low_err or "model" in low_err:
                error_category = "model_unsupported"
                safe_msg = f"Model '{self.model}' was not found or is unsupported."
                safe_help = "Change AI_MODEL in backend/.env to gemini-3.5-flash."
            else:
                error_category = "network_error"
                safe_msg = f"Network or connection error reaching Gemini: {err_msg[:100]}"
                safe_help = "Check your internet connection and network proxies."

            return {
                "status": "unavailable",
                "error_category": error_category,
                "provider": provider_name,
                "model": self.model,
                "real_ai_active": False,
                "has_api_key": True,
                "message": safe_msg,
                "env_var_name": "GEMINI_API_KEY" if provider_name == "gemini" else "AI_API_KEY",
                "help": safe_help
            }


    async def generate_suspect_response(
        self,
        suspect_name: str,
        suspect_role: str,
        personality_prompt: str,
        known_facts: List[str],
        private_secrets: List[str],
        discovered_evidence: List[Dict[str, Any]],
        dialogue_history: List[Dict[str, str]],
        player_message: str,
        referenced_evidence: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate suspect dialogue either using a real LLM provider (when GEMINI_API_KEY is configured)
        or high-fidelity contextual noir fallback logic.
        """
        self._ensure_credentials()
        provider_name = self.get_provider_name()
        if self.api_key:
            try:
                if provider_name == "gemini":
                    res = await self._call_gemini_provider(
                        suspect_name=suspect_name,
                        suspect_role=suspect_role,
                        personality_prompt=personality_prompt,
                        known_facts=known_facts,
                        private_secrets=private_secrets,
                        discovered_evidence=discovered_evidence,
                        dialogue_history=dialogue_history,
                        player_message=player_message,
                        referenced_evidence=referenced_evidence
                    )
                    self.last_interrogation_error = None
                    return res
                elif provider_name == "openai":
                    res = await self._call_openai_provider(
                        suspect_name=suspect_name,
                        suspect_role=suspect_role,
                        personality_prompt=personality_prompt,
                        known_facts=known_facts,
                        private_secrets=private_secrets,
                        discovered_evidence=discovered_evidence,
                        dialogue_history=dialogue_history,
                        player_message=player_message,
                        referenced_evidence=referenced_evidence
                    )
                    self.last_interrogation_error = None
                    return res
            except Exception as e:
                err_msg = self._sanitize_error(str(e))
                print(f"[AIService] Real AI request failed ({err_msg}). Reverting to Contextual Fallback.")
                self.last_interrogation_error = {
                    "provider": provider_name,
                    "error": err_msg
                }

        # Scripted Contextual Fallback (No repeated static text!)
        fallback = self._generate_contextual_fallback(
            suspect_name=suspect_name,
            personality_prompt=personality_prompt,
            player_message=player_message,
            dialogue_history=dialogue_history,
            referenced_evidence=referenced_evidence
        )
        fallback["is_fallback"] = True
        if self.last_interrogation_error:
            fallback["fallback_reason"] = self.last_interrogation_error.get("error")
        return fallback

    async def _call_gemini_provider(
        self,
        suspect_name: str,
        suspect_role: str,
        personality_prompt: str,
        known_facts: List[str],
        private_secrets: List[str],
        discovered_evidence: List[Dict[str, Any]],
        dialogue_history: List[Dict[str, str]],
        player_message: str,
        referenced_evidence: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        system_instruction = self._build_system_instruction(
            suspect_name, suspect_role, personality_prompt, known_facts, private_secrets
        )

        history_lines = []
        for msg in dialogue_history[-6:]:
            speaker = "Detective" if msg.get("sender") == "player" else suspect_name
            history_lines.append(f"{speaker}: {msg.get('content', '')}")

        evidence_note = ""
        if referenced_evidence:
            evidence_note = (
                f"\n[Detective confronts {suspect_name} with Evidence {referenced_evidence.get('evidence_code')}: "
                f"{referenced_evidence.get('title')} - {referenced_evidence.get('short_description')}]\n"
            )

        full_prompt = (
            f"RECENT INTERVIEW HISTORY:\n" + ("\n".join(history_lines) if history_lines else "None (Opening question)") +
            f"\n\nCURRENT DETECTIVE INTERACTION:{evidence_note}\nDetective asks: \"{player_message}\"\n\n"
            f"Respond in character as {suspect_name} following your established secrets and demeanor. Output JSON only."
        )

        models_to_try = [self.model]
        for candidate in ["gemini-3.5-flash-lite", "gemini-flash-latest", "gemini-3.5-flash"]:
            if candidate not in models_to_try:
                models_to_try.append(candidate)

        # Official google-genai SDK
        last_genai_err = None
        if HAS_GOOGLE_GENAI:
            client = self._genai_client or genai.Client(api_key=self.api_key)
            for m_candidate in models_to_try:
                try:
                    response = await client.aio.models.generate_content(
                        model=m_candidate,
                        contents=full_prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=system_instruction,
                            response_mime_type="application/json",
                            temperature=0.5,
                            max_output_tokens=800,
                        )
                    )
                    text = response.text or "{}"
                    try:
                        content = json.loads(text)
                        return {
                            "response": content.get("response", "I have stated what I know, Detective."),
                            "emotion": content.get("emotion", "calm"),
                            "suggested_followups": content.get("suggested_followups", [
                                "Can you verify that statement?",
                                "Whom else did you observe during that time?"
                            ]),
                            "is_fallback": False
                        }
                    except Exception:
                        clean = text.strip()
                        if clean.startswith("```json"): clean = clean[7:]
                        if clean.startswith("```"): clean = clean[3:]
                        if clean.endswith("```"): clean = clean[:-3]
                        clean = clean.strip()
                        try:
                            content = json.loads(clean)
                            return {
                                "response": content.get("response", clean),
                                "emotion": content.get("emotion", "calm"),
                                "suggested_followups": content.get("suggested_followups", []),
                                "is_fallback": False
                            }
                        except Exception:
                            import re
                            match = re.search(r'"response"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)', clean)
                            extracted = match.group(1).encode().decode('unicode_escape') if match else clean
                            return {
                                "response": extracted or "I have answered what is within my knowledge.",
                                "emotion": "calm",
                                "suggested_followups": [],
                                "is_fallback": False
                            }
                except Exception as ex:
                    last_genai_err = ex
                    print(f"[AIService] Model {m_candidate} interrogation failed: {self._sanitize_error(str(ex))}. Trying candidate...")
                    continue
            if last_genai_err:
                raise last_genai_err

        # Direct REST fallback if SDK is unavailable
        contents = []
        for msg in dialogue_history[-6:]:
            role = "user" if msg["sender"] == "player" else "model"
            contents.append({"role": role, "parts": [{"text": msg["content"]}]})

        current_prompt = player_message
        if referenced_evidence:
            current_prompt = f"[Detective points to Evidence {referenced_evidence.get('evidence_code')}: {referenced_evidence.get('title')}] {player_message}"
        contents.append({"role": "user", "parts": [{"text": current_prompt}]})

        payload = {
            "systemInstruction": {"parts": [{"text": system_instruction}]},
            "contents": contents,
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.4,
                "maxOutputTokens": 300
            }
        }
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(url, headers={"Content-Type": "application/json"}, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                content = json.loads(text)
                return {
                    "response": content.get("response", "I have stated everything I know."),
                    "emotion": content.get("emotion", "calm"),
                    "suggested_followups": content.get("suggested_followups", []),
                    "is_fallback": False
                }
        raise RuntimeError(f"Gemini error {resp.status_code}: {resp.text}")

    async def _call_openai_provider(
        self,
        suspect_name: str,
        suspect_role: str,
        personality_prompt: str,
        known_facts: List[str],
        private_secrets: List[str],
        discovered_evidence: List[Dict[str, Any]],
        dialogue_history: List[Dict[str, str]],
        player_message: str,
        referenced_evidence: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        system_instruction = self._build_system_instruction(
            suspect_name, suspect_role, personality_prompt, known_facts, private_secrets
        )

        messages = [{"role": "system", "content": system_instruction}]
        for msg in dialogue_history[-6:]:
            role = "user" if msg["sender"] == "player" else "assistant"
            messages.append({"role": role, "content": msg["content"]})

        current_prompt = player_message
        if referenced_evidence:
            current_prompt = f"[Detective points to Evidence {referenced_evidence.get('evidence_code')}: {referenced_evidence.get('title')}] {player_message}"
        messages.append({"role": "user", "content": current_prompt})

        base = self.base_url or "https://api.openai.com/v1"
        url = f"{base}/chat/completions"
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(
                url,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}"
                },
                json={
                    "model": self.model,
                    "messages": messages,
                    "response_format": {"type": "json_object"},
                    "temperature": 0.4,
                    "max_tokens": 300
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                content = json.loads(data["choices"][0]["message"]["content"])
                return {
                    "response": content.get("response", "I have nothing further to add, Detective."),
                    "emotion": content.get("emotion", "calm"),
                    "suggested_followups": content.get("suggested_followups", []),
                    "is_fallback": False
                }
        raise RuntimeError(f"OpenAI error {resp.status_code}: {resp.text}")

    def _build_system_instruction(
        self,
        suspect_name: str,
        suspect_role: str,
        personality_prompt: str,
        known_facts: List[str],
        private_secrets: List[str]
    ) -> str:
        return f"""You are roleplaying as {suspect_name}, the {suspect_role} in a high-stakes murder mystery case ("CaseZero: The Last Guest").
The victim is Adrian Vale, found dead in his locked second-floor study during an elite dinner party.

YOUR CHARACTER DOSSIER & MANNERISMS:
{personality_prompt}

FACTS YOU GENUINELY WITNESSED AND KNOW:
{json.dumps(known_facts, indent=2)}

PRIVATE SECRETS YOU CONCEAL (only reveal under intense, irrefutable evidence confrontation):
{json.dumps(private_secrets, indent=2)}

STRICT RULES:
1. Stay strictly in-character as {suspect_name}. Respond naturally to the specific question asked.
2. If asked about your LOCATION / ALIBI: provide your whereabouts at that time.
3. If asked about your RELATIONSHIP: describe your personal/business relationship truthfully according to your profile.
4. If asked WHOM YOU SUSPECT: give your subjective, believable opinion without inventing non-existent evidence.
5. If asked a follow-up (like "Why?", "Are you sure?", "Who else was there?"), answer directly in context of your previous statement.
6. If the detective's question is vague, ask for clarification.
7. Keep responses concise (under 90 words), conversational, and atmospheric.
8. NEVER invent new suspects or change established case facts.
9. Return JSON in this exact structure:
{{
  "response": "Your spoken reply",
  "emotion": "neutral|calm|defensive|shaken|indignant|evasive|confident",
  "suggested_followups": ["Question 1", "Question 2"]
}}"""

    def _generate_contextual_fallback(
        self,
        suspect_name: str,
        personality_prompt: str,
        player_message: str,
        dialogue_history: List[Dict[str, str]],
        referenced_evidence: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Contextual Noir Fallback Engine:
        Detects specific intents (alibi, relationship, suspicions, evidence, follow-ups)
        to ensure different questions always receive distinct, logically consistent answers.
        """
        msg = player_message.lower().strip()
        ref_code = referenced_evidence.get("evidence_code") if referenced_evidence else None
        s_lower = suspect_name.lower()

        # Follow-up intent detection
        is_why_followup = msg in ["why?", "why", "why is that?", "why so?", "explain why"]
        is_sure_followup = "sure" in msg or "certain" in msg or "positive" in msg or "swear" in msg
        is_who_else = "who else" in msg or "anyone else" in msg
        is_lying_accuse = "lying" in msg or "lie" in msg or "untruth" in msg or "contradict" in msg

        # Enhanced domain intent detection for CaseZero
        is_call_q = any(k in msg for k in ["call", "phone", "dropped", "8:31", "telecommunications", "signal", "reception", "disconnect"])
        is_embezzlement_q = any(k in msg for k in ["embezzl", "22.5", "wire", "audit", "aegis", "ledger", "offshore", "prosecut", "sec", "briefcase", "account"])
        is_poison_q = any(k in msg for k in ["poison", "scotch", "glass", "digitalis", "toxicity", "cardiac", "heart", "glycoside", "phial", "arrhythmia"])
        is_lock_q = any(k in msg for k in ["lock", "deadbolt", "monofilament", "thread", "door", "illusion", "mechanism", "latch"])
        is_prenup_q = any(k in msg for k in ["prenup", "divorce", "settlement", "will", "inherit", "disinherit"])

        # Core thematic intents
        is_alibi_q = any(k in msg for k in [
            "where were you", "between 8:25", "8:40", "20:25", "20:35", "20:40",
            "whereabouts", "location", "what were you doing", "alibi", "at 8:30", "at 8:15", "at 8:25"
        ])
        is_relationship_q = any(k in msg for k in [
            "relationship", "business", "marriage", "wife", "husband", "partner",
            "how did you know", "feel about", "love", "work with", "clash", "friend", "host"
        ])
        is_suspect_q = any(k in msg for k in [
            "who do you suspect", "whom do you suspect", "who did it", "killer", "culprit",
            "think killed", "suspicious", "who could have", "who had reason"
        ])

        # ---------------- EVELYN VALE ----------------
        if "evelyn vale" in s_lower:
            if is_prenup_q or ref_code in ["EV-09", "EV-009"]:
                return {
                    "response": "Adrian and I were married for fourteen years. It was a partnership of public prominence and private distance. We had grown apart, but I gave this family its philanthropic stature. If he was revising pre-nuptial papers behind my back, that was his cowardice, not a reason for murder.",
                    "emotion": "defensive",
                    "suggested_followups": ["Did you know about the revised pre-nuptial agreement?", "Did Adrian threaten divorce?"],
                    "is_fallback": True
                }
            if is_why_followup:
                return {
                    "response": "Because Adrian was becoming increasingly paranoid and unstable over company audits. He had locked himself in that study precisely to avoid confronting what he had uncovered.",
                    "emotion": "calm",
                    "suggested_followups": ["What had Adrian uncovered?", "Were you aware of his financial tensions?"],
                    "is_fallback": True
                }
            if is_sure_followup:
                return {
                    "response": "I am absolutely certain. Miss Bennett made it impossible to ignore her presence in the conservatory. Her questions were venomous, but every servant who passed the glass corridor can verify we were shouting at each other.",
                    "emotion": "indignant",
                    "suggested_followups": ["What was Clara shouting about?", "Did anyone enter the study wing while you argued?"],
                    "is_fallback": True
                }
            if is_who_else:
                return {
                    "response": "Marcus Reed was restless all evening. I saw him slip away from the table towards the terrace gallery right after Adrian went upstairs. And Dr. Shah seemed preoccupied from the moment she arrived.",
                    "emotion": "evasive",
                    "suggested_followups": ["What made Dr. Shah seem preoccupied?", "Did Marcus seem agitated?"],
                    "is_fallback": True
                }
            if is_alibi_q or ref_code in ["EV-10", "EV-010"]:
                return {
                    "response": "Between 8:20 PM and 8:35 PM, I was in the glass conservatory being badgered by Clara Bennett regarding rumors about Adrian's business. Neither of us left that room until nearly a quarter to nine.",
                    "emotion": "calm",
                    "suggested_followups": ["Did Clara Bennett confirm this timeline?", "Did you hear any commotion from the second floor?"],
                    "is_fallback": True
                }
            if is_relationship_q:
                return {
                    "response": "Adrian and I were married for fourteen years. We had grown apart, but we maintained the estate together. He was distant and obsessed with his private ledger over the past fortnight.",
                    "emotion": "defensive",
                    "suggested_followups": ["Did you know about his financial disputes with Marcus?", "When did you last speak to him?"],
                    "is_fallback": True
                }
            if is_suspect_q:
                return {
                    "response": "Marcus Reed. He built his career on Adrian's coattails, but over the last month Adrian looked at him with open disgust. Marcus is cornered by something financial—you can see it in his eyes.",
                    "emotion": "confident",
                    "suggested_followups": ["What financial dispute did Marcus have with Adrian?", "Did Adrian mention police or prosecutors?"],
                    "is_fallback": True
                }
            if is_embezzlement_q or ref_code in ["EV-03", "EV-04", "EV-003", "EV-004"]:
                return {
                    "response": "I know Adrian was obsessed with those Aegis Holdings audit files over the past month. He kept his financial ledgers and documents under lock and key. If there are suspicious wire transfers or missing millions, confront Marcus Reed—Marcus handled all corporate accounts, not me.",
                    "emotion": "evasive",
                    "suggested_followups": ["Did Adrian mention the Aegis accounts to you?", "Did Marcus have access to Adrian's personal safe?"],
                    "is_fallback": True
                }
            if is_poison_q or is_lock_q or ref_code in ["EV-01", "EV-02", "EV-001", "EV-002"]:
                return {
                    "response": "Adrian kept that antique lock bolted whenever he worked on sensitive contracts. But single malt was his ritual every evening at eight-thirty. Whoever poisoned that decanter knew his routine intimately.",
                    "emotion": "shaken",
                    "suggested_followups": ["Who else knew Adrian's evening scotch routine?", "Did you see anyone in the pantry?"],
                    "is_fallback": True
                }
            return {
                "response": "I am cooperating fully, Detective. Ask specifically about my timeline, my husband's dealings, or the guests present tonight. I will answer what is within my knowledge.",
                "emotion": "calm",
                "suggested_followups": ["Where were you between 8:25 PM and 8:40 PM?", "What was your relationship with Adrian?"],
                "is_fallback": True
            }

        # ---------------- MARCUS REED (CULPRIT) ----------------
        elif "marcus reed" in s_lower:
            if is_call_q or ref_code in ["EV-005", "EV-05"]:
                return {
                    "response": "The telecommunications record shows a dropped call at 8:31 PM because the estate's electrical surge killed the cell repeater on the roof. I stepped out to the terrace to get signal, but the line went dead. My conversation with Adrian earlier was strictly operational.",
                    "emotion": "defensive",
                    "suggested_followups": ["Why did the call terminate right before the power dipped?", "Did you enter the study from the terrace gallery?"],
                    "is_fallback": True
                }
            if is_embezzlement_q or ref_code in ["EV-004", "EV-04"]:
                return {
                    "response": "Adrian and I co-founded Vale Technologies twelve years ago. Every major multinational enterprise engages in offshore capital maneuvers. To call our transactions a $22.5M 'embezzlement' is legal slander by competitors.",
                    "emotion": "indignant",
                    "suggested_followups": ["Why was Adrian delivering that ledger to prosecutors tomorrow?", "What is Aegis Holdings Ltd?"],
                    "is_fallback": True
                }
            if is_lock_q or ref_code in ["EV-002", "EV-02"]:
                return {
                    "response": "I'm a corporate CFO, Detective, not a locksmith or an illusionist. If someone threw a deadbolt with monofilament line, talk to someone who understands mechanical rigging. You won't find fishing line on me.",
                    "emotion": "shaken",
                    "suggested_followups": ["Why was nylon fishing line found near the terrace door?", "Oliver Grant placed you in the study hallway at 8:37 PM."],
                    "is_fallback": True
                }
            if is_poison_q or ref_code in ["EV-003", "EV-03"]:
                return {
                    "response": "I didn't pour or touch Adrian's scotch glass tonight. Clara Bennett served him at eight-fifteen, and Dr. Shah is the one carrying concentrated cardiac glycosides in her bag. Ask the physician about poison.",
                    "emotion": "defensive",
                    "suggested_followups": ["Who had access to Dr. Shah's medical kit in the coatroom?", "Did you speak with Adrian in the study?"],
                    "is_fallback": True
                }
            if is_sure_followup:
                return {
                    "response": "I am positive, Detective. I was pacing beneath the terrace portico in the rain attempting to salvage a transatlantic syndicate. You are grasping at straws if you think bad cell reception makes a man a killer.",
                    "emotion": "defensive",
                    "suggested_followups": ["Why do phone logs show your call dropped at 8:26 PM?", "Did you enter the study from the terrace?"],
                    "is_fallback": True
                }
            if is_why_followup:
                return {
                    "response": "Because in venture technology, deals are executed across global time zones. When Tokyo calls, you take the call, regardless of dinner formalities.",
                    "emotion": "calm",
                    "suggested_followups": ["Who was on that call?", "Why didn't you redial when it disconnected?"],
                    "is_fallback": True
                }
            if is_who_else:
                return {
                    "response": "Dr. Shah was pacing the main hallway like a caged animal before eight. And Oliver Grant has keys to every room in the west wing. Why aren't you interrogating him?",
                    "emotion": "defensive",
                    "suggested_followups": ["What keys does Oliver Grant possess?", "Did Dr. Shah leave her medical bag unattended?"],
                    "is_fallback": True
                }
            if is_alibi_q:
                return {
                    "response": "I stepped out to the terrace portico at 8:25 PM to take an urgent financial call from our Singapore investors. I was outside on that call until well past 8:40 PM. Bad reception, rain, but entirely innocent.",
                    "emotion": "defensive",
                    "suggested_followups": ["Our carrier logs show your call dropped at 8:31 PM. Where were you for the remaining minutes?", "Did you enter the study corridor?"],
                    "is_fallback": True
                }
            if is_relationship_q:
                return {
                    "response": "Adrian and I co-founded Vale Technologies twelve years ago. He was the visionary face; I was the operational engine. We built an empire together.",
                    "emotion": "confident",
                    "suggested_followups": ["Were there recent disputes over company capital?", "What documents did you remove from your briefcase?"],
                    "is_fallback": True
                }
            if is_suspect_q:
                return {
                    "response": "Look at Clara Bennett. She arrived uninvited with a blackmail file. Or Nina Shah—Adrian owed her clinic an enormous endowment he abruptly canceled last week.",
                    "emotion": "evasive",
                    "suggested_followups": ["Did Nina Shah confront Adrian at dinner?", "What endowment was canceled?"],
                    "is_fallback": True
                }
            return {
                "response": "I have answered your questions transparently, Detective. I had an empire to run with Adrian, not destroy.",
                "emotion": "confident",
                "suggested_followups": ["Where were you between 8:25 PM and 8:40 PM?", "Explain the wire transfers to Aegis Holdings."],
                "is_fallback": True
            }

        # ---------------- DR. NINA SHAH ----------------
        elif "nina shah" in s_lower or "dr. nina" in s_lower:
            if is_why_followup:
                return {
                    "response": "Because Digitalis Purpurea extract is an experimental glycoside formulation for advanced arrhythmia research. It is strictly controlled, and I keep it in my locked field kit.",
                    "emotion": "shaken",
                    "suggested_followups": ["Was your medical bag accessible to anyone in the coat closet?", "Did you administer anything to Adrian?"],
                    "is_fallback": True
                }
            if is_sure_followup:
                return {
                    "response": "Yes, I am certain. When I went to check my medical kit at eight-fifty upon hearing the commotion, the glass phial was gone. Someone pilfered it from my bag in the coat closet.",
                    "emotion": "defensive",
                    "suggested_followups": ["Who knew you carried that cardiac extract?", "Who had access to the front coat closet?"],
                    "is_fallback": True
                }
            if is_alibi_q:
                return {
                    "response": "At 8:25 PM, I was in the library browsing Adrian's collection of rare botany journals. Oliver Grant passed by and saw me through the double doors at approximately 8:31 PM.",
                    "emotion": "calm",
                    "suggested_followups": ["Did you leave the library between 8:31 PM and 8:40 PM?", "Did you hear footsteps in the gallery above?"],
                    "is_fallback": True
                }
            if is_relationship_q:
                return {
                    "response": "Adrian was a major patron of our cardiovascular laboratory. Our relationship was professional and scholarly. We had differences over funding distribution, but nothing that would ever compromise medical ethics.",
                    "emotion": "calm",
                    "suggested_followups": ["Did Adrian threaten to pull your research funding?", "Did you know Adrian had heart palpitations?"],
                    "is_fallback": True
                }
            if is_suspect_q:
                return {
                    "response": "Whoever knew Adrian's nightly scotch habit and knew that Digitalis produces symptoms indistinguishable from sudden myocardial infarction without deep toxicological assay.",
                    "emotion": "confident",
                    "suggested_followups": ["Marcus or Evelyn?", "Who had opportunity to enter the study?"],
                    "is_fallback": True
                }
            if ref_code in ["EV-02", "EV-12"] or "phial" in msg or "digitalis" in msg:
                return {
                    "response": "That concentration in his glass is terrifyingly lethal. Ten milliliters would cause ventricular fibrillation within four to six minutes. Someone used my science as an assassin's blade.",
                    "emotion": "shaken",
                    "suggested_followups": ["Could Adrian have ingested it voluntarily?", "Who took the phial from your coat?"],
                    "is_fallback": True
                }
            return {
                "response": "I am a physician, Detective. I took an oath to preserve life. Examine the physical access to the room.",
                "emotion": "calm",
                "suggested_followups": ["Where was your medical bag kept?", "Who did you observe near the study stairs?"],
                "is_fallback": True
            }

        # ---------------- OLIVER GRANT ----------------
        elif "oliver grant" in s_lower:
            if is_why_followup:
                return {
                    "response": "Because Mr. Vale insisted on complete silence after eight o'clock. My duties were strictly to monitor the heating boilers and serve tea in the library.",
                    "emotion": "calm",
                    "suggested_followups": ["Did you see anyone in the corridor?", "Where were you at 8:35 PM?"],
                    "is_fallback": True
                }
            if is_sure_followup:
                return {
                    "response": "I swear on my service to this household, Detective. At precisely 8:37 PM, while carrying linens towards the service stairs, I saw Mr. Marcus Reed hurrying down the second-floor gallery away from the master study.",
                    "emotion": "confident",
                    "suggested_followups": ["Did Marcus see you?", "What was Marcus doing with his hands?"],
                    "is_fallback": True
                }
            if is_alibi_q or "corridor" in msg:
                return {
                    "response": "I was checking the boiler room in the basement until 8:30 PM, then went up the service staircase. At 8:37 PM, I witnessed Mr. Marcus Reed coming from the direction of the study, looking pale and breathing hard.",
                    "emotion": "confident",
                    "suggested_followups": ["Was the study door closed when Marcus left?", "Did Marcus say anything to you?"],
                    "is_fallback": True
                }
            if is_relationship_q:
                return {
                    "response": "I have served as butler to the Vale family for twenty-two years. Mr. Adrian was a demanding employer, but fair. He was deeply distressed tonight—he told me to expect police officers in the morning.",
                    "emotion": "shaken",
                    "suggested_followups": ["Why did Adrian expect police in the morning?", "Who was Adrian going to report?"],
                    "is_fallback": True
                }
            if is_suspect_q:
                return {
                    "response": "Mr. Reed, without hesitation. His manner was furtive and guilty when we crossed paths in the gallery at 8:37 PM.",
                    "emotion": "confident",
                    "suggested_followups": ["Did you notice any string or tools in Marcus's hands?", "Did you tell Mrs. Vale what you saw?"],
                    "is_fallback": True
                }
            return {
                "response": "I remain at the service of Scotland Yard and the Crown, Detective. Ask what you need of the household.",
                "emotion": "calm",
                "suggested_followups": ["What did you see in the corridor at 8:37 PM?", "Who had access to the master study key?"],
                "is_fallback": True
            }

        # ---------------- CLARA BENNETT ----------------
        elif "clara bennett" in s_lower:
            if is_why_followup:
                return {
                    "response": "Because my editor at the Financial Chronicle gave me forty-eight hours to corroborate the offshore shell companies before our deadline. I wasn't leaving until Adrian answered.",
                    "emotion": "defensive",
                    "suggested_followups": ["What offshore shell companies?", "Did Adrian agree to an interview?"],
                    "is_fallback": True
                }
            if is_sure_followup:
                return {
                    "response": "I take meticulous journalistic notes, Detective. Every word Evelyn said in that conservatory is recorded in my notebook with timestamps. She was with me from 8:20 until 8:36 PM.",
                    "emotion": "confident",
                    "suggested_followups": ["Did Evelyn leave the room even for a minute?", "Did you hear anyone on the terrace outside?"],
                    "is_fallback": True
                }
            if is_alibi_q:
                return {
                    "response": "I was in the east conservatory cornering Evelyn Vale between 8:20 PM and 8:36 PM. We were in a vicious verbal spar the entire time. Neither of us had the opportunity to slip upstairs.",
                    "emotion": "calm",
                    "suggested_followups": ["What were you questioning Evelyn about?", "Where did you go after the conservatory?"],
                    "is_fallback": True
                }
            if is_relationship_q:
                return {
                    "response": "I am an investigative reporter. Adrian was the subject of my upcoming six-part exposé on tech governance fraud. He invited me to dinner believing he could charm me into dropping the story.",
                    "emotion": "confident",
                    "suggested_followups": ["Did Adrian offer you a bribe or settlement?", "What did Marcus Reed tell you about the story?"],
                    "is_fallback": True
                }
            if is_suspect_q:
                return {
                    "response": "Marcus Reed. In all my corporate reporting, when an audit blows open, the CFO is the one with their neck in the noose. Follow the $22.5 million wire transfers.",
                    "emotion": "confident",
                    "suggested_followups": ["Where did the $22.5 million go?", "What is Aegis Holdings?"],
                    "is_fallback": True
                }
            return {
                "response": "My notes are my shield, Detective. Ask your questions and compare my timeline to the forensic evidence.",
                "emotion": "calm",
                "suggested_followups": ["What do your notes say about Evelyn's alibi?", "Who had the motive to silence Adrian tonight?"],
                "is_fallback": True
            }

        # Generic Suspect Fallback
        return {
            "response": f"I have stated my position clearly, Detective. Focus your inquiries on the timeline between 8:25 PM and 8:40 PM.",
            "emotion": "calm",
            "suggested_followups": ["Where were you between 8:25 PM and 8:40 PM?", "Whom do you suspect?"],
            "is_fallback": True
        }

    async def generate_assistant_response(
        self,
        user_message: str,
        investigation_data: Dict[str, Any],
        discovered_evidence: List[Dict[str, Any]],
        suspects: List[Dict[str, Any]],
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Generates real Gemini AI responses for the Assistant Detective companion.
        Specializes in:
        1. Evidence summarization (3-5 concise bullet points highlighting facts, contradictions, and what needs verification).
        2. Case-wide detective assistance (alibis, timelines, suspects, physical clues).
        Distinguishes confirmed evidence from unverified allegations.
        """
        self._ensure_credentials()
        provider_name = self.get_provider_name()

        # Build evidence inventory
        ev_lines = []
        for e in discovered_evidence:
            inspect_str = "Inspected" if e.get("inspected") else "Not yet inspected"
            notes_str = f" | Player Notes: {e.get('notes')}" if e.get("notes") else ""
            ev_lines.append(f"- Exhibit {e.get('code')}: {e.get('title')} ({e.get('category')}) - {e.get('description')} [{inspect_str}]{notes_str}")
        
        evidence_context = "\n".join(ev_lines) if ev_lines else "No physical evidence has been discovered yet in the current investigation."

        # Build suspects inventory
        sus_lines = []
        for s in suspects:
            sus_lines.append(f"- {s.get('name')} ({s.get('role')}): Alibi claims: \"{s.get('alibi')}\" | Relationship: {s.get('relationship')}")
        suspects_context = "\n".join(sus_lines) if sus_lines else "Suspects: Evelyn Vale, Marcus Reed, Dr. Nina Shah, Oliver Grant, Clara Bennett."

        # Chat history lines
        history_lines = []
        if chat_history:
            for item in chat_history[-6:]:
                role = "Detective" if item.get("role") in ["user", "player"] else "Assistant Detective"
                history_lines.append(f"{role}: {item.get('content', '')}")
        history_context = "\n".join(history_lines) if history_lines else "None (Opening inquiry)"

        system_instruction = """You are the "Assistant Detective", a sharp, analytical AI forensic partner assisting the lead Detective in solving CaseZero ("The Last Guest" murder case).
Victim: Adrian Vale, found dead in his second-floor locked study during an elite dinner party.

YOUR ROLE & CAPABILITIES:
1. EVIDENCE SUMMARIES:
When the Detective asks for an evidence summary (e.g. "Summarise the evidence", "What evidence do we have so far?", "What are the strongest clues?", "What contradictions have we found?"):
- Give a short, structured, clear summary in 3 to 5 concise bullet points.
- Highlight confirmed physical facts, critical contradictions (such as Marcus Reed's dropped call EV-04 contradicting his claimed 8:42 PM phone call, or Dr. Shah's missing digitalis EV-05 matching the poison in the scotch EV-02), and evidence that still needs inspection or verification.
- STRICTLY use ONLY the evidence actually collected in the current case file provided below. Do not invent non-existent clues or declare unverified theories as proven.

2. CASE-WIDE DETECTIVE ASSISTANCE:
- Answer questions regarding suspects, timelines, alibis, relationships, and forensic evidence accurately using the provided case data.
- Clearly distinguish confirmed physical evidence (toxicology, carrier logs, fingerprints, keycards) from suspect claims or self-serving statements.
- Never spoil the final verdict unprompted, but guide the detective logically toward the facts.

3. STYLE:
- Crisp, professional, observant noir detective tone.
- Keep responses concise (typically 80-160 words). Use clean bullet points where appropriate."""

        full_prompt = f"""CURRENT INVESTIGATION DATA:
Case: CaseZero (CZ-001: The Last Guest)
Investigation Status: {investigation_data.get('status', 'in_progress')}

CURRENTLY DISCOVERED EVIDENCE IN CASE FILE:
{evidence_context}

SUSPECTS & DECLARED ALIBIS:
{suspects_context}

RECENT ASSISTANT CHAT TRANSCRIPT:
{history_context}

DETECTIVE'S QUESTION:
"{user_message}"

Provide your analytical Assistant Detective response:"""

        if not self.api_key:
            return {
                "response": "Assistant Detective requires GEMINI_API_KEY in backend/.env to connect to live Gemini AI. Please configure your key in backend/.env.",
                "is_real_ai": False,
                "error": "missing_api_key"
            }

        models_to_try = [self.model]
        for candidate in ["gemini-3.5-flash-lite", "gemini-flash-latest", "gemini-3.5-flash"]:
            if candidate not in models_to_try:
                models_to_try.append(candidate)

        last_err = None
        if HAS_GOOGLE_GENAI and provider_name == "gemini":
            client = self._genai_client or genai.Client(api_key=self.api_key)
            for m_candidate in models_to_try:
                try:
                    response = await client.aio.models.generate_content(
                        model=m_candidate,
                        contents=full_prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=system_instruction,
                            temperature=0.3,
                            max_output_tokens=600
                        )
                    )
                    text = (response.text or "").strip()
                    if text:
                        return {
                            "response": text,
                            "is_real_ai": True,
                            "model_used": m_candidate
                        }
                except Exception as ex:
                    last_err = ex
                    print(f"[AIService] Assistant Detective model {m_candidate} call failed: {self._sanitize_error(str(ex))}. Trying fallback candidate...")
                    continue

        # If direct REST or fallback is needed
        if provider_name == "gemini" and self.api_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
                async with httpx.AsyncClient(timeout=12.0) as http_client:
                    payload = {
                        "systemInstruction": {"parts": [{"text": system_instruction}]},
                        "contents": [{"role": "user", "parts": [{"text": full_prompt}]}],
                        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 600}
                    }
                    r = await http_client.post(url, headers={"Content-Type": "application/json"}, json=payload)
                    if r.status_code == 200:
                        data = r.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                        return {
                            "response": text,
                            "is_real_ai": True,
                            "model_used": self.model
                        }
            except Exception as ex:
                last_err = ex

        err_msg = self._sanitize_error(str(last_err)) if last_err else "Unable to communicate with Gemini API"
        return {
            "response": f"Assistant Detective is currently unable to reach Gemini AI: {err_msg}. Please check your connection or quota.",
            "is_real_ai": False,
            "error": err_msg
        }

ai_service = AIService()
