const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const fs = require('fs');
const anonymousNames = fs.readFileSync('names.txt').toString().split("\n");

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let room = '';
io.on('connection', (socket) => {
    let username = anonymousNames[Math.floor(Math.random() * anonymousNames.length)];
    console.log(`user "${username}" connected`);
    socket.on('join room', (data) => {
        console.log(`in room "${data.room}"`);
        
        room = data.room;
        socket.join(room);

        let msg = `user ${username} has joined room ${room}`;
        io.to(room).emit('chat message', { msg: msg, id: username });
    });
    
    socket.on('chat message', (data) => {
        console.log(`message in ${data.room}: ${data.msg}`);
        // Broadcast message to everyone
        io.to(data.room).emit('chat message', { msg: data.msg, id: username });
    });

    socket.on('disconnect', () => {
        console.log(`user ${username} disconnected`);
        let msg = `user ${username} has left room ${room}`
        io.to(room).emit('chat message', { msg: msg, id: username });
    });
});

server.listen(3000, () => {
    console.log('listening on port 3000');
});