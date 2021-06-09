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
    let msg = '';
    let username = anonymousNames[Math.floor(Math.random() * anonymousNames.length)];

    socket.on('join room', (data) => {
        room = data.room;
        socket.join(room);

        msg = `${username} has joined ${room}`;
        io.to(room).emit('notification', { msg: msg, room: room });
        console.log(msg);
    });

    socket.on('chat message', (data) => {
        io.to(data.room).emit('chat message', { msg: data.msg, id: username });
        console.log(data.msg);
    });

    socket.on('notification', (data) => {
        io.to(data.room).emit('notification', { msg: msg, room: room });
        console.log(data.msg);
    });

    socket.on('disconnect', () => {
        msg = `${username} has disconnected`;
        io.to(room).emit('notification', { msg: msg, room: room });
        console.log(msg);
    });
});

server.listen(3000, () => {
    console.log('listening on port 3000');
});