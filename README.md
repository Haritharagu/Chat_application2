# Nova Chat - Real-Time Group Chat Application

Nova Chat is a premium real-time group chat application built with **React**, **Node.js**, **Socket.IO**, and **MySQL**.

## Features
- **Real-time Messaging**: Instant communication across all users.
- **MySQL Persistence**: Chat history is saved and fetched automatically.
- **In-Memory Fallback**: Robust backend that works even if MySQL is offline.
- **Premium UI**: Modern glassmorphism design with smooth animations.
- **Auto-Avatars**: Unique avatars generated for every user.

## Tech Stack
- **Frontend**: React (Vite), Socket.io-client
- **Backend**: Node.js, Express, Socket.io, MySQL
- **Styling**: Vanilla CSS (Custom Glassmorphism)

## Getting Started

### Prerequisites
- Node.js installed
- MySQL Server (optional but recommended for persistence)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Haritharagu/chat_application.git
   cd chat_application
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   ```
   - Configure `.env` with your MySQL credentials.
   - Run the schema in `backend/schema.sql`.

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the App

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

Open `http://localhost:5173` to join the chat!
