const path = require('node:path');
const { getDataDir, getStorageMode } = require('./storage/storageConfig');
const { loadCollection, saveCollection } = require('./storage/jsonFileStore');

const COLLECTION_NAME = 'dailyEntries';

let memoryItems = null;
let nextId = 1;

function getJsonFilePath() {
  return path.join(getDataDir(), 'dailyEntries.json');
}

function cloneItem(item) {
  return {
    ...item,
    activityIds: Array.isArray(item.activityIds) ? [...item.activityIds] : item.activityIds,
  };
}

function ensureJsonLoaded() {
  if (memoryItems !== null) {
    return;
  }

  memoryItems = loadCollection(getJsonFilePath()).map(cloneItem);
  nextId = memoryItems.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function persistJson() {
  saveCollection(getJsonFilePath(), memoryItems.map(cloneItem));
}

function sortNewestDateFirst(items) {
  return [...items].sort((left, right) => {
    const dateCompare = String(right.date).localeCompare(String(left.date));
    if (dateCompare !== 0) {
      return dateCompare;
    }

    return Number(right.id) - Number(left.id);
  });
}

async function create(recordInput) {
  const now = new Date().toISOString();
  const record = {
    ...recordInput,
    createdAt: now,
    updatedAt: now,
  };

  if (getStorageMode() === 'mongo') {
    const { getCollection } = require('./storage/mongoStore');
    const collection = await getCollection(COLLECTION_NAME);
    const last = await collection.find().sort({ id: -1 }).limit(1).next();
    const id = last ? Number(last.id) + 1 : 1;
    const stored = { ...record, id };
    await collection.insertOne({ ...stored });
    return cloneItem(stored);
  }

  ensureJsonLoaded();
  const stored = { ...record, id: nextId };
  nextId += 1;
  memoryItems.unshift(stored);
  persistJson();
  return cloneItem(stored);
}

async function getById(id) {
  const numericId = Number(id);

  if (getStorageMode() === 'mongo') {
    const { getCollection } = require('./storage/mongoStore');
    const collection = await getCollection(COLLECTION_NAME);
    const found = await collection.findOne({ id: numericId });
    if (!found) {
      return null;
    }

    const { _id, ...rest } = found;
    return cloneItem(rest);
  }

  ensureJsonLoaded();
  const found = memoryItems.find((item) => item.id === numericId);
  return found ? cloneItem(found) : null;
}

async function update(id, recordInput) {
  const numericId = Number(id);
  const existing = await getById(numericId);
  if (!existing) {
    return null;
  }

  // Full replace of mutable fields so omitted optional mood/energy are cleared on PUT.
  const updated = {
    ...recordInput,
    id: numericId,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  if (getStorageMode() === 'mongo') {
    const { getCollection } = require('./storage/mongoStore');
    const collection = await getCollection(COLLECTION_NAME);
    await collection.replaceOne({ id: numericId }, updated);
    return cloneItem(updated);
  }

  ensureJsonLoaded();
  const index = memoryItems.findIndex((item) => item.id === numericId);
  if (index < 0) {
    return null;
  }

  memoryItems[index] = updated;
  persistJson();
  return cloneItem(updated);
}

async function remove(id) {
  const numericId = Number(id);

  if (getStorageMode() === 'mongo') {
    const { getCollection } = require('./storage/mongoStore');
    const collection = await getCollection(COLLECTION_NAME);
    const result = await collection.deleteOne({ id: numericId });
    return result.deletedCount > 0;
  }

  ensureJsonLoaded();
  const index = memoryItems.findIndex((item) => item.id === numericId);
  if (index < 0) {
    return false;
  }

  memoryItems.splice(index, 1);
  persistJson();
  return true;
}

async function findByUserIdAndDate(userId, date) {
  const userKey = String(userId);

  if (getStorageMode() === 'mongo') {
    const { getCollection } = require('./storage/mongoStore');
    const collection = await getCollection(COLLECTION_NAME);
    const found = await collection.findOne({ userId: userKey, date });
    if (!found) {
      return null;
    }

    const { _id, ...rest } = found;
    return cloneItem(rest);
  }

  ensureJsonLoaded();
  const found = memoryItems.find((item) => String(item.userId) === userKey && item.date === date);
  return found ? cloneItem(found) : null;
}

async function listByUserInDateRange(userId, startDate, endDate) {
  const userKey = String(userId);

  if (getStorageMode() === 'mongo') {
    const { getCollection } = require('./storage/mongoStore');
    const collection = await getCollection(COLLECTION_NAME);
    const rows = await collection
      .find({
        userId: userKey,
        date: { $gte: startDate, $lte: endDate },
      })
      .sort({ date: -1, id: -1 })
      .toArray();
    return rows.map(({ _id, ...rest }) => cloneItem(rest));
  }

  ensureJsonLoaded();
  return sortNewestDateFirst(
    memoryItems.filter((item) => (
      String(item.userId) === userKey
      && item.date >= startDate
      && item.date <= endDate
    )),
  ).map(cloneItem);
}

async function listAll() {
  if (getStorageMode() === 'mongo') {
    const { getCollection } = require('./storage/mongoStore');
    const collection = await getCollection(COLLECTION_NAME);
    const rows = await collection.find({}).sort({ date: -1, id: -1 }).toArray();
    return rows.map(({ _id, ...rest }) => cloneItem(rest));
  }

  ensureJsonLoaded();
  return sortNewestDateFirst(memoryItems).map(cloneItem);
}

function resetDailyEntries() {
  memoryItems = [];
  nextId = 1;

  if (getStorageMode() === 'json') {
    persistJson();
  }
}

module.exports = {
  create,
  getById,
  update,
  remove,
  findByUserIdAndDate,
  listByUserInDateRange,
  listAll,
  resetDailyEntries,
};
