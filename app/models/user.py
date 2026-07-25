from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from app.database.connection import Base

class User(Base):
    """User model representing a chat participant"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_online = Column(Boolean, default=False)
