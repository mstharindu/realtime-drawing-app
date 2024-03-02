import express from 'express';
import { createServer } from 'http';
import { Socket, Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.get('/api', (req, res) => {
  res.send('Hello World!');
});

io.on('connection', (socket: Socket) => {
  console.log('socket connected');

  setInterval(() => {
    socket.emit('interval', new Date());
  }, 1000);
});

httpServer.listen(5000, () => {
  console.log('server started');
});
