import json
from sqlalchemy.orm import Session
from models import Log
from datetime import datetime

def save_logs(db: Session, logs: list[dict], source: str):
    """Persist detection logs to the database."""
    for entry in logs:
        log = Log(
            person_id=entry.get("id"),
            timestamp=datetime.fromisoformat(entry.get("timestamp")) if isinstance(entry.get("timestamp"), str) else datetime.now(),
            detected=entry.get("detected", []),
            missing=entry.get("missing", []),
            source=source,
            confidence=entry.get("confidence"),
        )
        db.add(log)
    db.commit()
