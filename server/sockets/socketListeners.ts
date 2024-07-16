import { Server, Socket } from 'socket.io';
import { getConnection } from '../services/dbService';
import { r } from 'rethinkdb-ts';

export const registerSocketListeners = (socket: Socket, io: Server) => {
  socket.on('live-change', (payload) => {
    socket.broadcast.emit('live-change', payload);
  });

  socket.on('state-change', async (data) => {
    const dbConnection = await getConnection();
    if (!dbConnection) return;

    const { action, payload } = data;

    switch (action) {
      case 'create':
        await r.table('objects').insert(payload.layer).run(dbConnection);
        break;
      case 'delete':
        await r
          .table('objects')
          .filter({ id: payload.layerId })
          .delete()
          .run(dbConnection);
        break;
      case 'update':
        await r
          .table('objects')
          .filter({ id: payload.layerId })
          .update({ ...payload.payload })
          .run(dbConnection);
        break;
      default:
        break;
    }

    io.emit('live-change', payload);
  });
};
