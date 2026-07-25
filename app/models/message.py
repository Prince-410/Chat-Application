from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database.connection import Base

class Message(Base):
    """Message model representing a chat message"""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sender = Column(String(50), nullable=False)
    recipient = Column(String(50), nullable=True) # Null means public broadcast
    content = Column(Text, nullable=True)
    message_type = Column(String(20), default="text") # text, file, system
    file_path = Column(String(500), nullable=True)
    file_name = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Convert the message to a dictionary"""
        return {
            "id": self.id,
            "sender": self.sender,
            "recipient": self.recipient,
            "content": self.content,
            "type": self.message_type,
            "message_type": self.message_type,
            "file_path": self.file_path,
            "file_name": self.file_name,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }

