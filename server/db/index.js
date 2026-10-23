import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(process.env.RESWAY_DB || resolve(here, '../../data/resway.sqlite3'));
mkdirSync(dirname(dbPath), { recursive: true });
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('DONOR','RIDER','SHELTER','OPERATOR')),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS batches(id TEXT PRIMARY KEY,name TEXT NOT NULL,quantity INTEGER NOT NULL CHECK(quantity>=0),unit TEXT NOT NULL,donor TEXT NOT NULL,destination TEXT NOT NULL,status TEXT NOT NULL,time TEXT NOT NULL,payload TEXT NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS batch_items(id INTEGER PRIMARY KEY AUTOINCREMENT,batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,item_name TEXT NOT NULL,quantity INTEGER NOT NULL CHECK(quantity>=0),unit TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS shelters(id TEXT PRIMARY KEY,name TEXT NOT NULL,payload TEXT NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS riders(id TEXT PRIMARY KEY,name TEXT NOT NULL,status TEXT NOT NULL,capacity INTEGER NOT NULL,payload TEXT NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS assignments(id TEXT PRIMARY KEY,batch_id TEXT NOT NULL REFERENCES batches(id),rider_id TEXT NOT NULL REFERENCES riders(id),shelter_id TEXT NOT NULL REFERENCES shelters(id),quantity INTEGER NOT NULL CHECK(quantity>=0),status TEXT NOT NULL,eta INTEGER NOT NULL DEFAULT 0,progress REAL NOT NULL DEFAULT 0,payload TEXT NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS deliveries(id TEXT PRIMARY KEY,assignment_id TEXT NOT NULL REFERENCES assignments(id),status TEXT NOT NULL,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,payload TEXT NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS incidents(id TEXT PRIMARY KEY,type TEXT NOT NULL,batch_id TEXT NOT NULL,status TEXT NOT NULL,time TEXT NOT NULL,payload TEXT NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS audit_events(id INTEGER PRIMARY KEY AUTOINCREMENT,time TEXT NOT NULL,title TEXT NOT NULL,detail TEXT NOT NULL,type TEXT NOT NULL,payload TEXT NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS shelter_inventory(id INTEGER PRIMARY KEY AUTOINCREMENT,shelter_id TEXT NOT NULL REFERENCES shelters(id),item_name TEXT NOT NULL,quantity INTEGER NOT NULL CHECK(quantity>=0),unit TEXT NOT NULL,UNIQUE(shelter_id,item_name));
CREATE TABLE IF NOT EXISTS shelter_demands(id INTEGER PRIMARY KEY AUTOINCREMENT,shelter_id TEXT NOT NULL REFERENCES shelters(id),item_name TEXT NOT NULL,quantity INTEGER NOT NULL CHECK(quantity>=0),UNIQUE(shelter_id,item_name));
CREATE TABLE IF NOT EXISTS simulation_state(id INTEGER PRIMARY KEY CHECK(id=1),state_json TEXT NOT NULL,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires_at INTEGER NOT NULL);
`);
export const DEMO_PASSWORD='resway-demo-2026';
export function parsePayload(row){ return row ? JSON.parse(row.payload||'{}') : null; }
