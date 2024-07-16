import { Server } from 'socket.io';
import { getConnection } from '../services/dbService';
import { r } from 'rethinkdb-ts';

export const registerSocketEvents = async (io: Server) => {
  const dbConnection = await getConnection();
  if (!dbConnection) return;

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
      let updatedFields = {};

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
  });
};
