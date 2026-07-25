import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.websocket.manager import manager
from app.services import user_service, message_service

router = APIRouter()

@router.websocket("/ws/{username}")
async def websocket_endpoint(username: str, websocket: WebSocket, db: AsyncSession = Depends(get_db)):
    """Handle WebSocket connections for a user"""
    # 1. Accept connection
    await manager.connect(username, websocket)
    
    try:
        # 2. Get/create user and set online
        await user_service.get_or_create_user(db, username)
        await user_service.set_online(db, username, True)
        
        # 3. Save system message
        sys_msg_text = f"{username} joined the chat"
        sys_msg = await message_service.save_message(db, sender="system", content=sys_msg_text, message_type="system")
        
        # 4. Broadcast system message
        await manager.broadcast(sys_msg.to_dict())
        
        # 5. Broadcast user list
        await manager.broadcast_user_list()
        
        # 6. Send recent history to this user
        recent_messages = await message_service.get_recent_messages(db)
        await websocket.send_json({"type": "history", "messages": recent_messages})
        
        # Listen for messages
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
            except json.JSONDecodeError:
                continue
                
            msg_type = payload.get("type", "text")
            content = payload.get("content")
            recipient = payload.get("recipient")
            file_name = payload.get("file_name")
            file_path = payload.get("file_path")
            
            # Extract recipient from @username format if no explicit recipient
            if msg_type == "text" and content and content.startswith("@") and not recipient:
                parts = content.split(" ", 1)
                if len(parts) > 1:
                    recipient = parts[0][1:]
                    content = parts[1]
                    
            # Save message
            saved_msg = await message_service.save_message(
                db, 
                sender=username, 
                content=content, 
                message_type=msg_type, 
                recipient=recipient,
                file_name=file_name,
                file_path=file_path
            )
            
            # Send message
            msg_dict = saved_msg.to_dict()
            if recipient:
                await manager.send_private(username, recipient, msg_dict)
            else:
                await manager.broadcast(msg_dict)
                
    except WebSocketDisconnect:
        # Handle disconnect
        manager.disconnect(username)
        
        # Update user status
        await user_service.set_online(db, username, False)
        
        # Save and broadcast leave message
        sys_msg_text = f"{username} left the chat"
        sys_msg = await message_service.save_message(db, sender="system", content=sys_msg_text, message_type="system")
        
        await manager.broadcast(sys_msg.to_dict())
        await manager.broadcast_user_list()
        
    except Exception as e:
        print(f"WebSocket error for {username}: {e}")
        manager.disconnect(username)
