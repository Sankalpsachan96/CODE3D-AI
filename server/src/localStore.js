import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve('data/local_db.json');

// Ensure directory exists
const dir = path.dirname(DB_FILE);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

let store = {
  users: [],
  sessions: [],
  projects: [],
  executions: [],
  quizAttempts: []
};

// Load existing state from disk
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    store = { ...store, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Could not parse local_db.json, starting fresh');
  }
}

export function saveLocalStore() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write local_db.json:', e);
  }
}

export function getLocalStore() {
  return store;
}

export default store;
