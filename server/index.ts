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
    return conn;
    console.log('database connected');
  } catch (e) {
    console.error(e);
  }
};

app.get('/api', (req, res) => {
  res.send('Hello World!');
});

io.on('connection', async (socket: Socket) => {
  const dbConnection = await createConnection();

  // socket.on('subscribeToTimer', async (client) => {
  //   const cursor = await r.table('timers').changes().run(dbConnection);

  //   cursor.each((err, timerRow) => {
  //     console.log('timerROw::::', timerRow);
  //     client.emit('interval', timerRow.new_val.timestamp);
  //   });
  // });
  const cursor = await r.table('timers').changes().run(dbConnection);

  cursor.each((err, timerRow) => {
    console.log('timerROw::::', timerRow);
    socket.emit('interval', timerRow.new_val.timestamp);
  });

  // setInterval(() => {
  //   socket.emit('interval', new Date());
  // }, 1000);
});

httpServer.listen(5000, () => {
  console.log('server started');
});
