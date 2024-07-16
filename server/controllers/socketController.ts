import { Server, Socket } from 'socket.io';
import { getConnection } from '../services/dbService';
import { r } from 'rethinkdb-ts';
import { registerSocketListeners } from '../sockets/socketListeners';

export const handleSocketConnection = async (socket: Socket, io: Server) => {
  const dbConnection = await getConnection();
  if (!dbConnection) return;

  const allObjectsCursor = await r.table('objects').getCursor(dbConnection);

  allObjectsCursor.each((err, record) => {
    if (err) throw err;

    socket.emit('live-change', {
      action: 'create',
      payload: { layer: record },
    });
  });

  registerSocketListeners(socket, io);
};
