const { MongoClient } = require('mongodb');
const { getMongoUri, assertMongoConfigured } = require('./storageConfig');

let clientPromise = null;

async function getClient() {
  assertMongoConfigured();

  if (!clientPromise) {
    const client = new MongoClient(getMongoUri());
    clientPromise = client.connect();
  }

  return clientPromise;
}

async function getCollection(collectionName) {
  const client = await getClient();
  return client.db().collection(collectionName);
}

async function resetMongoConnectionForTests() {
  if (!clientPromise) {
    return;
  }

  const client = await clientPromise;
  await client.close();
  clientPromise = null;
}

module.exports = {
  getCollection,
  resetMongoConnectionForTests,
};
