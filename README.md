# 💬 ChatHub - Real-Time Chat Application

A modern, full-featured real-time chat application built with **FastAPI**, **WebSockets**, **SQLite (SQLAlchemy Async)**, and **Jinja2 templates** styled with a sleek dark glassmorphism design system.

---

## ✨ Features

- ⚡ **Real-Time Communication**: Instant messaging powered by WebSockets without page refreshes.
- 👤 **Multi-User Presence**: Users join with a username and real-time online status indicators are broadcasted live.
- 🔒 **Private Messaging**: Send direct messages to specific users using the `@username message` format.
- 📁 **File Sharing**: Upload and download images, PDFs, Word documents, and text files (up to 10MB) with inline preview thumbnails.
- 😊 **Emoji Picker**: Built-in emoji grid categorized by smileys, gestures, hearts, and objects.
- 🕒 **Message Timestamps**: Accurate local timestamps for every message.
- 📢 **System Notifications**: Centered, live alerts when users join or leave the chat.
- 💾 **Persistent Chat History**: All messages, user statuses, and uploaded files are saved in an SQLite database.
- 🕰️ **Chat History Viewer**: Inspect full stored conversation logs directly from the chat header modal.
- 📱 **Responsive Dark UI**: Premium glassmorphism dark theme with mobile drawer navigation and micro-animations.

---

## 📁 Project Structure

```
Chat-Application/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entrypoint & static mounting
│   ├── config.py               # Configuration settings (DB URL, upload limits, extensions)
│   ├── database/
│   │   ├── connection.py       # Async SQLAlchemy engine & session factory
│   │   └── init_db.py          # Automatic SQLite table initialization
│   ├── models/
│   │   ├── user.py             # User model (id, username, created_at, is_online)
│   │   └── message.py          # Message model (sender, recipient, content, file_path, timestamp)
│   ├── services/
│   │   ├── user_service.py     # User creation, lookup, and online status management
│   │   ├── message_service.py  # Persistence & querying of public/private chat history
│   │   └── file_service.py     # Upload validation, saving to disk, serving downloads
│   ├── websocket/
│   │   ├── manager.py          # ConnectionManager singleton (broadcasts, private DMs, presence)
│   │   └── handler.py          # WebSocket route endpoint (`/ws/{username}`)
│   ├── routes/
│   │   ├── pages.py            # Jinja2 template page routes (`/` login, `/chat`)
│   │   └── api.py              # REST endpoints (`/api/upload`, `/api/download`, `/api/history`)
│   ├── templates/
│   │   ├── base.html           # Base Jinja2 layout with Inter font and CSS links
│   │   ├── login.html          # Username entry card with client-side validation
│   │   └── chat.html           # Main chatroom layout (sidebar, chat feed, input bar, modal)
│   └── static/
│       ├── css/
│       │   └── style.css       # Complete dark modern glassmorphism styling
│       └── js/
│           └── chat.js         # WebSocket client logic, DOM rendering, emoji picker
├── uploads/                    # Directory where uploaded files are stored
├── chat.db                     # SQLite database created automatically on first run
├── requirements.txt            # Python dependencies
├── run.py                      # Application launcher script
└── README.md                   # Project documentation
```

---

## ⚙️ Installation & Setup Instructions

### Prerequisites
- **Python 3.9+** installed on your system.

### 1. Clone or Open the Repository
Navigate to the project root directory:
```bash
cd Chat-Application
```

### 2. Create a Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## 🚀 Running the Application

Start the FastAPI server using `run.py`:
```bash
python run.py
```

Alternatively, launch directly with Uvicorn:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open your browser and visit:
👉 **[http://localhost:8000](http://localhost:8000)**

---

## 💡 How to Use

1. **Join Chat**:
   - Enter a unique username (2–20 characters, letters/numbers/underscores) and click **Join Chat**.
   
2. **Public Chat**:
   - Type your message in the input box at the bottom and press **Enter** (or click **➤**).
   - All online users will receive your message instantly.

3. **Private Messaging**:
   - Type `@username your message here` (e.g., `@alex hey there!`) or simply **click a user's name** in the sidebar to auto-insert `@username `.
   - Only you and the recipient will see private messages (distinguished with a 🔒 lock icon and purple highlight).

4. **Sending Emojis**:
   - Click the 😊 button to open the categorized emoji panel and click any emoji to insert it into your message.

5. **Uploading & Downloading Files**:
   - Click the 📎 button to select an image, PDF, Word doc, or text file (up to 10MB).
   - Add an optional text caption and send. Images show an inline preview; all files include a direct download link.

6. **Viewing Chat History**:
   - Click the 🕰️ history icon in the top header to view past messages loaded directly from the SQLite database.

---

## 🛠️ Technology Stack

- **Backend**: FastAPI, Uvicorn, Python 3.9+
- **Database**: SQLite, SQLAlchemy (Async Engine), `aiosqlite`
- **WebSockets**: Native FastAPI `WebSocket` & custom `ConnectionManager`
- **Frontend**: HTML5, CSS3 (Vanilla Dark Glassmorphism Design System), JavaScript (ES6+), Jinja2 Templates
