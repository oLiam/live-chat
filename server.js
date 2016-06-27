var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    http = require('http').Server(app),
    io = require('socket.io')(server),
    port = process.env.PORT || 3700,
    path = require('path');

var rooms = [];

server.listen(port, function () {
    console.log('Updated : Server listening at port %d', port);
});


// Route
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


// Get public files
app.use(express.static('public'));

// On connection
io.on('connection', function (socket) {
    console.log('A user connected');

    io.sockets.emit('load rooms', rooms);

    // When a new chatroom is made -> push to array
    socket.on('new chatroom', function (chatroom) {

        if(rooms.indexOf(chatroom) != -1) {
            console.log('This room name is already taken.')
        }
        else {
            rooms.push(chatroom);

            console.log('A user created a chatroom:' + chatroom);
        }

        io.sockets.emit('all rooms', rooms);
    });

    // Join chatroom
    socket.on('join chatroom', function (roomName) {
        console.log('A user joined chatroom:' + roomName);

        socket.room = roomName;

        socket.join(roomName);

        var currentRoomUsers = io.sockets.adapter.rooms[roomName];

        io.to(roomName).emit('current users', currentRoomUsers);
    })

    // Leave chatroom
    socket.on('leave chatroom', function (data) {
        console.log('A user disconnected from chatroom:' + socket.room);

        socket.leave(socket.room);

        var currentRoomUsers = io.sockets.adapter.rooms[socket.room];
        io.to(socket.room).emit('current users', currentRoomUsers);
    })


    // When a new message is sent -> print in the associated room
    socket.on('chat message', function (msg) {
        console.log('message: ' + msg +' -- in room: '+ socket.room);

        io.to(socket.room).emit('chat message', msg)
    });


    // On disconnect print console message
    socket.on('disconnect', function () {
        console.log('A user disconnected from the server');
    });
});