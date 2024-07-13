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
      db: 'drawings',
      password: 'rethinkpassword',
    });
    return connection;
    console.log('database connected');
  } catch (e) {
    console.error(e);
  }
};

const registerSocketListeners = (socket: Socket) => {
  socket.on('layer-change', async (data) => {
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

    io.emit('layer-change', payload);
  });
};

const registerSocketEvents = async () => {
  const dbConnection = await getConnection();
  const cursor = await r.table('objects').changes().run(dbConnection);

  cursor.each((err, record) => {
    if (err) throw err;

    if (record.old_val == null) {
      io.emit('layer-change', {
        action: 'create',
        payload: { layer: record.new_val },
      });
    } else if (record.new_val == null) {
      io.emit('layer-change', {
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

        io.emit('layer-change', {
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

    socket.emit('layer-change', {
      action: 'create',
      payload: { layer: record },
    });
  });

  registerSocketListeners(socket);
});

// io.on('connection', async (socket: Socket) => {
//   const dbConnection = await createConnection();

//   // socket.on('subscribeToTimer', async (client) => {
//   //   const cursor = await r.table('timers').changes().run(dbConnection);

//   //   cursor.each((err, timerRow) => {
//   //     console.log('timerROw::::', timerRow);
//   //     client.emit('interval', timerRow.new_val.timestamp);
//   //   });
//   // });

//   const allObjectsCursor = await r.table('objects').getCursor(dbConnection);

//   allObjectsCursor.each((err, record) => {
//     if (err) throw err;

//     socket.emit('createObject', record);
//   });

//   const cursor = await r.table('objects').changes().run(dbConnection);
//   const activityCursor = await r
//     .table('activities')
//     .changes()
//     .run(dbConnection);

//   // if (dbConnection) {
//   //   const result = await r.table('objects').run(dbConnection);

//   //   result.toArray((err, result) => {
//   //     if (err) throw err;
//   //     console.log(JSON.stringify(result, null, 2));
//   //   });
//   //   //   , (err: any, result: any) => {
//   //   //   if (err) throw err;
//   //   //   cursor.toArray((err, result) => {
//   //   //     if (err) throw err;
//   //   //     console.log(JSON.stringify(result, null, 2));
//   //   //   });
//   //   // });
//   // }

//   cursor.each((err, record) => {
//     if (err) throw err;

//     if (record.old_val == null) {
//       socket.emit('createObject', record.new_val);
//     } else if (record.new_val == null) {
//       console.log('deletedRecord:::', record.old_val);
//       socket.emit('deleteObject', record.old_val);
//     } else {
//       socket.emit('updateObject', record.new_val);
//     }
//   });

//   activityCursor.each((err, record) => {
//     if (err) throw err;

//     socket.broadcast.emit('onChangeActivity', record.new_val);

//     //socket.emit('onChangeActivity', record.new_val);
//   });

//   socket.on('createObject', (data: any) => {
//     r.table('objects').insert(data).run(dbConnection);
//     r.table('activities')
//       .get(socket.id)
//       .update({ layerDraft: null })
//       .run(dbConnection);
//   });

//   socket.on('deleteObject', (data: string) => {
//     console.log('deleteObject:::', data);
//     const result = r.table('objects').get(data).delete().run(dbConnection);
//   });

//   socket.on('setActivity', (data: any) => {
//     //Insert the document or update if it exists
//     const result = r
//       .table('activities')
//       .insert({ id: socket.id, ...data }, { conflict: 'update' })
//       .run(dbConnection);
//   });

//   socket.on('clearObjects', () => {
//     r.table('objects').delete().run(dbConnection);
//   });

//   // setInterval(() => {
//   //   socket.emit('interval', new Date());
//   // }, 1000);
// });

httpServer.listen(5000, () => {
  console.log('server started');
});
