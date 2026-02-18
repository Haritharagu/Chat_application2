const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Updated for Vite's default port
        methods: ["GET", "POST"]
    }
});

// --- In-Memory Fallback (for when DB is unavailable) ---
let memoryMessages = [];

// --- API Routes ---

// Fetch last 50 messages for history
app.get('/api/messages', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT username, avatar_url, message, created_at FROM messages ORDER BY created_at DESC LIMIT 50'
        );
        res.json(rows.reverse());
    } catch (error) {
        console.warn('Database error, falling back to in-memory history:', error.code);
        res.json(memoryMessages.slice(-50));
    }
});

// Save a new message (optional API point)
app.post('/api/messages', async (req, res) => {
    const { username, avatar_url, message } = req.body;
    if (!username || !message) {
        return res.status(400).json({ error: 'Username and message are required' });
    }
    const newMessage = {
        username,
        avatar_url,
        message,
        created_at: new Date()
    };

    try {
        const [result] = await db.query(
            'INSERT INTO messages (username, avatar_url, message) VALUES (?, ?, ?)',
            [username, avatar_url, message]
        );
        newMessage.id = result.insertId;
        res.status(201).json(newMessage);
    } catch (error) {
        console.warn('Database error, saving to in-memory instead:', error.code);
        memoryMessages.push(newMessage);
        res.status(201).json(newMessage);
    }
});

// --- Socket.IO Logic ---

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('sendMessage', async (data) => {
        const { username, avatar_url, message } = data;
        const newMessage = {
            username,
            avatar_url,
            message,
            created_at: new Date()
        };

        try {
            const [result] = await db.query(
                'INSERT INTO messages (username, avatar_url, message) VALUES (?, ?, ?)',
                [username, avatar_url, message]
            );
            newMessage.id = result.insertId;
        } catch (error) {
            console.warn('Socket message save error, broadcasting anyway (In-Memory Fallback):', error.code);
            memoryMessages.push(newMessage);
        }

        io.emit('newMessage', newMessage);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('--- READY: Backend is operational (using In-Memory fallback if DB is down) ---');
});
