import json
from typing import Dict, Any, List
from app.models.models import Case
from app.schemas.schemas import ScoreBreakdownSchema

class ScoringService:
    @staticmethod
    def evaluate_accusation(
        case: Case,
        suspect_name: str,
        motive: str,
        method: str,
        timeline_explanation: str,
        supporting_evidence_codes: List[str],
        written_deduction: str
    ) -> ScoreBreakdownSchema:
        evaluations = {}

        # 1. Culprit (35 points)
        is_correct_culprit = "marcus" in suspect_name.lower()
        if is_correct_culprit:
            culprit_score = 35
            evaluations["culprit"] = "Correct. Marcus Reed is the perpetrator who orchestrated the murder."
        else:
            culprit_score = 0
            evaluations["culprit"] = f"Incorrect. {suspect_name} is innocent. Forensic evidence and verified alibis clear them."

        # 2. Motive (15 points)
        motive_lower = motive.lower() + " " + written_deduction.lower()
        motive_matches = sum(1 for kw in ["embezzle", "aegis", "fraud", "22.5", "audit", "sec", "stole", "millions", "wire transfer"] if kw in motive_lower)
        if motive_matches >= 3:
            motive_score = 15
            evaluations["motive"] = "Exemplary. You accurately identified the $22.5M Aegis Holdings embezzlement and Adrian's ultimatum."
        elif motive_matches >= 1:
            motive_score = 10
            evaluations["motive"] = "Partially accurate. You identified financial tension, though missed specific offshore details."
        else:
            motive_score = 4
            evaluations["motive"] = "Weak. The alleged motive does not align with the discovered financial audit records."

        # 3. Method (15 points)
        method_lower = method.lower() + " " + written_deduction.lower()
        method_matches = sum(1 for kw in ["digitalis", "poison", "scotch", "whisky", "thread", "monofilament", "nylon", "deadbolt", "thumb-turn", "string"] if kw in method_lower)
        if method_matches >= 3:
            method_score = 15
            evaluations["method"] = "Flawless deduction. You resolved both the lethal digitalis poisoning and the monofilament locked-room deadbolt trick."
        elif method_matches >= 1:
            method_score = 9
            evaluations["method"] = "Substantial. You identified the poison mechanism, but lacked the complete explanation for the locked door."
        else:
            method_score = 3
            evaluations["method"] = "Unsubstantiated. Forensic analysis refutes this mechanism."

        # 4. Timeline reasoning (15 points)
        timeline_lower = timeline_explanation.lower() + " " + written_deduction.lower()
        timeline_matches = sum(1 for kw in ["20:25", "20:26", "drop", "carrier", "call", "20:37", "terrace", "conservatory", "alibi", "20:30"] if kw in timeline_lower)
        if timeline_matches >= 3:
            timeline_score = 15
            evaluations["timeline"] = "Rigorous. You caught the 20:26 cell phone drop and mapped the perpetrator's movements precisely."
        elif timeline_matches >= 1:
            timeline_score = 9
            evaluations["timeline"] = "Adequate. You established the approximate time frame, but overlooked critical telecom discrepancies."
        else:
            timeline_score = 4
            evaluations["timeline"] = "Imprecise chronology. Contradicted by established witness logs and telecommunications telemetry."

        # 5. Supporting Evidence (15 points)
        decisive_set = set(json.loads(case.decisive_evidence_codes))
        supporting_set = set(json.loads(case.supporting_evidence_codes))
        player_set = set(supporting_evidence_codes)

        correct_decisive = len(player_set.intersection(decisive_set))
        correct_supporting = len(player_set.intersection(supporting_set))

        # Reward decisive clues (up to 10), supporting clues (up to 5)
        raw_evidence_score = (correct_decisive * 2.5) + (correct_supporting * 1.0)
        evidence_score = int(min(15, raw_evidence_score))
        evaluations["evidence"] = f"Cited {correct_decisive} decisive forensic items and {correct_supporting} corroborating clues."

        # 6. Written Explanation Quality (5 points)
        words_count = len(written_deduction.split())
        if words_count >= 30 and (is_correct_culprit or motive_score >= 10):
            explanation_score = 5
            evaluations["explanation"] = "Comprehensive, articulate detective synthesis."
        elif words_count >= 15:
            explanation_score = 3
            evaluations["explanation"] = "Coherent brief, though concise in investigative detail."
        else:
            explanation_score = 1
            evaluations["explanation"] = "Cursory summary."

        total_score = culprit_score + motive_score + method_score + timeline_score + evidence_score + explanation_score

        return ScoreBreakdownSchema(
            culprit_score=culprit_score,
            motive_score=motive_score,
            method_score=method_score,
            timeline_score=timeline_score,
            evidence_score=evidence_score,
            explanation_score=explanation_score,
            total_score=total_score,
            is_correct_culprit=is_correct_culprit,
            evaluations=evaluations
        )

    @staticmethod
    def get_suspect_resolutions() -> Dict[str, str]:
        return {
            "Evelyn Vale": "Exonerated. Clara Bennett and conservatory servants corroborate she was engaged in a heated discussion in the conservatory continuously from 20:20 until 20:35 without leaving.",
            "Marcus Reed": "GUILTY. Embezzled $22.5M to Aegis Holdings Ltd. Stole digitalis from Dr. Shah's satchel at 19:20. Phone log proves his alibi collapsed at 20:26:14. Entered study, poisoned scotch, and threw interior deadbolt using 20lb monofilament line under door.",
            "Dr. Nina Shah": "Exonerated. Her digitalis phial was stolen from her unsecured coat bag in the foyer before dinner. She was in the drawing room reading until 20:35, then joined guests in the parlor.",
            "Oliver Grant": "Exonerated. Preparing tea in the pantry between 20:25 and 20:45. His sighting of Marcus in the corridor at 20:37 provided the crucial visual identification.",
            "Clara Bennett": "Exonerated. In the conservatory confronting Evelyn Vale until 20:35. Her investigation into Aegis Holdings provided the independent verification of Marcus's shell company."
        }
