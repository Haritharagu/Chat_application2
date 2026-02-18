import React, { useState, useRef, useEffect } from 'react';

function ChatRoom({ user, messages, onSendMessage }) {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="chatroom">
            <header style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={user.avatar_url} alt={user.username} className="avatar" style={{ border: '2px solid #6366f1' }} />
                <div>
                    <h3 style={{ fontSize: '1.1rem' }}>{user.username}</h3>
                    <span style={{ fontSize: '0.8rem', color: '#10b981' }}>● Online</span>
                </div>
            </header>

            <div className="messages-container">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.username === user.username ? 'own' : ''}`}>
                        {msg.username !== user.username && <img src={msg.avatar_url} alt={msg.username} className="avatar" />}
                        <div className="message-content">
                            <strong>{msg.username}</strong>
                            <p>{msg.message}</p>
                            <small>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="input-form">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Write your message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}

export default ChatRoom;
