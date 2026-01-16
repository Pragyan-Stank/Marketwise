from sqlalchemy import Column, Integer, String, DateTime, JSON, Float
from database import Base
from datetime import datetime

class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    detected = Column(JSON, nullable=False)  # list of detected equipment names
    missing = Column(JSON, nullable=False)   # list of missing equipment names
    source = Column(String, nullable=False)  # e.g., "camera" or video filename
    confidence = Column(Float, nullable=True)  # optional overall confidence
