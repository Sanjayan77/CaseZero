from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter(prefix="/api/errors", tags=["Error Scenarios & Diagnostics"])

SUPPORTED_ERROR_CODES = [
    {
        "status_code": 400,
        "name": "Bad Request",
        "description": "The client submitted malformed JSON, missing required fields, or invalid investigation parameters.",
        "casezero_context": "Occurs when sending an invalid accusation payload or malformed evidence inspect request.",
        "resolution": "Check the request body against OpenAPI schemas and ensure all required fields are present."
    },
    {
        "status_code": 401,
        "name": "Unauthorized",
        "description": "Authentication credentials are missing, malformed, or expired.",
        "casezero_context": "Occurs when making protected API calls without a valid Bearer JWT token in the Authorization header.",
        "resolution": "Log in again via /api/auth/login or use the demo login to acquire a fresh JWT token."
    },
    {
        "status_code": 403,
        "name": "Forbidden",
        "description": "Authenticated user does not have permission to access the requested resource.",
        "casezero_context": "Occurs when an investigator attempts to view or alter another investigator's active case file.",
        "resolution": "Ensure you are querying investigations owned by your authenticated user ID."
    },
    {
        "status_code": 404,
        "name": "Not Found",
        "description": "The requested endpoint, suspect, evidence item, or case does not exist in the database.",
        "casezero_context": "Occurs when navigating to an unrecognized route or querying a non-existent case ID.",
        "resolution": "Verify the URL path and inspect the CaseZero directory for valid routes."
    },
    {
        "status_code": 429,
        "name": "Too Many Requests",
        "description": "The client has exceeded the permitted rate limit or API quota within a given time window.",
        "casezero_context": "Occurs when rapid-fire interrogation requests exceed Gemini API free-tier quotas.",
        "resolution": "Wait a few seconds for quota replenishment or rely on our automated fallback engine."
    },
    {
        "status_code": 500,
        "name": "Internal Server Error",
        "description": "An unexpected server-side exception occurred while processing the request.",
        "casezero_context": "Occurs if unhandled exceptions arise during database transactions or template compilation.",
        "resolution": "Review server logs for stack traces and check database connectivity."
    },
    {
        "status_code": 503,
        "name": "Service Unavailable",
        "description": "The server or an upstream service (such as Gemini AI) is temporarily overloaded or down for maintenance.",
        "casezero_context": "Occurs when cloud LLM providers experience regional demand spikes.",
        "resolution": "Retry after a brief delay. CaseZero automatically switches to candidate models."
    },
    {
        "status_code": 423,
        "name": "CZ-423: Case File Sealed",
        "description": "Site-specific forensic lockout error indicating classified materials are currently impounded under judicial seal.",
        "casezero_context": "Forensics protocol restriction: Evidence tampering detected or prerequisite warrant missing.",
        "resolution": "Acquire prerequisite forensic clearance or inspect preliminary crime scene items first."
    }
]

@router.get("/documentation")
def get_error_documentation():
    return {
        "title": "CaseZero Diagnostic Error Code Reference",
        "site_specific_code": {
            "code": "CZ-423 / HTTP 423",
            "name": "Case File Sealed",
            "description": "Classified forensic artifact locked under court impound warrant."
        },
        "errors": SUPPORTED_ERROR_CODES
    }

@router.get("/trigger/{code}")
def trigger_error_scenario(code: int):
    """Controlled endpoint to test error handlers for all 8 supported error codes."""
    if code == 400:
        raise HTTPException(status_code=400, detail="HTTP 400 Bad Request: Missing required investigation parameters.")
    elif code == 401:
        raise HTTPException(status_code=401, detail="HTTP 401 Unauthorized: Valid Bearer JWT authentication required.")
    elif code == 403:
        raise HTTPException(status_code=403, detail="HTTP 403 Forbidden: Access to classified investigation file is restricted.")
    elif code == 404:
        raise HTTPException(status_code=404, detail="HTTP 404 Not Found: The requested forensic asset or case does not exist.")
    elif code == 429:
        raise HTTPException(status_code=429, detail="HTTP 429 Too Many Requests: Interrogation rate limit exceeded. Please throttle requests.")
    elif code == 500:
        raise HTTPException(status_code=500, detail="HTTP 500 Internal Server Error: Simulated unexpected forensic database failure.")
    elif code == 503:
        raise HTTPException(status_code=503, detail="HTTP 503 Service Unavailable: Upstream forensic service temporarily unreachable.")
    elif code == 423:
        raise HTTPException(status_code=423, detail="CZ-423 Case File Sealed: Exhibit is impounded under judicial court seal.")
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported test code {code}. Choose from [400, 401, 403, 404, 429, 500, 503, 423].")
