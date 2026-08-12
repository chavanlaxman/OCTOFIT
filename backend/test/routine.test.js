const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const request = require('supertest');
const { createApp } = require('../src/app');
const { resetNutrition } = require('../src/nutritionService');
const { resetRoutine } = require('../src/routineService');

let dataDir;

test.beforeEach(() => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'octofit-routine-'));
  process.env.OCTOFIT_STORAGE = 'json';
  process.env.OCTOFIT_DATA_DIR = dataDir;
  resetNutrition();
  resetRoutine();
});

test.afterEach(() => {
  fs.rmSync(dataDir, { recursive: true, force: true });
});

function validRoutinePayload(overrides = {}) {
  return {
    userId: '1',
    date: '2026-08-12',
    sleepHours: 7.5,
    waterIntake: 2000,
    steps: 8500,
    ...overrides,
  };
}

test('creates a valid routine entry', async () => {
  const app = createApp();
  const response = await request(app)
    .post('/api/routine/')
    .send(validRoutinePayload())
    .expect(201);

  assert.equal(response.body.status, 'success');
  assert.equal(response.body.routine.userId, '1');
  assert.equal(response.body.routine.date, '2026-08-12');
  assert.equal(response.body.routine.sleepHours, 7.5);
  assert.equal(response.body.routine.waterIntake, 2000);
  assert.equal(response.body.routine.steps, 8500);
  assert.ok(response.body.routine.id);
});

test('rejects invalid routine submissions without persisting', async () => {
  const app = createApp();
  const response = await request(app)
    .post('/api/routine/')
    .send({
      userId: '',
      date: 'not-a-date',
      sleepHours: 30,
      waterIntake: -1,
      steps: 1.5,
    })
    .expect(400);

  assert.equal(response.body.status, 'error');
  assert.ok(response.body.errors.userId);
  assert.ok(response.body.errors.date);
  assert.ok(response.body.errors.sleepHours);
  assert.ok(response.body.errors.waterIntake);
  assert.ok(response.body.errors.steps);

  const listResponse = await request(app)
    .get('/api/routine/')
    .query({ userId: '1', date: '2026-08-12' })
    .expect(200);

  assert.equal(listResponse.body.routines.length, 0);
});

test('updates a routine entry and persists the change', async () => {
  const app = createApp();
  const createResponse = await request(app)
    .post('/api/routine/')
    .send(validRoutinePayload())
    .expect(201);

  const id = createResponse.body.routine.id;
  const updateResponse = await request(app)
    .put(`/api/routine/${id}`)
    .send(validRoutinePayload({
      sleepHours: 8,
      waterIntake: 2500,
      steps: 10000,
    }))
    .expect(200);

  assert.equal(updateResponse.body.status, 'success');
  assert.equal(updateResponse.body.routine.sleepHours, 8);
  assert.equal(updateResponse.body.routine.waterIntake, 2500);
  assert.equal(updateResponse.body.routine.steps, 10000);

  const listResponse = await request(app)
    .get('/api/routine/')
    .query({ userId: '1', date: '2026-08-12' })
    .expect(200);

  assert.equal(listResponse.body.routines.length, 1);
  assert.equal(listResponse.body.routines[0].steps, 10000);
});

test('deletes a routine entry with 204 and removes it from list', async () => {
  const app = createApp();
  const createResponse = await request(app)
    .post('/api/routine/')
    .send(validRoutinePayload())
    .expect(201);

  const id = createResponse.body.routine.id;
  await request(app)
    .delete(`/api/routine/${id}`)
    .expect(204);

  const listResponse = await request(app)
    .get('/api/routine/')
    .query({ userId: '1', date: '2026-08-12' })
    .expect(200);

  assert.equal(listResponse.body.routines.length, 0);
});

test('lists routine entries filtered by userId and date', async () => {
  const app = createApp();

  await request(app)
    .post('/api/routine/')
    .send(validRoutinePayload({ steps: 1000 }))
    .expect(201);

  await request(app)
    .post('/api/routine/')
    .send(validRoutinePayload({
      userId: '2',
      steps: 2000,
    }))
    .expect(201);

  await request(app)
    .post('/api/routine/')
    .send(validRoutinePayload({
      date: '2026-08-11',
      steps: 3000,
    }))
    .expect(201);

  await request(app)
    .post('/api/routine/')
    .send(validRoutinePayload({ steps: 4000 }))
    .expect(201);

  const response = await request(app)
    .get('/api/routine/')
    .query({ userId: '1', date: '2026-08-12' })
    .expect(200);

  assert.equal(response.body.status, 'success');
  assert.equal(response.body.routines.length, 2);
  const steps = response.body.routines.map((entry) => entry.steps).sort((a, b) => a - b);
  assert.deepEqual(steps, [1000, 4000]);
});

test('requires userId and date query params for routine list', async () => {
  const app = createApp();

  const missingBoth = await request(app)
    .get('/api/routine/')
    .expect(400);

  assert.equal(missingBoth.body.status, 'error');
  assert.ok(missingBoth.body.errors.userId);
  assert.ok(missingBoth.body.errors.date);

  const missingDate = await request(app)
    .get('/api/routine/')
    .query({ userId: '1' })
    .expect(400);

  assert.ok(missingDate.body.errors.date);

  const missingUser = await request(app)
    .get('/api/routine/')
    .query({ date: '2026-08-12' })
    .expect(400);

  assert.ok(missingUser.body.errors.userId);
});

test('returns 404 when updating a missing routine entry', async () => {
  const app = createApp();
  const response = await request(app)
    .put('/api/routine/99999')
    .send(validRoutinePayload())
    .expect(404);

  assert.equal(response.body.status, 'error');
  assert.ok(response.body.errors.id);
});

test('returns 404 when deleting a missing routine entry', async () => {
  const app = createApp();
  const response = await request(app)
    .delete('/api/routine/99999')
    .expect(404);

  assert.equal(response.body.status, 'error');
  assert.ok(response.body.errors.id);
});
