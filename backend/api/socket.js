const { io } = require('./index');

// Export the io instance for Vercel
module.exports = (req, res) => {
    if (req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Socket.IO server is running' }));
    }
};
