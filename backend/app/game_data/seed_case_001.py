import json
from sqlalchemy.orm import Session
from app.models.models import Case, Suspect, Evidence, TimelineEvent

def seed_case_001(db: Session):
    existing_case = db.query(Case).filter(Case.case_id == "CZ-001").first()
    if existing_case:
        return existing_case

    case = Case(
        case_id="CZ-001",
        title="The Last Guest",
        summary="Tech mogul Adrian Vale is found dead in his private study during an elite dinner party at Vale Manor. The heavy oak door is deadbolted from the inside, and all five guests harbor deep secrets.",
        victim_name="Adrian Vale",
        victim_role="CEO & Founder, Vale Technologies",
        crime_location="Vale Manor — Private 2nd Floor Study",
        crime_time_est="Between 20:25 and 20:35",
        initial_facts=(
            "1. At 20:15, Adrian Vale excused himself from the dinner table to attend an urgent matter in his private study.\n"
            "2. At 20:45, personal secretary Oliver Grant knocked on the study door with tea and received no answer.\n"
            "3. At 21:00, the household forced the heavy study door open. The brass deadbolt was thrown shut from the inside.\n"
            "4. Adrian Vale was discovered slumped beside his mahogany desk, a spilled glass of scotch near his hand.\n"
            "5. Rain poured continuously throughout the evening. Only five guests were inside the manor."
        ),
        objective="Reconstruct the timeline, identify the killer, uncover the true motive, explain how the locked room was orchestrated, and substantiate your accusation with decisive forensic and documentary evidence.",
        difficulty="Intermediate",
        status="Active",
        cover_image="/assets/mansion_exterior.jpg",
        crime_scene_image="/assets/study_crime_scene.jpg",

        # CANONICAL SOLUTION (Hidden from client until accusation submitted!)
        culprit_suspect_name="Marcus Reed",
        canonical_motive="Adrian discovered that Marcus had embezzled $22.5 million from Vale Technologies into an offshore shell company ('Aegis Holdings Ltd'). Adrian printed the incriminating wire transfer audit and threatened to notify the SEC at 9:00 AM.",
        canonical_method="Poisoning via lethal dose of Digitalis Purpurea slipped into Adrian's scotch glass, combined with a monofilament nylon thread trick under the door to throw the interior deadbolt from the outside after exiting.",
        canonical_timeline_solution="Marcus excused himself at 20:25 claiming an overseas call. His call dropped at 20:26. He entered the study, poisoned Adrian's drink, retrieved the signed audit papers, rigged the nylon thread around the deadbolt thumb-turn, exited to the terrace at 20:38, and pulled the line through the door gap to lock it from the outside.",
        canonical_solution_explanation=(
            "Marcus Reed is the killer. He discovered Adrian's ultimatum on his desk calendar (EV-11). "
            "At 19:20, he took the digitalis phial from Dr. Shah's medical bag in the coat closet (EV-05). "
            "At 20:25, he left the dinner table claiming to take a business call on the terrace; however, phone records prove his call dropped at 20:26:14 (EV-04). "
            "He entered the study, poisoned Adrian's scotch (EV-02), and watched him collapse. "
            "To simulate a locked room, he used 20lb clear monofilament nylon thread (EV-14) looped around the brass thumb-turn, pulled it under the door gap upon exiting (EV-01), leaving the size 10 Vibram footprints on the wet terrace (EV-06). "
            "Oliver Grant spotted him in the corridor at 20:37 wearing silver hexagon cufflinks (EV-07, EV-08). "
            "Evelyn Vale and Clara Bennett have mutual alibis in the conservatory (EV-10), while Dr. Shah was with Clara in the parlor."
        ),
        decisive_evidence_codes=json.dumps(["EV-01", "EV-02", "EV-03", "EV-04", "EV-14"]),
        supporting_evidence_codes=json.dumps(["EV-05", "EV-06", "EV-07", "EV-08", "EV-11", "EV-12"]),
    )
    db.add(case)
    db.commit()
    db.refresh(case)

    # 5 Suspects
    suspects_data = [
        {
            "suspect_key": "evelyn_vale",
            "name": "Evelyn Vale",
            "role": "Spouse & Co-host",
            "relationship_to_victim": "Wife of 14 years",
            "public_bio": "Poised, patrician, and acutely conscious of family prestige. Evelyn co-founded several philanthropic foundations with Adrian and manages the Vale estate.",
            "known_alibi": "Claims she was in the glass conservatory having an intense argument with Clara Bennett between 20:20 and 20:35.",
            "portrait_image": "/assets/suspects/evelyn_vale.jpg",
            "speaking_style": "Controlled, articulate, ice-cold when pressed, deeply protective of her social standing.",
            "personality_prompt": "You are Evelyn Vale, Adrian Vale's wife. You speak with aristocratic restraint and composure. You were in the conservatory arguing with Clara Bennett between 20:20 and 20:35. You resented Adrian's coldness and recent secretive behavior, but you did not kill him. You know nothing about the offshore shell accounts or the locked door mechanism.",
            "known_facts": json.dumps([
                "Adrian seemed extremely tense throughout dinner and abruptly left the table at 20:15.",
                "Evelyn was arguing with Clara Bennett in the conservatory from 20:20 until 20:35 about a planned exposé.",
                "Adrian recently consulted divorce lawyers, which deeply humiliated Evelyn.",
                "Evelyn saw Marcus Reed head towards the terrace corridor around 20:24."
            ]),
            "private_secrets": json.dumps([
                "Adrian was planning to file for divorce and reduce her pre-nuptial entitlement.",
                "She had retained a private investigator to track Adrian's private finances."
            ]),
            "contradictions": json.dumps([
                "Initially claimed she was in the main dining hall the entire time, but later admits she was in the conservatory confronting Clara."
            ])
        },
        {
            "suspect_key": "marcus_reed",
            "name": "Marcus Reed",
            "role": "Business Partner & CFO",
            "relationship_to_victim": "Co-founder of Vale Technologies",
            "public_bio": "Shrewd financial strategist and Adrian's right-hand man for twelve years. Known for high-stakes risk-taking and an aggressive corporate demeanor.",
            "known_alibi": "Claims he was on the garden terrace on a continuous transatlantic investor phone call from 20:20 to 20:42.",
            "portrait_image": "/assets/suspects/marcus_reed.jpg",
            "speaking_style": "Sharp, brisk, defensively polite, quick to deflect financial inquiries onto company accounting teams.",
            "personality_prompt": "You are Marcus Reed, CFO of Vale Technologies and the killer. You appear confident, corporate, and mildly indignant when questioned. You claim you were on the terrace making an urgent investor call until 20:42. You try to downplay financial tensions with Adrian. If presented with the dropped call logs (EV-04) or Aegis wire transfers (EV-03), you become defensive, stammer, and claim 'bad cell reception' or 'tax restructuring'. Never confess directly unless overwhelmed with decisive evidence.",
            "known_facts": json.dumps([
                "Adrian was infuriated by financial discrepancies in Vale Tech's quarterly audit.",
                "Adrian demanded a private confrontation in his study during dinner.",
                "Marcus left the dinner table at 20:25 claiming to take an urgent call.",
                "Dr. Nina Shah's coat and bag were in the foyer closet near the entrance."
            ]),
            "private_secrets": json.dumps([
                "He embezzled $22.5M to Aegis Holdings Ltd and faced prison tomorrow morning.",
                "He stole Dr. Shah's digitalis vial at 19:20 and placed it in Adrian's scotch glass at 20:30.",
                "He used monofilament line to throw the interior deadbolt from the outside hallway before fleeing through the terrace."
            ]),
            "contradictions": json.dumps([
                "Claims he was on an uninterrupted phone call on the terrace until 20:42, but telecom logs show the call dropped at 20:26:14.",
                "Claims he had no disputes with Adrian, but Adrian's desk calendar explicitly notes '20:30 — M.R. confrontation. Surrender Aegis files or SEC will be at your door'."
            ])
        },
        {
            "suspect_key": "dr_nina_shah",
            "name": "Dr. Nina Shah",
            "role": "Personal Physician",
            "relationship_to_victim": "Longtime family doctor and confidante",
            "public_bio": "Distinguished cardiologist and personal physician to Adrian Vale for over a decade. Respected for clinical precision and ethical integrity.",
            "known_alibi": "Claims she was in the drawing room reading medical journals from 20:20 to 20:35, then joined Clara in the parlor.",
            "portrait_image": "/assets/suspects/dr_nina_shah.jpg",
            "speaking_style": "Clinical, measured, cautious with medical privacy, observant of somatic details.",
            "personality_prompt": "You are Dr. Nina Shah, Adrian Vale's personal physician. You speak precisely and objectively. You noticed that someone opened your emergency medical kit in the coat room earlier that evening, and an amber vial of concentrated digitalis is missing. You were terrified this would ruin your reputation. You know digitalis induces fatal arrhythmia within 10-15 minutes.",
            "known_facts": json.dumps([
                "Adrian suffered from mild hypertension and took prescribed beta-blockers.",
                "Her medical emergency kit contained concentrated Digitalis Purpurea for severe atrial flutter emergencies.",
                "She checked her coat pocket around 20:40 and realized the kit had been opened and the vial was gone.",
                "She did not kill Adrian, but feared her negligence in leaving the kit unsecured would implicate her."
            ]),
            "private_secrets": json.dumps([
                "Her digitalis vial was stolen from the coat closet between 19:10 and 19:30.",
                "She suspected one of the guests was the thief but kept quiet out of fear of medical malpractice suits."
            ]),
            "contradictions": json.dumps([
                "Initially claimed she had no medications with her, but forensic inspection of her bag shows the empty digitalis foam slot."
            ])
        },
        {
            "suspect_key": "oliver_grant",
            "name": "Oliver Grant",
            "role": "Private Secretary",
            "relationship_to_victim": "Confidential aide and scheduler",
            "public_bio": "Young, industrious, and perpetually anxious. Handles Adrian's private appointments, correspondence, and domestic logistics.",
            "known_alibi": "Was in the pantry preparing evening tea and filing quarterly tax receipts between 20:25 and 20:45.",
            "portrait_image": "/assets/suspects/oliver_grant.jpg",
            "speaking_style": "Nervous, apologetic, highly detail-oriented, eager to be helpful but easily intimidated.",
            "personality_prompt": "You are Oliver Grant, Adrian Vale's private secretary. You are nervous and observant. You were preparing tea around 20:35-20:40. In the 2nd-floor hallway near the study, you caught a glimpse of someone in a dark tuxedo with silver hexagonal cufflinks walking swiftly towards the terrace doors. You knocked on Adrian's study door at 20:45 and found it locked from the inside.",
            "known_facts": json.dumps([
                "Adrian had an explosive temper when auditing accounts earlier that afternoon.",
                "At 20:37, Oliver saw a figure in a black tuxedo with silver cufflinks leaving the study wing.",
                "At 20:45, Oliver brought tea to the study, knocked three times, and heard only dead silence.",
                "The study door deadbolt was definitely engaged from the inside when the lock was forced at 21:00."
            ]),
            "private_secrets": json.dumps([
                "Adrian had threatened to fire Oliver yesterday if the quarterly audit file was leaked.",
                "Oliver overheard Adrian screaming at Marcus in the foyer before dinner: 'I will destroy your career tomorrow morning!'."
            ]),
            "contradictions": json.dumps([
                "Failed to mention seeing the tuxedoed figure initially because he feared being blamed for trespassing in the private wing."
            ])
        },
        {
            "suspect_key": "clara_bennett",
            "name": "Clara Bennett",
            "role": "Investigative Journalist",
            "relationship_to_victim": "Press acquaintance & dinner guest",
            "public_bio": "Award-winning investigative reporter for The Financial Sentinel. Renowned for unmasking corporate shell games and embezzlement.",
            "known_alibi": "In the conservatory confronting Evelyn Vale until 20:35, then in the library taking notes.",
            "portrait_image": "/assets/suspects/clara_bennett.jpg",
            "speaking_style": "Skeptical, incisive, intellectually playful, always asking counter-questions.",
            "personality_prompt": "You are Clara Bennett, an investigative journalist. You attended dinner because an anonymous whistleblower tipped you off that Vale Technologies was moving millions into a Cayman shell called Aegis Holdings. You confronted Evelyn in the conservatory between 20:20 and 20:35 about whether she knew. You are keen to solve the murder yourself and see the detective as both rival and ally.",
            "known_facts": json.dumps([
                "An insider tipped her off two weeks ago regarding an offshore entity named 'Aegis Holdings Ltd'.",
                "She observed Marcus Reed sweating profusely and checking his phone repeatedly during the appetizer course.",
                "She was in the conservatory with Evelyn Vale continuously from 20:20 until 20:35.",
                "Adrian whispered to Marcus at 19:15: 'The party is over, Marcus'."
            ]),
            "private_secrets": json.dumps([
                "Her confidential whistleblower was actually Adrian Vale himself, who had just discovered the embezzlement and planned to use Clara to publicly expose Marcus."
            ]),
            "contradictions": json.dumps([
                "Claimed she came merely as a social guest, but her notebook is filled with audit codes and Marcus Reed's name circled."
            ])
        }
    ]

    for s_data in suspects_data:
        suspect = Suspect(case_id=case.id, **s_data)
        db.add(suspect)

    # 14 Evidence items
    evidence_data = [
        {
            "evidence_code": "EV-01",
            "title": "Study Interior Lock & Strike Plate",
            "type": "photo",
            "category": "forensics",
            "short_description": "Close-up forensic photograph of the heavy antique oak study door interior lock.",
            "full_description": "The study door was locked with a heavy brass deadbolt thrown into the jamb. High-magnification forensic examination revealed fine horizontal scuff marks along the strike plate and microscopic fibers of clear monofilament nylon wedged in the lower door seal.",
            "image_url": "/assets/evidence/locked_door.jpg",
            "forensic_details": json.dumps({
                "strike_wear": "Recent friction marks matching pulled monofilament line",
                "bolt_state": "Thrown shut from interior thumb-turn",
                "key_location": "Original brass key was on Adrian's desk tray inside the room"
            }),
            "significance": "decisive",
            "initial_discovered": True
        },
        {
            "evidence_code": "EV-02",
            "title": "Tipped Scotch Tumbler & Chemical Residue",
            "type": "photo",
            "category": "forensics",
            "short_description": "Crystal whisky glass spilled across Adrian's mahogany desk.",
            "full_description": "Mass spectrometry of the amber puddle and dried white residue on the inner rim confirmed high-purity Digitalis Purpurea extract dissolved in 25-year single malt scotch. Sufficient quantity to trigger lethal cardiac arrhythmia within 10 minutes.",
            "image_url": "/assets/evidence/scotch_glass.jpg",
            "forensic_details": json.dumps({
                "toxin": "Digitalis Purpurea (Cardiac Glycoside)",
                "concentration": "Lethal dose (>50mg/mL)",
                "drink": "Single Malt Scotch Whisky"
            }),
            "significance": "decisive",
            "initial_discovered": True
        },
        {
            "evidence_code": "EV-03",
            "title": "Confidential Wire Transfers: Aegis Holdings",
            "type": "document",
            "category": "finance",
            "short_description": "Auditor report detailing $22.5M diverted to offshore accounts.",
            "full_description": "Confidential banking wire transfers table showing $4,500,000 and $6,250,000 routed through Citigroup to 'Aegis Holdings Ltd'. Stamped CONFIDENTIAL with handwritten red audit notes: 'Flagged for follow-up — unauthorized authorizations by MR'.",
            "image_url": "/assets/evidence/financial_ledger.jpg",
            "forensic_details": json.dumps({
                "entity": "Aegis Holdings Ltd (Cayman Islands)",
                "total_defalcation": "$22,500,000 USD",
                "authorized_by": "M. Reed (CFO)"
            }),
            "significance": "decisive",
            "initial_discovered": True
        },
        {
            "evidence_code": "EV-04",
            "title": "Marcus Reed's Mobile Phone Carrier Log",
            "type": "report",
            "category": "timeline",
            "short_description": "Telecommunications sub-station record of Marcus Reed's iPhone.",
            "full_description": "Marcus Reed claimed he was engaged in an unbroken conference call on the garden terrace from 20:20 until 20:42. Cell tower telemetry records show outgoing call initiated at 20:21:02, but dropped due to antenna disconnect at 20:26:14. No other calls were made.",
            "image_url": "/assets/evidence/phone_carrier_log.jpg",
            "forensic_details": json.dumps({
                "claimed_call": "20:20 - 20:42",
                "actual_disconnect": "20:26:14",
                "gap": "16 minutes of unverified whereabouts"
            }),
            "significance": "decisive",
            "initial_discovered": False
        },
        {
            "evidence_code": "EV-05",
            "title": "Stolen Digitalis Purpurea Phial",
            "type": "photo",
            "category": "forensics",
            "short_description": "Vintage amber apothecary bottle recovered from police search.",
            "full_description": "A 50ml amber glass medicine phial labeled 'DIGITALIS PURPUREA 50ml / BATCH: 412'. Forensics recovered it from the coat closet in Dr. Nina Shah's doctor bag, where the foam insert slot was found torn and empty.",
            "image_url": "/assets/evidence/digitalis_phial.jpg",
            "forensic_details": json.dumps({
                "owner": "Dr. Nina Shah (registered medical inventory)",
                "status": "Stolen during dinner party between 19:10 and 19:30"
            }),
            "significance": "supporting",
            "initial_discovered": True
        },
        {
            "evidence_code": "EV-06",
            "title": "Wet Terrace Shoe Impressions",
            "type": "photo",
            "category": "forensics",
            "short_description": "Forensic cast of wet muddy shoe prints on stone terrace paving.",
            "full_description": "Size 10 Oxford dress shoe prints with distinct Vibram diamond-cut heels were found leading from the main terrace into the study exterior French door at 20:28, and returning towards the terrace corridor at 20:38.",
            "image_url": "/assets/evidence/terrace_shoe_prints.svg",
            "forensic_details": json.dumps({
                "size": "Men's UK 10 / US 11",
                "pattern": "Bespoke diamond tread",
                "matches": "Marcus Reed's dinner footwear"
            }),
            "significance": "supporting",
            "initial_discovered": True
        },
        {
            "evidence_code": "EV-07",
            "title": "Oliver Grant's Corroborative Hallway Sighting",
            "type": "report",
            "category": "alibi",
            "short_description": "Formal signed statement by secretary Oliver Grant.",
            "full_description": "At 20:37, while transporting tea from the second-floor service pantry, Oliver observed a guest in a tailored midnight tuxedo with silver hexagonal cufflinks walking briskly out of the study corridor towards the terrace door.",
            "image_url": "/assets/evidence/hallway_sighting_report.svg",
            "forensic_details": json.dumps({
                "time_sighted": "20:37",
                "clothing": "Midnight tuxedo, silver hexagonal cufflinks"
            }),
            "significance": "supporting",
            "initial_discovered": True
        },
        {
            "evidence_code": "EV-08",
            "title": "Marcus Reed's Hexagonal Silver Cufflinks",
            "type": "photo",
            "category": "physical",
            "short_description": "Pair of engraved sterling silver and onyx hexagonal cufflinks.",
            "full_description": "Marcus Reed was the sole attendee at the dinner wearing hexagonal geometric cufflinks. Swabbing of the right cufflink clasp revealed trace microscopic droplets of single malt scotch.",
            "image_url": "/assets/evidence/silver_cufflinks.svg",
            "forensic_details": json.dumps({
                "geometry": "Hexagonal sterling silver",
                "trace_substance": "Single malt scotch residue"
            }),
            "significance": "supporting",
            "initial_discovered": False
        },
        {
            "evidence_code": "EV-09",
            "title": "Draft Pre-Nuptial Amendment Agreement",
            "type": "document",
            "category": "finance",
            "short_description": "Legal draft discovered in Adrian's safe reducing Evelyn's settlement.",
            "full_description": "A confidential memorandum prepared by Adrian's estate attorney, dated four days prior, outlining strict forfeiture clauses in the event of marriage dissolution. Evelyn was unaware of this document until questioned by detectives.",
            "image_url": "/assets/evidence/prenup_amendment.svg",
            "forensic_details": json.dumps({
                "purpose": "Provides potential motive for Evelyn Vale, but she lacks opportunity during the critical 20:25-20:35 window."
            }),
            "significance": "misleading",
            "initial_discovered": True
        },
        {
            "evidence_code": "EV-10",
            "title": "Conservatory Witness Log (Evelyn & Clara)",
            "type": "report",
            "category": "alibi",
            "short_description": "Statements confirming mutual presence in the conservatory.",
            "full_description": "Clara Bennett and Evelyn Vale both confirm they were engaged in a continuous heated discussion regarding an upcoming media article inside the conservatory from 20:20 until 20:35 without interruption. This exonerates both from being inside the study at the time of poisoning.",
            "image_url": "/assets/evidence/conservatory_statement.svg",
            "forensic_details": json.dumps({
                "time_span": "20:20 - 20:35",
                "exonerates": ["Evelyn Vale", "Clara Bennett"]
            }),
            "significance": "exonerating",
            "initial_discovered": True
        },
        {
            "evidence_code": "EV-11",
            "title": "Adrian's Desk Calendar Notation",
            "type": "document",
            "category": "timeline",
            "short_description": "Handwritten note on Adrian's leather-bound desk calendar.",
            "full_description": "In Adrian's penmanship under the 20:30 slot: 'M.R. — Final opportunity. Return Aegis funds or documents go to the Federal Prosecutor at 9:00 AM.'",
            "image_url": "/assets/evidence/desk_calendar.svg",
            "forensic_details": json.dumps({
                "author": "Adrian Vale",
                "confrontation_target": "Marcus Reed (M.R.)"
            }),
            "significance": "supporting",
            "initial_discovered": True
        },
        {
            "evidence_code": "EV-12",
            "title": "Coroner's Autopsy & Toxicology Findings",
            "type": "report",
            "category": "forensics",
            "short_description": "Official post-mortem forensic medical report.",
            "full_description": "Coroner Dr. Vance reports Adrian Vale suffered acute cardiogenic shock caused by lethal digitalis ingestion. Blood saturation indicates death occurred between 20:30 and 20:35. No signs of struggle, trauma, or restraint.",
            "image_url": "/assets/evidence/autopsy_toxicology.svg",
            "forensic_details": json.dumps({
                "time_of_death": "20:30 - 20:35",
                "fatal_mechanism": "Ventricular fibrillation induced by Digitalis Purpurea"
            }),
            "significance": "supporting",
            "initial_discovered": True
        },
        {
            "evidence_code": "EV-13",
            "title": "Burnt Paper Fragment in Fireplace",
            "type": "photo",
            "category": "forensics",
            "short_description": "Charred scrap retrieved from study hearth.",
            "full_description": "A partially incinerated scrap bearing typed text: '...cannot allow you to dismantle everything we built...'. Forensic ink dating matches Marcus Reed's office typewriter.",
            "image_url": "/assets/evidence/burnt_letter_fragment.svg",
            "forensic_details": json.dumps({
                "source": "Office typewriter assigned to Marcus Reed"
            }),
            "significance": "supporting",
            "initial_discovered": False
        },
        {
            "evidence_code": "EV-14",
            "title": "Monofilament Nylon Thread Spool & Strand",
            "type": "photo",
            "category": "forensics",
            "short_description": "20lb clear fishing monofilament recovered under hallway carpet edge.",
            "full_description": "A 14-inch segment of high-tensile 20lb clear monofilament line found tucked under the brass threshold carpet strip outside the study door. Mechanical testing proves this was looped around the brass thumb-turn, passed under the door gap, and pulled to throw the deadbolt from the outside.",
            "image_url": "/assets/evidence/monofilament_thread.svg",
            "forensic_details": json.dumps({
                "mechanic": "Locked-room deadbolt trick",
                "line_type": "20lb Clear Fluorocarbon/Nylon"
            }),
            "significance": "decisive",
            "initial_discovered": False
        }
    ]

    for ev in evidence_data:
        evidence = Evidence(case_id=case.id, **ev)
        db.add(evidence)

    # Canonical Timeline Events
    timeline_data = [
        {
            "time_marker": "19:15",
            "title": "Guests Arrive / Heated Whispers",
            "location": "Vale Manor Foyer & Coat Room",
            "description": "Guests arrive. Dr. Shah places her medical emergency bag in the foyer coat closet. Adrian pulls Marcus aside and is heard stating 'The party is over'. Marcus slips into the coat closet around 19:20.",
            "is_established_fact": True,
            "associated_suspects": json.dumps(["Marcus Reed", "Dr. Nina Shah", "Adrian Vale"]),
            "conflicting_claims": "Marcus denies speaking with Adrian in the foyer.",
            "supporting_evidence_codes": json.dumps(["EV-05"])
        },
        {
            "time_marker": "19:30",
            "title": "Dinner Commences in the Grand Dining Hall",
            "location": "Grand Dining Hall",
            "description": "All five guests and Adrian Vale sit down for dinner. Marcus appears distracted and continuously checks his smartphone.",
            "is_established_fact": True,
            "associated_suspects": json.dumps(["Evelyn Vale", "Marcus Reed", "Dr. Nina Shah", "Oliver Grant", "Clara Bennett"]),
            "conflicting_claims": None,
            "supporting_evidence_codes": json.dumps([])
        },
        {
            "time_marker": "20:15",
            "title": "Adrian Excuses Himself to the Study",
            "location": "2nd Floor Private Study",
            "description": "Adrian abruptly stands up, announcing he has urgent business that cannot wait, and retreats to his second-floor study.",
            "is_established_fact": True,
            "associated_suspects": json.dumps(["Adrian Vale"]),
            "conflicting_claims": None,
            "supporting_evidence_codes": json.dumps(["EV-11"])
        },
        {
            "time_marker": "20:20 - 20:35",
            "title": "Conservatory Confrontation",
            "location": "Glass Conservatory",
            "description": "Evelyn Vale and Clara Bennett engage in a loud, continuous confrontation regarding Clara's upcoming investigative report.",
            "is_established_fact": True,
            "associated_suspects": json.dumps(["Evelyn Vale", "Clara Bennett"]),
            "conflicting_claims": "Both confirm each other's uninterrupted presence.",
            "supporting_evidence_codes": json.dumps(["EV-10"])
        },
        {
            "time_marker": "20:25",
            "title": "Marcus Leaves the Table / The Phone Call Gap",
            "location": "Garden Terrace & Study Corridor",
            "description": "Marcus excuses himself for an urgent business call. His call drops at 20:26:14, leaving him unaccounted for until 20:42.",
            "is_established_fact": True,
            "associated_suspects": json.dumps(["Marcus Reed"]),
            "conflicting_claims": "Marcus claims he was on the call until 20:42.",
            "supporting_evidence_codes": json.dumps(["EV-04", "EV-06"])
        },
        {
            "time_marker": "20:30 - 20:35",
            "title": "The Poisoning of Adrian Vale",
            "location": "2nd Floor Private Study",
            "description": "The killer enters the study, slips digitalis into Adrian's scotch. Adrian consumes the drink and collapses from sudden cardiac arrest.",
            "is_established_fact": True,
            "associated_suspects": json.dumps(["Adrian Vale", "Marcus Reed"]),
            "conflicting_claims": None,
            "supporting_evidence_codes": json.dumps(["EV-02", "EV-12", "EV-03"])
        },
        {
            "time_marker": "20:37",
            "title": "Corridor Sighting & Locked Room Setup",
            "location": "2nd Floor Corridor outside Study",
            "description": "Marcus closes the study door, loops the monofilament line under the door to throw the brass deadbolt, and flees down the terrace steps. Oliver Grant glimpses his cufflinks.",
            "is_established_fact": True,
            "associated_suspects": json.dumps(["Marcus Reed", "Oliver Grant"]),
            "conflicting_claims": "Marcus denies being on the second floor.",
            "supporting_evidence_codes": json.dumps(["EV-01", "EV-07", "EV-08", "EV-14"])
        },
        {
            "time_marker": "20:45",
            "title": "Oliver Grant Discovers Locked Door",
            "location": "Study Doorway",
            "description": "Oliver Grant arrives with tea tray, knocks repeatedly, receives no answer, and notes the heavy deadbolt is thrown shut from the inside.",
            "is_established_fact": True,
            "associated_suspects": json.dumps(["Oliver Grant"]),
            "conflicting_claims": None,
            "supporting_evidence_codes": json.dumps(["EV-01"])
        },
        {
            "time_marker": "21:00",
            "title": "Door Forced Open / Body Discovered",
            "location": "2nd Floor Study",
            "description": "The guests force open the study door. Dr. Nina Shah confirms Adrian Vale is deceased.",
            "is_established_fact": True,
            "associated_suspects": json.dumps(["Evelyn Vale", "Marcus Reed", "Dr. Nina Shah", "Oliver Grant", "Clara Bennett"]),
            "conflicting_claims": None,
            "supporting_evidence_codes": json.dumps(["EV-01", "EV-02"])
        }
    ]

    for t_data in timeline_data:
        timeline_event = TimelineEvent(case_id=case.id, **t_data)
        db.add(timeline_event)

    db.commit()
    return case
