from fastapi import WebSocket
import json

class ConnectionManager:
    """Manage active WebSocket connections"""
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, username: str, websocket: WebSocket):
        """Accept connection and add to active list"""
        await websocket.accept()
        self.active_connections[username] = websocket

    def disconnect(self, username: str):
        """Remove user from active connections"""
        if username in self.active_connections:
            del self.active_connections[username]

    async def broadcast(self, message: dict):
        """Send message to all connected clients"""
        for username, connection in list(self.active_connections.items()):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(username)

    async def send_private(self, sender: str, recipient: str, message: dict):
        """Send a private message to recipient and sender"""
        # Send to recipient
        if recipient in self.active_connections:
            try:
                await self.active_connections[recipient].send_json(message)
            except Exception:
                self.disconnect(recipient)
                
        # Send to sender (to show in their own chat)
        if sender != recipient and sender in self.active_connections:
            try:
                await self.active_connections[sender].send_json(message)
            except Exception:
                self.disconnect(sender)

    async def broadcast_user_list(self):
        """Broadcast the list of currently connected users"""
        users = list(self.active_connections.keys())
        await self.broadcast({
            "type": "user_list",
            "users": users
        })

    def is_connected(self, username: str) -> bool:
        """Check if a user is currently connected"""
        return username in self.active_connections

# Singleton instance
manager = ConnectionManager()
