from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_, desc
from app.models.message import Message

async def save_message(db: AsyncSession, sender: str, content: str = None, message_type: str = "text", recipient: str = None, file_path: str = None, file_name: str = None) -> Message:
    """Save a new message to the database"""
    msg = Message(
        sender=sender,
        content=content,
        message_type=message_type,
        recipient=recipient,
        file_path=file_path,
        file_name=file_name
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg

async def get_recent_messages(db: AsyncSession, limit: int = 50) -> list[dict]:
    """Get recent public messages"""
    result = await db.execute(
        select(Message)
        .where(Message.recipient == None)
        .order_by(desc(Message.timestamp))
        .limit(limit)
    )
    messages = result.scalars().all()
    # Return in chronological order
    return [msg.to_dict() for msg in reversed(messages)]

async def get_private_messages(db: AsyncSession, user1: str, user2: str, limit: int = 50) -> list[dict]:
    """Get private messages between two users"""
    result = await db.execute(
        select(Message)
        .where(
            or_(
                and_(Message.sender == user1, Message.recipient == user2),
                and_(Message.sender == user2, Message.recipient == user1)
            )
        )
        .order_by(desc(Message.timestamp))
        .limit(limit)
    )
    messages = result.scalars().all()
    return [msg.to_dict() for msg in reversed(messages)]
