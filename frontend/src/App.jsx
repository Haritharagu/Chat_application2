import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';
import './index.css';

const SOCKET_SERVER_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function App() {
    const [socket, setSocket] = useState(null);
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const newSocket = io(SOCKET_SERVER_URL);
        setSocket(newSocket);
        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('newMessage', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });
        socket.on('messageDeleted', ({ deletedId }) => {
            setMessages((prevMessages) => prevMessages.filter(msg => msg.id != deletedId));
        });
        return () => {
            socket.off('newMessage');
            socket.off('messageDeleted');
        };
    }, [socket]);

    const fetchHistory = async () => {
        try {
            const response = await fetch(`${SOCKET_SERVER_URL}/api/messages`);
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    };

    const handleLogin = (userData) => {
        setUser(userData);
        fetchHistory();
    };

    const sendMessage = (messageText) => {
        if (socket && user) {
            const messageData = {
                username: user.username,
                avatar_url: user.avatar_url,
                message: messageText,
            };
            socket.emit('sendMessage', messageData);
        }
    };

    const deleteMessage = (messageId) => {
        if (socket) {
            socket.emit('deleteMessage', { id: messageId });
        }
    };

    return (
        <div className="app">
            {!user ? (
                <Login onLogin={handleLogin} />
            ) : (
                <ChatRoom
                    user={user}
                    messages={messages}
                    onSendMessage={sendMessage}
                    onDeleteMessage={deleteMessage}
                />
            )}
        </div>
    );
}

export default App;
