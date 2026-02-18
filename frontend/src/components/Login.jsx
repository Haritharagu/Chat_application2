import React, { useState } from 'react';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim()) {
            onLogin({
                username,
                avatar_url: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
            });
        }
    };

    return (
        <div className="login-container">
            <h2>Nova Chat</h2>
            <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2rem' }}>Experience real-time conversations</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Avatar URL (optional)"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                />
                <button type="submit">Join Connection</button>
            </form>
        </div>
    );
}

export default Login;
