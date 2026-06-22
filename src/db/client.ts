import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

const sqlite = new Database('weather.db');

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS city_locations (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL UNIQUE,
    latitude  REAL    NOT NULL,
    longitude REAL    NOT NULL
  )
`);

export const db = drizzle(sqlite, { schema });
