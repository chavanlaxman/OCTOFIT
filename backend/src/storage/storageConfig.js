const path = require('node:path');

const DEFAULT_DATA_DIR = path.resolve(__dirname, '../../data');

function getStorageMode() {
  const mode = String(process.env.OCTOFIT_STORAGE || 'json').trim().toLowerCase();
  return mode === 'mongo' ? 'mongo' : 'json';
}

function getMongoUri() {
  return String(process.env.MONGODB_URI || '').trim();
}

function getDataDir() {
  const configured = String(process.env.OCTOFIT_DATA_DIR || '').trim();
  return configured || DEFAULT_DATA_DIR;
}

function assertMongoConfigured() {
  if (getStorageMode() !== 'mongo') {
    return;
  }

  if (!getMongoUri()) {
    throw new Error('MONGODB_URI is required when OCTOFIT_STORAGE=mongo.');
  }
}

module.exports = {
  getStorageMode,
  getMongoUri,
  getDataDir,
  assertMongoConfigured,
  DEFAULT_DATA_DIR,
};
