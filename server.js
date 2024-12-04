const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

let players = {};

io.on('connection', (socket) => {
  players[socket.id] = { x: 0, y: 0, id: socket.id, rotate: 0 };

  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', players[socket.id]);
  socket.emit('prepared', socket.id);

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });

  socket.on('move', (data) => {
    if (players[socket.id]) {
      players[socket.id].x += data.x;
      players[socket.id].y += data.y;
      players[socket.id].rotate = data.rotate;
      io.emit('playerMoved', { id: socket.id, x: players[socket.id].x, y: players[socket.id].y, rotate: players[socket.id].rotate });
    }
  });

  socket.on('shoot', data => {
    if (players[socket.id]) {
      io.emit('shoot', { id: socket.id, x: data.x, y: data.y, direction: data.direction });
    }
  });

  socket.on('kill', (id) => {
    if (players[id]) {
      delete players[id];
      io.emit('dead', { killer: socket.id, target: id });
    }
  });

  socket.on('requestStart', (data) => {
    const x = Math.random()*data.width;
    const y = Math.random()*data.height;
    players[socket.id].x = x;
    players[socket.id].y = y;
    socket.emit('start', { x: x, y: y });
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/src/index.html');
});

app.get('/favicon.ico', (req, res) => {
  res.sendFile(__dirname + '/src/assets/gun.png');
});

app.get('/users', (req, res) => {
  res.json({ count: Object.keys(players).length });
})

app.get('/:path', (req, res) => {
  const path = req.params.path;
  res.sendFile(__dirname + '/src/' + path);
});

app.get('/scenes/:path', (req, res) => {
  const path = req.params.path;
  res.sendFile(__dirname + '/src/scenes/' + path);
});

app.get('/assets/:path', (req, res) => {
  const path = req.params.path;
  res.sendFile(__dirname + '/src/assets/' + path);
});

server.listen(3000, () => {
  console.log('Listening on *:3000');
});