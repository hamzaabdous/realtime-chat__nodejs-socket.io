const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const rooms = new Map();

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join', (data) => {
        const { room, username } = data;

        socket.join(room);
        socket.room = room;
        socket.username = username;
        console.log(`${socket.username} joined room: ${room}`);

        if (!rooms.has(room)) {
            rooms.set(room, new Set());
        }
        rooms.get(room).add(socket);

        io.to(room).emit('chat message', `${socket.username} joined the room`);
    });

    socket.on('chat message', (message) => {
        io.to(socket.room).emit('chat message', `${socket.username}: ${message}`);
    });

    socket.on('disconnect', () => {
        if (socket.room) {
            rooms.get(socket.room).delete(socket);
            io.to(socket.room).emit('chat message', `${socket.username} left the room`);
        }

        console.log('A user disconnected');
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
