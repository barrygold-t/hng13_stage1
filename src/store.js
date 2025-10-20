// lightweight JSON persistence using lowdb
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const fs = require('fs');

const file = path.join(__dirname, '..', 'data', 'store.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, { defaultData: { strings: [] } }); // ✅ fix here

async function init() {
  // ensure directory and file exist
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ strings: [] }, null, 2));
  await db.read();
  db.data = db.data || { strings: [] };
  await db.write();
}

async function getAllStrings() {
  await db.read();
  return db.data.strings;
}
async function saveString(obj) {
  await db.read();
  db.data.strings.push(obj);
  await db.write();
}
async function findByHash(hash) {
  await db.read();
  return db.data.strings.find(s => s.id === hash);
}
async function findByValue(value) {
  await db.read();
  return db.data.strings.find(s => s.value === value);
}
async function deleteByValue(value) {
  await db.read();
  const before = db.data.strings.length;
  db.data.strings = db.data.strings.filter(s => s.value !== value);
  const after = db.data.strings.length;
  await db.write();
  return before !== after;
}
async function clear() {
  db.data.strings = [];
  await db.write();
}

module.exports = {
  init,
  getAllStrings,
  saveString,
  findByHash,
  findByValue,
  deleteByValue,
  clear
};
