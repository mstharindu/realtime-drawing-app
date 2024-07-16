import express from 'express';
import { createServer } from 'http';
import { Socket, Server } from 'socket.io';
import { RunOptions, r } from 'rethinkdb-ts';
import { Cursor } from 'rethinkdb-ts/lib/response/cursor';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const getConnection = async () => {
  let connection = null;

  if (connection) return connection;
  try {
    const connection = await r.connect({
      host: 'rethinkdb',
      port: 28015,
      authKey: '',
      password: 'rethinkpassword',
    });
    // Check if the database exists
    const dbList = await r.dbList().run(connection);
    if (!dbList.includes('drawings')) {
      // Create the database if it does not exist
      await r.dbCreate('drawings').run(connection);
      await r.db('drawings').tableCreate('objects').run(connection);
    }

    connection.use('drawings');

    return connection;
  } catch (e) {
    console.error(e);
  }
};

const registerSocketListeners = (socket: Socket) => {
  socket.on('live-change', (payload) => {
    io.emit('live-change', payload);
  });

  socket.on('state-change', async (data) => {
    const dbConnection = await getConnection();
    const { action, payload } = data;

    switch (action) {
      case 'create':
        r.table('objects').insert(payload.layer).run(dbConnection);
        break;
      case 'delete':
        r.table('objects')
          .filter({ id: payload.layerId })
          .delete()
          .run(dbConnection);
        break;
      case 'update':
        r.table('objects')
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

const registerSocketEvents = async () => {
  const dbConnection = await getConnection();
  const cursor = await r.table('objects').changes().run(dbConnection);

  cursor.each((err, record) => {
    if (err) throw err;

    if (record.old_val == null) {
      io.emit('live-change', {
        action: 'create',
        payload: { layer: record.new_val },
      });
    } else if (record.new_val == null) {
      io.emit('live-change', {
        action: 'delete',
        payload: { layerId: record.old_val.id },
      });
    } else {
      const newValue = record.new_val;
      const oldValue = record.old_val;

      if (oldValue && newValue) {
        let updatedFields = {};

        // Iterate over the fields in new_value to find changes
        Object.keys(newValue).forEach((field) => {
          if (newValue[field] !== oldValue[field]) {
            updatedFields = { ...updatedFields, [field]: newValue[field] };
          }
        });

        io.emit('live-change', {
          action: 'update',
          payload: { layerId: newValue.id, payload: updatedFields },
        });
      }
    }
  });
};

registerSocketEvents();

io.on('connection', async (socket: Socket) => {
  const dbConnection = await getConnection();
  //await registerSocketEvents(socket);
  const allObjectsCursor = await r.table('objects').getCursor(dbConnection);

  allObjectsCursor.each((err, record) => {
    if (err) throw err;

    socket.emit('live-change', {
      action: 'create',
      payload: { layer: record },
    });
  });

  registerSocketListeners(socket);
});

httpServer.listen(5000, () => {
  console.log('server started');
});
