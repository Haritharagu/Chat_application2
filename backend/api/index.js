const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('../db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- In-Memory Fallback (for when DB is unavailable) ---
let memoryMessages = [];

// --- API Routes ---

app.get('/', (req, res) => {
    res.send('Nova Chat Backend is Running! 🚀');
});

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

// Delete a message
app.delete('/api/messages/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const [result] = await db.query(
            'DELETE FROM messages WHERE id = ?',
            [id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.json({ success: true, deletedId: id });
    } catch (error) {
        console.warn('Database error during delete, removing from in-memory:', error.code);
        const index = memoryMessages.findIndex(msg => msg.id == id);
        if (index > -1) {
            memoryMessages.splice(index, 1);
            res.json({ success: true, deletedId: id });
        } else {
            res.status(404).json({ error: 'Message not found' });
        }
    }
});

// Socket.IO setup for Vercel
const io = new Server();

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
            console.log('--- DB Attempt for message from:', username);
            const [result] = await db.query(
                'INSERT INTO messages (username, avatar_url, message) VALUES (?, ?, ?)',
                [username, avatar_url, message]
            );
            newMessage.id = result.insertId;
        } catch (error) {
            console.warn('Socket message save error, broadcasting anyway (In-Memory Fallback):', error.code);
            memoryMessages.push(newMessage);
        }

        console.log('--- Broadcasting newMessage:', newMessage.message);
        io.emit('newMessage', newMessage);
    });

    socket.on('deleteMessage', async (data) => {
        const { id } = data;
        
        try {
            const [result] = await db.query(
                'DELETE FROM messages WHERE id = ?',
                [id]
            );
            if (result.affectedRows > 0) {
                console.log('--- Message deleted from DB:', id);
                io.emit('messageDeleted', { deletedId: id });
            }
        } catch (error) {
            console.warn('Socket delete error, removing from in-memory:', error.code);
            const index = memoryMessages.findIndex(msg => msg.id == id);
            if (index > -1) {
                memoryMessages.splice(index, 1);
                io.emit('messageDeleted', { deletedId: id });
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

module.exports = { app, io };
