const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let room = '';
io.on('connection', (socket) => {
    console.log(`user "${socket.id}" connected`);
    socket.on('join room', (data) => {
        console.log(`in room "${data.room}"`);
        
        room = data.room;
        socket.join(room);

        let msg = `user ${socket.id} has joined room ${room}`;
        io.to(room).emit('chat message', { msg: msg, id: socket.id });
    });

    socket.on('chat message', (data) => {
        console.log(`message in ${data.room}: ${data.msg}`);
        // Broadcast message to everyone
        io.to(data.room).emit('chat message', { msg: data.msg, id: socket.id });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        let msg = `user ${socket.id} has left room ${room}`
        io.to(room).emit('chat message', { msg: msg, id: socket.id });
    });
});

server.listen(3000, () => {
    console.log('listening on port 3000');
});