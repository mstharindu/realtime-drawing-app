import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import { registerSocketEvents } from './sockets/socketEvents';
import { handleSocketConnection } from './controllers/socketController';

const httpServer = createServer(app);
const io = new Server(httpServer);

registerSocketEvents(io);

io.on('connection', (socket) => handleSocketConnection(socket, io));

httpServer.listen(5000, () => {
  console.log('Server started on port 5000');
});
