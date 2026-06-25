const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');
const { resetActivities } = require('../src/activityService');
const { resetAccounts } = require('../src/registrationService');

test.beforeEach(() => {
  resetActivities();
  resetAccounts();
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

test('returns leaderboard rankings derived from the latest tracked activity data', async () => {
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
      studentName: 'Taylor Student',
      activityType: 'Cycle',
      durationMinutes: 60,
      performedAt: '2026-06-21',
      notes: 'Endurance ride',
    })
    .expect(201);

  await request(app)
    .post('/api/activities/')
    .send({
      studentName: 'Jordan Student',
      activityType: 'Swim',
      durationMinutes: 50,
      performedAt: '2026-06-22',
      notes: 'Technique drills',
    })
    .expect(201);

  const response = await request(app)
    .get('/api/leaderboard/')
    .expect(200);

  assert.equal(response.body.status, 'success');
  assert.equal(response.body.rankings.length, 2);
  assert.deepEqual(response.body.rankings[0], {
    rank: 1,
    studentName: 'Jordan Student',
    totalDurationMinutes: 80,
    activityCount: 2,
    lastPerformedAt: '2026-06-22',
  });
  assert.deepEqual(response.body.rankings[1], {
    rank: 2,
    studentName: 'Taylor Student',
    totalDurationMinutes: 60,
    activityCount: 1,
    lastPerformedAt: '2026-06-21',
  });
});

test('returns bootstrap data for the app entry experience', async () => {
  const app = createApp();

  await request(app)
    .post('/api/users/register/')
    .send({
      firstName: 'Taylor',
      lastName: 'Student',
      email: 'taylor.student@example.com',
      password: 'Password9',
      consentAccepted: true,
    })
    .expect(201);

  await request(app)
    .post('/api/activities/')
    .send({
      studentName: 'Taylor Student',
      activityType: 'Cycling',
      durationMinutes: 45,
      performedAt: '2026-06-22',
      notes: 'Hill repeats before class',
    })
    .expect(201);

  const response = await request(app)
    .get('/api/bootstrap/')
    .expect(200);

  assert.equal(response.body.status, 'success');
  assert.ok(response.body.hero);
  assert.ok(response.body.dashboard);
  assert.ok(Array.isArray(response.body.users));
  assert.ok(Array.isArray(response.body.teams));
  assert.ok(Array.isArray(response.body.activities));
  assert.ok(Array.isArray(response.body.challenges));
  assert.ok(Array.isArray(response.body.leaderboard));
  assert.ok(Array.isArray(response.body.recommendations));
  assert.equal(response.body.users.length, 1);
  assert.deepEqual(response.body.users[0], {
    id: 1,
    firstName: 'Taylor',
    lastName: 'Student',
    role: 'student',
  });
  assert.equal(response.body.activities.length, 1);
  assert.equal(response.body.leaderboard.length, 1);
});

test('returns a stable empty bootstrap shape before any users or activities exist', async () => {
  const app = createApp();

  const response = await request(app)
    .get('/api/bootstrap/')
    .expect(200);

  assert.equal(response.body.status, 'success');
  assert.deepEqual(response.body.dashboard, {
    totalUsers: 0,
    totalTeams: 2,
    totalActivities: 0,
    activeChallenges: 2,
  });
  assert.deepEqual(response.body.users, []);
  assert.ok(Array.isArray(response.body.teams));
  assert.ok(Array.isArray(response.body.activities));
  assert.ok(Array.isArray(response.body.challenges));
  assert.deepEqual(response.body.activities, []);
  assert.deepEqual(response.body.leaderboard, []);
  assert.equal(response.body.recommendations.length, 2);
});