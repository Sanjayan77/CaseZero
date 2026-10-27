import os
import datetime
from typing import Dict, Any, List, Optional
import pymongo
from app.core.config import settings

class MongoDBManager:
    def __init__(self):
        self.uri = settings.MONGODB_URI
        self.db_name = settings.MONGODB_DB_NAME
        self.client = None
        self.db = None
        self.is_connected = False
        self.is_mock = False
        self._init_connection()

    def _init_connection(self):
        # Allow explicit mock mode via env var or testing
        if self.uri.startswith("mock://") or self.uri == "mock":
            try:
                import mongomock
                self.client = mongomock.MongoClient()
                self.db = self.client[self.db_name]
                self.is_connected = True
                self.is_mock = True
                print(f"[MongoDB] Running in Mock mode for test environment.")
                return
            except ImportError:
                pass

        try:
            self.client = pymongo.MongoClient(self.uri, serverSelectionTimeoutMS=1500)
            # Test connection with ping
            self.client.admin.command("ping")
            self.db = self.client[self.db_name]
            self.is_connected = True
            self.is_mock = False
            print(f"[MongoDB] Connected successfully to {self.uri}/{self.db_name}")
        except Exception as e:
            # Fallback to in-memory mongomock for graceful offline operation without crashing app
            try:
                import mongomock
                self.client = mongomock.MongoClient()
                self.db = self.client[self.db_name]
                self.is_connected = False
                self.is_mock = True
                self.offline_reason = str(e)
                print(f"[MongoDB] Live server unreachable ({e}). Using graceful offline mock store.")
            except Exception as ex:
                self.client = None
                self.db = None
                self.is_connected = False
                self.offline_reason = str(ex)

    def check_health(self) -> Dict[str, Any]:
        """Check live connection status for the diagnostics/health-check endpoint."""
        if not self.is_mock and self.is_connected and self.client:
            try:
                self.client.admin.command("ping")
                return {
                    "status": "connected",
                    "mode": "live",
                    "uri": self.uri.split("@")[-1] if "@" in self.uri else self.uri,
                    "database": self.db_name,
                    "collections": self.db.list_collection_names()
                }
            except Exception as e:
                return {
                    "status": "disconnected",
                    "mode": "live",
                    "error": str(e)
                }
        return {
            "status": "mock_fallback" if self.is_mock else "disconnected",
            "mode": "mock" if self.is_mock else "none",
            "database": self.db_name,
            "message": "Live MongoDB daemon not detected. Using mock store for logs & feedback.",
            "setup_help": "Set MONGODB_URI in backend/.env to your MongoDB Atlas or local daemon URL (e.g. mongodb://localhost:27017)."
        }

    def save_chat_log(
        self,
        session_id: str,
        user_message: str,
        assistant_response: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[str]:
        """Archive assistant chat interaction."""
        if self.db is None:
            return None
        try:
            doc = {
                "session_id": session_id,
                "user_message": user_message,
                "assistant_response": assistant_response,
                "metadata": metadata or {},
                "created_at": datetime.datetime.utcnow().isoformat()
            }
            res = self.db.assistant_chat_logs.insert_one(doc)
            return str(res.inserted_id)
        except Exception as e:
            print(f"[MongoDB] Failed to write chat log: {e}")
            return None

    def get_chat_logs(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Retrieve recent assistant interaction logs."""
        if self.db is None:
            return []
        try:
            cursor = self.db.assistant_chat_logs.find().sort("created_at", -1).limit(limit)
            logs = []
            for doc in cursor:
                doc["_id"] = str(doc["_id"])
                logs.append(doc)
            return logs
        except Exception as e:
            print(f"[MongoDB] Failed to read chat logs: {e}")
            return []

    def save_feedback(
        self,
        session_id: str,
        rating: int,
        comments: Optional[str] = None,
        category: str = "general"
    ) -> Optional[str]:
        """Save user feedback in MongoDB."""
        if self.db is None:
            return None
        try:
            doc = {
                "session_id": session_id,
                "rating": rating,
                "comments": comments or "",
                "category": category,
                "created_at": datetime.datetime.utcnow().isoformat()
            }
            res = self.db.user_feedback.insert_one(doc)
            return str(res.inserted_id)
        except Exception as e:
            print(f"[MongoDB] Failed to write feedback: {e}")
            return None

    def get_feedback(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Retrieve user feedback records."""
        if self.db is None:
            return []
        try:
            cursor = self.db.user_feedback.find().sort("created_at", -1).limit(limit)
            items = []
            for doc in cursor:
                doc["_id"] = str(doc["_id"])
                items.append(doc)
            return items
        except Exception as e:
            print(f"[MongoDB] Failed to read feedback: {e}")
            return []

mongo_manager = MongoDBManager()
