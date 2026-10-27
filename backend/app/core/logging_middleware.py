import time
import datetime
from collections import deque
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Ring buffer for recent 100 requests to display on support/diagnostics page
_recent_request_logs = deque(maxlen=100)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        method = request.method
        path = request.url.path

        try:
            response: Response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            status_code = 500
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            timestamp = datetime.datetime.utcnow().isoformat()
            log_entry = {
                "timestamp": timestamp,
                "method": method,
                "path": path,
                "status_code": 500,
                "duration_ms": elapsed_ms,
                "error": "Internal Server Error"
            }
            _recent_request_logs.appendleft(log_entry)
            print(f"[HTTP] {timestamp} | {method} {path} | 500 ERROR | {elapsed_ms}ms")
            raise e

        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        timestamp = datetime.datetime.utcnow().isoformat()

        # Sanitize sensitive endpoints from request details
        log_entry = {
            "timestamp": timestamp,
            "method": method,
            "path": path,
            "status_code": status_code,
            "duration_ms": elapsed_ms
        }
        _recent_request_logs.appendleft(log_entry)

        # Standard console log (No secrets, keys, or passwords)
        print(f"[HTTP] {timestamp} | {method} {path} | Status: {status_code} | {elapsed_ms}ms")

        # Expose custom response header with processing time
        response.headers["X-Response-Time-Ms"] = str(elapsed_ms)
        return response

def get_recent_request_logs(limit: int = 50):
    return list(_recent_request_logs)[:limit]

class RequestLogger:
    @property
    def recent_logs(self):
        return list(_recent_request_logs)

request_logger = RequestLogger()

