import json
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.models import Investigation, DiscoveredEvidence, Evidence, Interview, Case

class MentorService:
    @staticmethod
    def get_mentor_guidance(investigation: Investigation, db: Session) -> Dict[str, Any]:
        """
        Dynamically calculates Senior Detective Morgan's advice, hint levels,
        and current objectives based on real database state.
        """
        case = investigation.case
        discoveries = db.query(DiscoveredEvidence).filter(
            DiscoveredEvidence.investigation_id == investigation.id
        ).all()
        disc_count = len(discoveries)
        inspected_count = sum(1 for d in discoveries if d.inspected)

        # Check discovered codes
        discovered_codes = set()
        for d in discoveries:
            ev = db.query(Evidence).filter(Evidence.id == d.evidence_id).first()
            if ev:
                discovered_codes.add(ev.evidence_code)

        # Check interviews conducted
        interviews = db.query(Interview).filter(
            Interview.investigation_id == investigation.id
        ).all()
        interviewed_count = sum(1 for i in interviews if i.status == "in_progress")

        # Determine Case Phase
        if inspected_count < 3:
            phase_name = "Phase 1: Crime Scene Forensics"
            objective_title = "Examine the Initial Crime Scene Evidence"
            objective_desc = "Inspect the locked study door (EV-01) and the spilled scotch glass (EV-02) in the Evidence Lab."
            target_page = "evidence"

            hint_1 = "Start by inspecting the locked study door and the scotch glass on Adrian's desk in the Evidence Lab."
            hint_2 = "Look closely at the strike plate of the door lock. Forensics noted microscopic scratches and clear fiber residue."
            hint_3 = "The brass deadbolt was thrown shut from the inside, but the key was found inside the room. Could a monofilament thread have been used to turn the bolt from outside?"

        elif interviewed_count < 3:
            phase_name = "Phase 2: Guest Interrogations"
            objective_title = "Interrogate the Five Dinner Guests"
            objective_desc = "Question Marcus Reed, Evelyn Vale, and Dr. Nina Shah about their movements between 8:20 PM and 8:40 PM."
            target_page = "interrogation"

            hint_1 = "Five guests were in the manor. Question them about where they were when Adrian excused himself to the study at 8:15 PM."
            hint_2 = "Ask Marcus Reed about his claimed phone call on the terrace. Then ask Dr. Shah about her medical satchel in the foyer closet."
            hint_3 = "Dr. Shah's emergency satchel was unlatched and a vial of Digitalis Purpurea is missing. Someone stole the poison before dinner."

        elif "EV-04" not in discovered_codes and "EV-03" not in discovered_codes:
            phase_name = "Phase 3: Finding the Contradiction"
            objective_title = "Break the Suspect's Alibi"
            objective_desc = "Confront Marcus Reed with questions about his terrace phone call or corporate finances to unlock telecommunications records."
            target_page = "interrogation"

            hint_1 = "One of the suspects has a fraudulent alibi. Look at Marcus Reed's claimed business call on the terrace."
            hint_2 = "Marcus claims he was on the phone continuously until 8:42 PM. Ask him specifically why he was on the phone and what happened when it dropped."
            hint_3 = "Carrier logs (EV-04) show his call dropped at 8:26:14 PM. That leaves Marcus completely unaccounted for during the exact 8:25–8:35 PM murder window!"

        else:
            phase_name = "Phase 4: Synthesizing the Accusation"
            objective_title = "Reconstruct the Crime & Formulate Theory"
            objective_desc = "Connect the clues on the Evidence Board, review the Chrono Timeline, and lodge your formal accusation."
            target_page = "deduction"

            hint_1 = "You have the decisive clues: the dropped phone call, the stolen digitalis, the Aegis wire transfers, and the monofilament thread."
            hint_2 = "Notice that Evelyn Vale and Clara Bennett corroborate each other's continuous presence in the conservatory, clearing them both."
            hint_3 = "Marcus Reed had the motive ($22.5M embezzlement to Aegis), the opportunity (dropped call from 8:26 to 8:42), the method (stolen digitalis in scotch), and the trick (monofilament nylon thread under the door)."

        # Build 7 Step-by-Step Objectives
        objectives = [
            {
                "id": 1,
                "title": "Review Incident Briefing",
                "description": "Read the initial incident facts and victim parameters.",
                "is_completed": True,
                "target_page": "briefing",
                "importance": "Establishes the crime location and estimated time of death (8:25–8:35 PM)."
            },
            {
                "id": 2,
                "title": "Inspect Core Crime Scene Exhibits",
                "description": "Analyze the locked door (EV-01) and poisoned scotch glass (EV-02).",
                "is_completed": inspected_count >= 2,
                "target_page": "evidence",
                "importance": "Reveals the physical cause of death and the locked-room challenge."
            },
            {
                "id": 3,
                "title": "Interrogate Key Dinner Guests",
                "description": "Question at least 3 suspects regarding their whereabouts and motives.",
                "is_completed": interviewed_count >= 3,
                "target_page": "interrogation",
                "importance": "Uncovers personal grudges, alibi claims, and suspicious behavior."
            },
            {
                "id": 4,
                "title": "Uncover Alibi Discrepancies",
                "description": "Discover telecom records (EV-04) or conservatory corroboration (EV-10).",
                "is_completed": "EV-04" in discovered_codes or "EV-10" in discovered_codes,
                "target_page": "timeline",
                "importance": "Proves whose alibi is genuine and whose alibi is fabricated."
            },
            {
                "id": 5,
                "title": "Reconstruct Chrono Timeline",
                "description": "Examine verified events between 19:15 and 21:00.",
                "is_completed": disc_count >= 6,
                "target_page": "timeline",
                "importance": "Isolates the fatal 10-minute window when Adrian collapsed."
            },
            {
                "id": 6,
                "title": "Map Relationships on Evidence Board",
                "description": "Pin suspects and link supporting or contradictory clues.",
                "is_completed": disc_count >= 8,
                "target_page": "board",
                "importance": "Visualizes the logical connections between motive, method, and opportunity."
            },
            {
                "id": 7,
                "title": "Lodge Formal Accusation",
                "description": "Submit primary culprit, motive, method, and decisive evidence.",
                "is_completed": investigation.status == "completed",
                "target_page": "deduction",
                "importance": "Finalizes the case and submits your reasoning for evaluation."
            }
        ]

        return {
            "mentor_name": "Detective Morgan",
            "mentor_title": "Senior Homicide Detective",
            "phase": phase_name,
            "objective_title": objective_title,
            "objective_description": objective_desc,
            "target_page": target_page,
            "hints": {
                "level_1_nudge": hint_1,
                "level_2_stronger": hint_2,
                "level_3_deduction": hint_3
            },
            "objectives": objectives,
            "progress_summary": {
                "discovered_clues": disc_count,
                "inspected_clues": inspected_count,
                "suspects_interviewed": interviewed_count,
                "case_status": investigation.status
            }
        }

    @staticmethod
    def explain_evidence(evidence_code: str) -> Dict[str, str]:
        """
        Senior Detective Morgan explains any evidence item in clear, plain language.
        """
        explanations = {
            "EV-01": {
                "what_we_found": "The heavy brass deadbolt on the inside of Adrian's study door was thrown shut into the door frame.",
                "what_it_tells_us": "The room appeared locked from the inside, but microscopic scratches on the strike plate and nylon fibers suggest mechanical manipulation.",
                "why_it_matters": "A killer didn't need to stay inside the room if they used a monofilament thread to throw the bolt from the outside hallway."
            },
            "EV-02": {
                "what_we_found": "A crystal scotch glass tipped on Adrian's desk, containing vintage single malt mixed with white residue.",
                "what_it_tells_us": "Forensic toxicology confirmed concentrated Digitalis Purpurea. It induces fatal heart arrhythmia within 10 to 15 minutes.",
                "why_it_matters": "Adrian didn't die of natural causes. He drank scotch prepared or poured by someone who added the poison."
            },
            "EV-03": {
                "what_we_found": "A confidential banking ledger detailing $22.5 million sent to an offshore shell named 'Aegis Holdings Ltd'.",
                "what_it_tells_us": "Marcus Reed authorized the transfers with his initials, and Adrian had printed the file to send to federal prosecutors.",
                "why_it_matters": "This gives Marcus Reed a massive motive. Exposure meant decades in federal prison and financial ruin."
            },
            "EV-04": {
                "what_we_found": "Cellular antenna tower logs for Marcus Reed's smartphone on the evening of the murder.",
                "what_it_tells_us": "Marcus claimed he was on an investor call until 8:42 PM, but the call disconnected at 8:26:14 PM and was never resumed.",
                "why_it_matters": "This completely dismantles Marcus's alibi, leaving him unaccounted for during the exact murder window (8:25–8:35 PM)."
            },
            "EV-05": {
                "what_we_found": "An empty amber glass medicine vial labeled 'Digitalis Purpurea' in Dr. Nina Shah's coat bag in the foyer.",
                "what_it_tells_us": "The vial was stolen from the foyer coat closet between 7:15 PM and 7:30 PM before dinner.",
                "why_it_matters": "Anyone who entered the coat closet before dinner had the opportunity to steal the poison used in the scotch."
            },
            "EV-06": {
                "what_we_found": "Wet size 10 diamond-cut Vibram shoe prints on the stone terrace leading to the study exterior door.",
                "what_it_tells_us": "Someone walked from the terrace into the study at 8:28 PM and returned at 8:38 PM.",
                "why_it_matters": "The tread matches Marcus Reed's evening dinner shoes, placing him at the crime scene during the killing."
            },
            "EV-07": {
                "what_we_found": "A signed statement from secretary Oliver Grant detailing what he saw on the second-floor service corridor.",
                "what_it_tells_us": "At 8:37 PM, Oliver saw a man in a black tuxedo with silver hexagonal cufflinks walking swiftly away from the study.",
                "why_it_matters": "Corroborates the exact minute the killer left the study and provides a visual description matching Marcus."
            },
            "EV-08": {
                "what_we_found": "A pair of custom platinum-and-onyx hexagonal cufflinks worn by Marcus Reed.",
                "what_it_tells_us": "Trace swabbing detected microscopic droplets of single malt scotch on the right cufflink clasp.",
                "why_it_matters": "Connects Marcus directly to Adrian's spilled scotch tumbler and confirms Oliver's hallway sighting."
            },
            "EV-09": {
                "what_we_found": "A draft amendment to Adrian and Evelyn Vale's pre-nuptial agreement reducing her settlement.",
                "what_it_tells_us": "Adrian was considering marriage dissolution, but Evelyn was unaware of this document until shown by police.",
                "why_it_matters": "Presents a potential motive for Evelyn, but her validated conservatory alibi proves she lacked opportunity."
            },
            "EV-10": {
                "what_we_found": "Corroborating witness statements from Clara Bennett and Evelyn Vale.",
                "what_it_tells_us": "Both women were in the glass conservatory arguing about a news article continuously from 8:20 PM to 8:35 PM.",
                "why_it_matters": "This mutual alibi clears both Evelyn and Clara from being in the study during the poisoning."
            },
            "EV-11": {
                "what_we_found": "Adrian's personal desk calendar notation written in his own handwriting.",
                "what_it_tells_us": "Notes '8:30 PM — M.R. confrontation. Surrender Aegis files or SEC will be at your door at 9:00 AM.'",
                "why_it_matters": "Proves Adrian had summoned Marcus (M.R.) to the study for a confrontation regarding the embezzlement."
            },
            "EV-12": {
                "what_we_found": "The coroner's official post-mortem toxicological analysis.",
                "what_it_tells_us": "Death occurred between 8:25 PM and 8:35 PM due to acute digitalis-induced cardiac arrest.",
                "why_it_matters": "Pinpoints the exact time of death and confirms the chemical agent responsible."
            },
            "EV-14": {
                "what_we_found": "A 14-inch segment of clear 20lb monofilament nylon fishing line found under the carpet strip outside the door.",
                "what_it_tells_us": "Looped around the deadbolt thumb-turn, passed under the door, and pulled from outside to throw the lock.",
                "why_it_matters": "Solves the locked-room mystery by demonstrating how the door was secured after the killer exited."
            }
        }

        result = explanations.get(evidence_code, {
            "what_we_found": "A piece of physical evidence collected by the forensic team.",
            "what_it_tells_us": "Documented in the official case files for investigative cross-referencing.",
            "why_it_matters": "Compare this item with suspect statements to uncover contradictions."
        })
        return {
            "evidence_code": evidence_code,
            "title": f"Exhibit {evidence_code}",
            "what_we_found": result["what_we_found"],
            "what_it_tells_us": result["what_it_tells_us"],
            "why_it_matters": result["why_it_matters"],
            "unlocked_connections": [f"Corroborates forensic timeline regarding exhibit {evidence_code}"],
            "senior_advice": f"Detective Morgan: 'Pay close attention to what this item tells us. Compare {evidence_code} directly against suspect alibis during your interrogation.'"
        }

    @staticmethod
    def evaluate_draft_theory(
        suspect_name: str,
        motive: str = "",
        method: str = "",
        timeline: str = "",
        evidence_codes: List[str] = []
    ) -> Dict[str, Any]:
        """
        Senior Detective Morgan provides an encouraging pre-accusation theory review.
        """
        strengths = []
        cautions = []

        is_marcus = "marcus" in suspect_name.lower()
        if is_marcus:
            strengths.append("Accusing Marcus Reed is strongly supported by the evidence.")
        else:
            cautions.append(f"Consider whether {suspect_name} has a verified alibi (e.g. conservatory witness log).")

        motive_lower = motive.lower()
        if any(k in motive_lower for k in ["embezzle", "aegis", "22.5", "sec", "wire", "fraud"]):
            strengths.append("Your motive accurately identifies the $22.5M Aegis Holdings embezzlement.")
        else:
            cautions.append("Did you review the wire transfers ledger (EV-03)? Look closely at who authorized the funds.")

        method_lower = method.lower()
        if any(k in method_lower for k in ["digitalis", "poison", "scotch"]):
            strengths.append("You correctly identified the digitalis poisoning in the scotch.")
        else:
            cautions.append("Review the coroner's toxicology report (EV-12) to ensure your murder weapon is accurate.")

        if any(k in method_lower for k in ["thread", "monofilament", "nylon", "lock", "deadbolt"]):
            strengths.append("You accounted for how the locked-room deadbolt was thrown from the outside.")
        else:
            cautions.append("Remember to explain how the study door appeared locked from the inside (EV-01, EV-14).")

        timeline_lower = timeline.lower()
        if any(k in timeline_lower for k in ["20:26", "drop", "carrier", "call", "terrace", "8:26"]):
            strengths.append("Your timeline correctly catches the 8:26 PM dropped phone call on the terrace.")
        else:
            cautions.append("Check Marcus's phone carrier log (EV-04). Does his declared phone duration match actual network data?")

        if len(evidence_codes) >= 4:
            strengths.append(f"Solid evidence backing with {len(evidence_codes)} exhibits selected.")
        else:
            cautions.append("Attach at least 4 decisive and corroborative exhibits to strengthen the prosecutor's case.")

        ready = is_marcus and len(cautions) <= 1
        verdict = "strong" if ready else ("promising" if is_marcus else "incomplete")
        feedback = (
            "Detective Morgan: 'Outstanding detective work, Junior Detective. Your theory is tightly bound to physical facts and ready for the crown prosecutor.'"
            if ready
            else "Detective Morgan: 'You have good instincts, but let's shore up a couple of loose ends before we sign the warrant. Check my notes below.'"
        )

        return {
            "review_verdict": verdict,
            "mentor_verdict": "Ready to Indict" if ready else "Review Recommended",
            "message": feedback,
            "senior_feedback": feedback,
            "strengths": strengths,
            "cautions": cautions,
            "questions_to_answer": [
                "Does the physical evidence irrefutably disprove the suspect's stated alibi?",
                "Can you link the murder weapon and locked-room mechanism directly to this individual?"
            ],
            "ready_for_prosecutor": ready
        }

mentor_service = MentorService()
