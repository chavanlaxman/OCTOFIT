const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');
const { resetActivities } = require('../src/activityService');

test.beforeEach(() => {
  resetActivities();
});

test('returns the activity logging contract', async () => {
  const app = createApp();
  const response = await request(app)
    .get('/api/activities/contract')
    .expect(200);

  assert.equal(response.body.endpoint, '/api/activities/');
  assert.equal(response.body.fields.length, 5);
});

test('rejects invalid activity submissions', async () => {
  const app = createApp();
  const response = await request(app)
    .post('/api/activities/')
    .send({
      studentName: 'A',
      activityType: '',
      durationMinutes: 0,
      performedAt: 'not-a-date',
    })
    .expect(400);

  assert.equal(response.body.status, 'error');
  assert.ok(response.body.errors.studentName);
  assert.ok(response.body.errors.activityType);
  assert.ok(response.body.errors.durationMinutes);
  assert.ok(response.body.errors.performedAt);
});

test('persists a valid activity submission', async () => {
  const app = createApp();
  const response = await request(app)
    .post('/api/activities/')
    .send({
      studentName: 'Taylor Student',
      activityType: 'Cycling',
      durationMinutes: 45,
      performedAt: '2026-06-22',
      notes: 'Hill repeats before class',
    })
    .expect(201);

  assert.equal(response.body.status, 'success');
  assert.equal(response.body.activity.studentRole, 'student');
  assert.equal(response.body.activity.activityType, 'Cycling');
  assert.equal(response.body.activity.durationMinutes, 45);
  assert.equal(response.body.activity.performedAt, '2026-06-22');
});

test('returns persisted activities for downstream consumers', async () => {
  const app = createApp();

  await request(app)
    .post('/api/activities/')
    .send({
      studentName: 'Jordan Student',
      activityType: 'Run',
      durationMinutes: 30,
      performedAt: '2026-06-20',
      notes: 'Tempo session',
    })
    .expect(201);

  await request(app)
    .post('/api/activities/')
    .send({
      studentName: 'Jordan Student',
      activityType: 'Swim',
      durationMinutes: 50,
      performedAt: '2026-06-21',
      notes: 'Technique drills',
    })
    .expect(201);

  const response = await request(app)
    .get('/api/activities/')
    .expect(200);

  assert.equal(response.body.status, 'success');
  assert.equal(response.body.activities.length, 2);
  assert.equal(response.body.activities[0].activityType, 'Swim');
  assert.equal(response.body.activities[1].activityType, 'Run');
});