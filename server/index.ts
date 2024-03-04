import express from 'express';
import { createServer } from 'http';
import { Socket, Server } from 'socket.io';
import { r } from 'rethinkdb-ts';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const createConnection = async () => {
  try {
    const conn = await r.connect({
      host: 'rethinkdb',
      port: 28015,
      authKey: '',
      db: 'drawings',
      password: 'rethinkpassword',
    });
    console.log('database connected');
  } catch (e) {
    console.error(e);
  }
};

createConnection();

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
