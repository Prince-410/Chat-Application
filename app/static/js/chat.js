document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const userList = document.getElementById('user-list');
    const userCount = document.getElementById('user-count');
    const emojiBtn = document.getElementById('emoji-btn');
    const emojiPicker = document.getElementById('emoji-picker');
    const fileInput = document.getElementById('file-input');
    const filePreview = document.getElementById('file-preview');
    const filePreviewName = document.getElementById('file-preview-name');
    const removeFileBtn = document.getElementById('remove-file-btn');
    const historyBtn = document.getElementById('history-btn');
    const historyModal = document.getElementById('history-modal');
    const closeHistoryBtn = document.getElementById('close-history');
    const historyMessages = document.getElementById('history-messages');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');

    // State
    let socket = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let selectedFile = null;

    // Emojis Data
    const emojis = {
        "Smileys": ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐"],
        "Gestures": ["👍", "👎", "👊", "✊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✌️", "🤞", "🤟", "🤘", "👌", "🤌", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤙", "💪"],
        "Hearts": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝"],
        "Objects": ["🔥", "⭐", "🌟", "✨", "⚡", "💯", "🎉", "🎊", "🏆", "🥇", "🎯", "🚀", "💡", "📌", "📎", "📁", "📂", "📄", "📝"]
    };

    // Initialize Emoji Picker
    function initEmojiPicker() {
        emojiPicker.innerHTML = '';
        for (const [category, emojiList] of Object.entries(emojis)) {
            const catDiv = document.createElement('div');
            catDiv.className = 'emoji-category';
            catDiv.textContent = category;
            emojiPicker.appendChild(catDiv);

            const gridDiv = document.createElement('div');
            gridDiv.className = 'emoji-grid';
            emojiList.forEach(emoji => {
                const btn = document.createElement('button');
                btn.className = 'emoji-btn';
                btn.textContent = emoji;
                btn.onclick = () => {
                    const start = messageInput.selectionStart;
                    const end = messageInput.selectionEnd;
                    const text = messageInput.value;
                    messageInput.value = text.substring(0, start) + emoji + text.substring(end);
                    messageInput.selectionStart = messageInput.selectionEnd = start + emoji.length;
                    messageInput.focus();
                };
                gridDiv.appendChild(btn);
            });
            emojiPicker.appendChild(gridDiv);
        }
    }
    initEmojiPicker();

    // WebSocket Connection
    function connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/${encodeURIComponent(CURRENT_USER)}`;
        
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log('Connected to WebSocket');
            reconnectAttempts = 0;
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleIncomingMessage(data);
            } catch (e) {
                console.error('Error parsing message', e);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket closed');
            if (reconnectAttempts < maxReconnectAttempts) {
                const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
                setTimeout(connectWebSocket, timeout);
                reconnectAttempts++;
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };
    }

    // Message Handlers
    function handleIncomingMessage(data) {
        const msgType = data.type || data.message_type;
        if (msgType === 'chat' || msgType === 'text') {
            renderMessage(data, chatMessages);
        } else if (msgType === 'system') {
            renderSystemMessage(data, chatMessages);
        } else if (msgType === 'file') {
            renderFileMessage(data, chatMessages);
        } else if (msgType === 'user_list') {
            updateUserList(data.users);
        } else if (msgType === 'history') {
            renderHistory(data.messages);
        }
        scrollToBottom(chatMessages);
    }


    function renderMessage(data, container) {
        // Remove empty state if present
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        const msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        const isOwn = data.sender === CURRENT_USER;
        if (isOwn) msgDiv.classList.add('message-own');
        if (data.recipient) msgDiv.classList.add('message-private');

        const timeStr = formatTimestamp(data.timestamp);
        
        let contentHtml = escapeHtml(data.content || '');
        let privacyBadge = data.recipient ? ' <span title="Private Message">🔒</span>' : '';

        msgDiv.innerHTML = `
            ${!isOwn ? `<div class="user-avatar" style="background:${getAvatarColor(data.sender)}; margin-right: 8px;">${data.sender.charAt(0).toUpperCase()}</div>` : ''}
            <div class="message-bubble">
                <div class="message-header">
                    <span class="message-username">${escapeHtml(data.sender)}${privacyBadge}</span>
                    <span class="message-time">${timeStr}</span>
                </div>
                <div class="message-content">${contentHtml}</div>
            </div>
            ${isOwn ? `<div class="user-avatar" style="background:${getAvatarColor(data.sender)}; margin-left: 8px;">${data.sender.charAt(0).toUpperCase()}</div>` : ''}
        `;
        container.appendChild(msgDiv);
    }

    function renderSystemMessage(data, container) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message message-system';
        msgDiv.innerHTML = `
            <div class="message-bubble">
                ${data.content.includes('join') ? '👋' : '🚪'} ${escapeHtml(data.content)}
            </div>
        `;
        container.appendChild(msgDiv);
    }

    function renderFileMessage(data, container) {
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        const msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        const isOwn = data.sender === CURRENT_USER;
        if (isOwn) msgDiv.classList.add('message-own');
        
        const timeStr = formatTimestamp(data.timestamp);
        const icon = getFileIcon(data.file_name);
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(data.file_name);

        let previewHtml = '';
        if (isImage && data.file_path) {
            previewHtml = `<img src="${escapeHtml(data.file_path)}" class="file-preview-img" onclick="window.open(this.src, '_blank')" alt="preview">`;
        }

        msgDiv.innerHTML = `
            ${!isOwn ? `<div class="user-avatar" style="background:${getAvatarColor(data.sender)}; margin-right: 8px;">${data.sender.charAt(0).toUpperCase()}</div>` : ''}
            <div class="message-bubble">
                <div class="message-header">
                    <span class="message-username">${escapeHtml(data.sender)}</span>
                    <span class="message-time">${timeStr}</span>
                </div>
                ${data.content ? `<div class="message-content" style="margin-bottom:8px;">${escapeHtml(data.content)}</div>` : ''}
                <div class="message-file">
                    <div class="file-icon">${icon}</div>
                    <div class="file-info">
                        <span class="file-name" title="${escapeHtml(data.file_name)}">${escapeHtml(data.file_name)}</span>
                        <a href="${escapeHtml(data.file_path || '#')}" class="file-link" download target="_blank">Download</a>
                    </div>
                </div>
                ${previewHtml}
            </div>
            ${isOwn ? `<div class="user-avatar" style="background:${getAvatarColor(data.sender)}; margin-left: 8px;">${data.sender.charAt(0).toUpperCase()}</div>` : ''}
        `;
        container.appendChild(msgDiv);
    }

    function updateUserList(users) {
        userList.innerHTML = '';
        userCount.textContent = users.length;
        
        users.forEach(user => {
            const item = document.createElement('div');
            item.className = 'user-item';
            item.onclick = () => {
                messageInput.value = `@${user} ` + messageInput.value;
                messageInput.focus();
                if (window.innerWidth <= 768) sidebar.classList.remove('open');
            };
            
            item.innerHTML = `
                <div class="user-avatar" style="background:${getAvatarColor(user)}">${user.charAt(0).toUpperCase()}</div>
                <span class="online-dot"></span>
                <span>${escapeHtml(user)} ${user === CURRENT_USER ? '(You)' : ''}</span>
            `;
            userList.appendChild(item);
        });
    }

    // Sending Messages
    async function sendMessage() {
        const text = messageInput.value.trim();
        
        if (!text && !selectedFile) return;

        let recipient = null;
        let contentToSend = text;

        // Check for private message
        const pmMatch = text.match(/^@(\w+)\s+(.*)/);
        if (pmMatch) {
            recipient = pmMatch[1];
            contentToSend = pmMatch[2];
        }

        if (selectedFile) {
            // Upload file first
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('sender', CURRENT_USER);
            
            try {
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                if (res.ok) {
                    const resData = await res.json();
                    socket.send(JSON.stringify({
                        type: 'file',
                        content: contentToSend, // optional caption
                        file_name: resData.file_name,
                        file_path: resData.file_path,
                        recipient: recipient
                    }));
                    clearFilePreview();
                }
            } catch (err) {
                console.error("File upload failed", err);
            }
        } else if (contentToSend) {
            socket.send(JSON.stringify({
                type: 'text',
                content: contentToSend,
                recipient: recipient
            }));
        }

        messageInput.value = '';
        messageInput.style.height = 'auto'; // reset height
        messageInput.focus();
    }

    // Event Listeners
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // File handling
    fileInput.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            selectedFile = this.files[0];
            // Validate size (e.g., 10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                alert('File is too large (max 10MB)');
                clearFilePreview();
                return;
            }
            filePreviewName.textContent = selectedFile.name;
            filePreview.classList.remove('hidden');
        }
    });
    
    removeFileBtn.addEventListener('click', clearFilePreview);
    
    function clearFilePreview() {
        selectedFile = null;
        fileInput.value = '';
        filePreview.classList.add('hidden');
        filePreviewName.textContent = '';
    }

    // Emoji Picker toggling
    emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPicker.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
            emojiPicker.classList.add('hidden');
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') emojiPicker.classList.add('hidden');
    });

    // Mobile Sidebar
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // History Modal
    historyBtn.addEventListener('click', async () => {
        historyModal.classList.remove('hidden');
        historyMessages.innerHTML = '<div style="text-align:center; padding: 20px;">Loading...</div>';
        try {
            const res = await fetch('/api/history');
            if (res.ok) {
                const messages = await res.json();
                renderHistory(messages);
            } else {
                historyMessages.innerHTML = '<div style="color:red">Failed to load history</div>';
            }
        } catch(e) {
            historyMessages.innerHTML = '<div style="color:red">Error loading history</div>';
        }
    });

    closeHistoryBtn.addEventListener('click', () => {
        historyModal.classList.add('hidden');
    });
    historyModal.addEventListener('click', (e) => {
        if(e.target === historyModal) historyModal.classList.add('hidden');
    });

    function renderHistory(messages) {
        historyMessages.innerHTML = '';
        if (!messages || messages.length === 0) {
            historyMessages.innerHTML = '<div class="empty-state">No history available.</div>';
            return;
        }
        messages.forEach(msg => {
            if (msg.type === 'file') {
                renderFileMessage(msg, historyMessages);
            } else if (msg.type === 'system') {
                renderSystemMessage(msg, historyMessages);
            } else {
                renderMessage(msg, historyMessages);
            }
        });
        scrollToBottom(historyMessages);
    }

    // Utils
    function scrollToBottom(container) {
        container.scrollTop = container.scrollHeight;
    }

    function escapeHtml(unsafe) {
        return (unsafe || '').replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatTimestamp(isoString) {
        if (!isoString) return new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const date = new Date(isoString);
        return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    function getAvatarColor(username) {
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        return `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
    }

    function getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '🖼️';
        if (['mp4', 'webm', 'mov'].includes(ext)) return '🎬';
        if (['mp3', 'wav', 'ogg'].includes(ext)) return '🎵';
        if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return '📄';
        if (['zip', 'rar', '7z', 'tar'].includes(ext)) return '🗜️';
        return '📎';
    }

    // Start
    connectWebSocket();
});
