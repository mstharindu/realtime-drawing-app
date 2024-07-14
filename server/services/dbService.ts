import { r, Connection } from 'rethinkdb-ts';
import { DB_CONFIG } from '../config/dbConfig';

let connection: Connection | null = null;

export const getConnection = async (): Promise<Connection | null> => {
  if (connection) return connection;

  try {
    connection = await r.connect(DB_CONFIG);
    
    const dbList = await r.dbList().run(connection);
    if (!dbList.includes(DB_CONFIG.db)) {
      await r.dbCreate(DB_CONFIG.db).run(connection);
      await r.db(DB_CONFIG.db).tableCreate('objects').run(connection);
    }

    connection.use(DB_CONFIG.db);
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    return null;
  }
};
