import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';
import './index.css';

const SOCKET_SERVER_URL = 'http://localhost:5000';

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
        return () => socket.off('newMessage');
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

    return (
        <div className="app">
            {!user ? (
                <Login onLogin={handleLogin} />
            ) : (
                <ChatRoom
                    user={user}
                    messages={messages}
                    onSendMessage={sendMessage}
                />
            )}
        </div>
    );
}

export default App;
