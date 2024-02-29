const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

io.on('connection', (socket) => {
  console.log('socket connected');

  setInterval(() => {
    socket.emit('interval', new Date());
  }, 1000);
});

httpServer.listen(5000, () => {
  console.log('server started');
});
