const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');
const { resetActivities } = require('../src/activityService');
const { resetAccounts } = require('../src/registrationService');
const { resetTeams } = require('../src/teamService');

test.beforeEach(() => {
  resetActivities();
  resetAccounts();
  resetTeams();
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
    totalTeams: 0,
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

test('rejects invalid team creation requests', async () => {
  const app = createApp();

  const response = await request(app)
    .post('/api/teams/')
    .send({
      name: '',
      memberCount: 0,
      focus: '',
    })
    .expect(400);

  assert.equal(response.body.status, 'error');
  assert.ok(response.body.errors.name);
  assert.ok(response.body.errors.memberCount);
});

test('persists a valid team creation request', async () => {
  const app = createApp();

  const response = await request(app)
    .post('/api/teams/')
    .send({
      name: 'Summit Sprinters',
      memberCount: 5,
      focus: 'Hill intervals and speed drills',
    })
    .expect(201);

  assert.equal(response.body.status, 'success');
  assert.equal(response.body.team.name, 'Summit Sprinters');
  assert.equal(response.body.team.memberCount, 5);
  assert.equal(response.body.team.focus, 'Hill intervals and speed drills');
});

test('lists newly created teams through the canonical team listing endpoint', async () => {
  const app = createApp();

  await request(app)
    .post('/api/teams/')
    .send({
      name: 'Pace Setters',
      memberCount: 7,
      focus: 'Weekly endurance sessions',
    })
    .expect(201);

  const response = await request(app)
    .get('/api/teams/')
    .expect(200);

  assert.equal(response.body.status, 'success');
  assert.equal(response.body.teams.length, 1);
  assert.equal(response.body.teams[0].name, 'Pace Setters');
});

test('returns a frontend-consumable team listing payload for empty and populated states', async () => {
  const app = createApp();

  const emptyResponse = await request(app)
    .get('/api/teams/')
    .expect(200);

  assert.deepEqual(emptyResponse.body, {
    status: 'success',
    teams: [],
  });

  await request(app)
    .post('/api/teams/')
    .send({
      name: 'North Stars',
      memberCount: 8,
      focus: 'Morning cardio sessions',
    })
    .expect(201);

  await request(app)
    .post('/api/teams/')
    .send({
      name: 'Studio Strides',
      memberCount: 5,
      focus: 'Yoga and mobility blocks',
    })
    .expect(201);

  const response = await request(app)
    .get('/api/teams/')
    .expect(200);

  assert.equal(response.body.status, 'success');
  assert.deepEqual(response.body.teams, [
    {
      id: 2,
      name: 'Studio Strides',
      memberCount: 5,
      focus: 'Yoga and mobility blocks',
    },
    {
      id: 1,
      name: 'North Stars',
      memberCount: 8,
      focus: 'Morning cardio sessions',
    },
  ]);
});

test('returns newly created teams in the bootstrap payload', async () => {
  const app = createApp();

  const createResponse = await request(app)
    .post('/api/teams/')
    .send({
      name: 'Relay Rockets',
      memberCount: 4,
      focus: 'Relay practice and recovery runs',
    })
    .expect(201);

  const listResponse = await request(app)
    .get('/api/teams/')
    .expect(200);

  const response = await request(app)
    .get('/api/bootstrap/')
    .expect(200);

  assert.equal(response.body.status, 'success');
  assert.equal(response.body.teams.length, 1);
  assert.deepEqual(createResponse.body.team, {
    id: 1,
    name: 'Relay Rockets',
    memberCount: 4,
    focus: 'Relay practice and recovery runs',
  });
  assert.deepEqual(listResponse.body.teams[0], createResponse.body.team);
  assert.deepEqual(response.body.teams[0], createResponse.body.team);
  assert.equal(response.body.dashboard.totalTeams, 1);
});

test('uses the same in-memory team source for listing and bootstrap responses', async () => {
  const app = createApp();

  await request(app)
    .post('/api/teams/')
    .send({
      name: 'Trail Blazers',
      memberCount: 6,
      focus: 'Weekend trail runs',
    })
    .expect(201);

  await request(app)
    .post('/api/teams/')
    .send({
      name: 'Core Crew',
      memberCount: 3,
      focus: 'Strength circuits',
    })
    .expect(201);

  const listResponse = await request(app)
    .get('/api/teams/')
    .expect(200);

  const bootstrapResponse = await request(app)
    .get('/api/bootstrap/')
    .expect(200);

  assert.equal(listResponse.body.status, 'success');
  assert.equal(bootstrapResponse.body.status, 'success');
  assert.deepEqual(bootstrapResponse.body.teams, listResponse.body.teams);
  assert.deepEqual(listResponse.body.teams, [
    {
      id: 2,
      name: 'Core Crew',
      memberCount: 3,
      focus: 'Strength circuits',
    },
    {
      id: 1,
      name: 'Trail Blazers',
      memberCount: 6,
      focus: 'Weekend trail runs',
    },
  ]);
  assert.equal(bootstrapResponse.body.dashboard.totalTeams, 2);
});