const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const request = require('supertest');
const { createApp } = require('../src/app');
const { resetDailyEntries } = require('../src/dailyEntryService');
const { resetActivities } = require('../src/activityService');

let dataDir;

test.beforeEach(() => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'octofit-daily-entry-'));
  process.env.OCTOFIT_STORAGE = 'json';
  process.env.OCTOFIT_DATA_DIR = dataDir;
  resetDailyEntries();
  resetActivities();
});

test.afterEach(() => {
  fs.rmSync(dataDir, { recursive: true, force: true });
});

function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addCalendarDays(isoDate, deltaDays) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + deltaDays);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  const nextDay = String(date.getDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function validDailyPayload(overrides = {}) {
  return {
    userId: '1',
    date: '2026-08-12',
    notes: 'Morning session',
    mood: 'good',
    energy: 4,
    completed: true,
    ...overrides,
  };
}

async function createActivity(app, overrides = {}) {
  const response = await request(app)
    .post('/api/activities/')
    .send({
      studentName: 'Taylor Student',
      activityType: 'Running',
      durationMinutes: 30,
      performedAt: '2026-08-12',
      notes: 'Track workout',
      ...overrides,
    })
    .expect(201);

  return response.body.activity.id;
}

test('creates a valid daily entry', async () => {
  const app = createApp();
  const activityId = await createActivity(app);

  const response = await request(app)
    .post('/api/daily-entries/')
    .send(validDailyPayload({ activityIds: [activityId] }))
    .expect(201);

  assert.equal(response.body.status, 'success');
  assert.equal(response.body.dailyEntry.userId, '1');
  assert.equal(response.body.dailyEntry.date, '2026-08-12');
  assert.equal(response.body.dailyEntry.notes, 'Morning session');
  assert.equal(response.body.dailyEntry.mood, 'good');
  assert.equal(response.body.dailyEntry.energy, 4);
  assert.equal(response.body.dailyEntry.completed, true);
  assert.deepEqual(response.body.dailyEntry.activityIds, [activityId]);
  assert.ok(response.body.dailyEntry.id);
  assert.ok(response.body.dailyEntry.createdAt);
  assert.ok(response.body.dailyEntry.updatedAt);
});

test('omitted optional daily entry fields persist as defaults', async () => {
  const app = createApp();
  const response = await request(app)
    .post('/api/daily-entries/')
    .send({
      userId: '1',
      date: '2026-08-12',
    })
    .expect(201);

  assert.deepEqual(response.body.dailyEntry.activityIds, []);
  assert.equal(response.body.dailyEntry.notes, '');
  assert.equal(response.body.dailyEntry.completed, false);
  assert.equal(response.body.dailyEntry.mood, undefined);
  assert.equal(response.body.dailyEntry.energy, undefined);
});

test('rejects invalid daily entry submissions without persisting', async () => {
  const app = createApp();

  const blankUser = await request(app)
    .post('/api/daily-entries/')
    .send(validDailyPayload({ userId: '   ' }))
    .expect(400);
  assert.equal(blankUser.body.status, 'error');
  assert.ok(blankUser.body.errors.userId);

  const invalidDate = await request(app)
    .post('/api/daily-entries/')
    .send(validDailyPayload({ date: 'bad-date' }))
    .expect(400);
  assert.ok(invalidDate.body.errors.date);

  const unknownActivity = await request(app)
    .post('/api/daily-entries/')
    .send(validDailyPayload({ activityIds: [99999] }))
    .expect(400);
  assert.ok(unknownActivity.body.errors.activityIds);

  const badMoodEnergy = await request(app)
    .post('/api/daily-entries/')
    .send(validDailyPayload({ mood: 'ecstatic', energy: 9 }))
    .expect(400);
  assert.ok(badMoodEnergy.body.errors.mood);
  assert.ok(badMoodEnergy.body.errors.energy);

  const listResponse = await request(app)
    .get('/api/daily-entries/')
    .query({ userId: '1', date: '2026-08-12' })
    .expect(200);

  assert.equal(listResponse.body.dailyEntries.length, 0);
});

test('lists last N daily entries with default 7 and days override', async () => {
  const app = createApp();
  const today = todayIsoDate();

  for (let offset = 0; offset <= 7; offset += 1) {
    await request(app)
      .post('/api/daily-entries/')
      .send(validDailyPayload({
        date: addCalendarDays(today, -offset),
        notes: `Day ${offset}`,
      }))
      .expect(201);
  }

  await request(app)
    .post('/api/daily-entries/')
    .send(validDailyPayload({
      userId: '2',
      date: today,
      notes: 'Other user',
    }))
    .expect(201);

  const defaultWindow = await request(app)
    .get('/api/daily-entries/')
    .query({ userId: '1' })
    .expect(200);

  assert.equal(defaultWindow.body.status, 'success');
  assert.equal(defaultWindow.body.dailyEntries.length, 7);
  assert.equal(defaultWindow.body.dailyEntries[0].date, today);
  assert.equal(defaultWindow.body.dailyEntries[6].date, addCalendarDays(today, -6));
  assert.equal(
    defaultWindow.body.dailyEntries.some((entry) => entry.date === addCalendarDays(today, -7)),
    false,
  );
  assert.equal(
    defaultWindow.body.dailyEntries.some((entry) => entry.userId === '2'),
    false,
  );

  const threeDays = await request(app)
    .get('/api/daily-entries/')
    .query({ userId: '1', days: 3 })
    .expect(200);

  assert.equal(threeDays.body.dailyEntries.length, 3);
  assert.deepEqual(
    threeDays.body.dailyEntries.map((entry) => entry.date),
    [today, addCalendarDays(today, -1), addCalendarDays(today, -2)],
  );
});

test('date query wins over days and returns at most one entry', async () => {
  const app = createApp();
  const today = todayIsoDate();
  const yesterday = addCalendarDays(today, -1);

  await request(app)
    .post('/api/daily-entries/')
    .send(validDailyPayload({ date: today, notes: 'Today' }))
    .expect(201);

  await request(app)
    .post('/api/daily-entries/')
    .send(validDailyPayload({ date: yesterday, notes: 'Yesterday' }))
    .expect(201);

  const response = await request(app)
    .get('/api/daily-entries/')
    .query({ userId: '1', date: yesterday, days: 7 })
    .expect(200);

  assert.equal(response.body.dailyEntries.length, 1);
  assert.equal(response.body.dailyEntries[0].date, yesterday);
  assert.equal(response.body.dailyEntries[0].notes, 'Yesterday');
});

test('requires userId for daily entry list', async () => {
  const app = createApp();
  const response = await request(app)
    .get('/api/daily-entries/')
    .expect(400);

  assert.equal(response.body.status, 'error');
  assert.ok(response.body.errors.userId);
});

test('rejects invalid date on daily entry list with 400', async () => {
  const app = createApp();
  const response = await request(app)
    .get('/api/daily-entries/')
    .query({ userId: '1', date: 'not-a-date' })
    .expect(400);

  assert.equal(response.body.status, 'error');
  assert.ok(response.body.errors.date);
});

test('rejects invalid supplied days for daily entry list', async () => {
  const app = createApp();

  const zero = await request(app)
    .get('/api/daily-entries/')
    .query({ userId: '1', days: 0 })
    .expect(400);
  assert.ok(zero.body.errors.days);

  const negative = await request(app)
    .get('/api/daily-entries/')
    .query({ userId: '1', days: -2 })
    .expect(400);
  assert.ok(negative.body.errors.days);

  const floatValue = await request(app)
    .get('/api/daily-entries/')
    .query({ userId: '1', days: 1.5 })
    .expect(400);
  assert.ok(floatValue.body.errors.days);

  const nonNumeric = await request(app)
    .get('/api/daily-entries/')
    .query({ userId: '1', days: 'abc' })
    .expect(400);
  assert.ok(nonNumeric.body.errors.days);
});

test('updates a daily entry and persists the change', async () => {
  const app = createApp();
  const createResponse = await request(app)
    .post('/api/daily-entries/')
    .send(validDailyPayload())
    .expect(201);

  const id = createResponse.body.dailyEntry.id;
  const updateResponse = await request(app)
    .put(`/api/daily-entries/${id}`)
    .send(validDailyPayload({
      notes: 'Evening wrap-up',
      mood: 'great',
      energy: 5,
      completed: false,
    }))
    .expect(200);

  assert.equal(updateResponse.body.status, 'success');
  assert.equal(updateResponse.body.dailyEntry.notes, 'Evening wrap-up');
  assert.equal(updateResponse.body.dailyEntry.mood, 'great');
  assert.equal(updateResponse.body.dailyEntry.energy, 5);
  assert.equal(updateResponse.body.dailyEntry.completed, false);

  const listResponse = await request(app)
    .get('/api/daily-entries/')
    .query({ userId: '1', date: '2026-08-12' })
    .expect(200);

  assert.equal(listResponse.body.dailyEntries.length, 1);
  assert.equal(listResponse.body.dailyEntries[0].notes, 'Evening wrap-up');
});

test('returns 404 when updating a missing daily entry', async () => {
  const app = createApp();
  const response = await request(app)
    .put('/api/daily-entries/99999')
    .send(validDailyPayload())
    .expect(404);

  assert.equal(response.body.status, 'error');
  assert.ok(response.body.errors.id);

  const listResponse = await request(app)
    .get('/api/daily-entries/')
    .query({ userId: '1', date: '2026-08-12' })
    .expect(200);
  assert.equal(listResponse.body.dailyEntries.length, 0);
});

test('rejects PUT that moves onto another entry userId and date pair', async () => {
  const app = createApp();
  const first = await request(app)
    .post('/api/daily-entries/')
    .send(validDailyPayload({ date: '2026-08-11', notes: 'First' }))
    .expect(201);

  const second = await request(app)
    .post('/api/daily-entries/')
    .send(validDailyPayload({ date: '2026-08-12', notes: 'Second' }))
    .expect(201);

  const conflict = await request(app)
    .put(`/api/daily-entries/${second.body.dailyEntry.id}`)
    .send(validDailyPayload({ date: '2026-08-11', notes: 'Should not merge' }))
    .expect(409);

  assert.equal(conflict.body.status, 'error');
  assert.ok(conflict.body.errors.date);

  const firstRow = await request(app)
    .get('/api/daily-entries/')
    .query({ userId: '1', date: '2026-08-11' })
    .expect(200);
  assert.equal(firstRow.body.dailyEntries[0].id, first.body.dailyEntry.id);
  assert.equal(firstRow.body.dailyEntries[0].notes, 'First');

  const secondRow = await request(app)
    .get('/api/daily-entries/')
    .query({ userId: '1', date: '2026-08-12' })
    .expect(200);
  assert.equal(secondRow.body.dailyEntries[0].id, second.body.dailyEntry.id);
  assert.equal(secondRow.body.dailyEntries[0].notes, 'Second');
});

test('deletes a daily entry with 204 empty body and 404 when missing', async () => {
  const app = createApp();
  const createResponse = await request(app)
    .post('/api/daily-entries/')
    .send(validDailyPayload())
    .expect(201);

  const id = createResponse.body.dailyEntry.id;
  const deleted = await request(app)
    .delete(`/api/daily-entries/${id}`)
    .expect(204);

  assert.equal(deleted.text, '');

  const listResponse = await request(app)
    .get('/api/daily-entries/')
    .query({ userId: '1', date: '2026-08-12' })
    .expect(200);
  assert.equal(listResponse.body.dailyEntries.length, 0);

  const missing = await request(app)
    .delete('/api/daily-entries/99999')
    .expect(404);
  assert.equal(missing.body.status, 'error');
  assert.ok(missing.body.errors.id);
});

test('rejects duplicate create with 409 and does not insert a second row', async () => {
  const app = createApp();
  await request(app)
    .post('/api/daily-entries/')
    .send(validDailyPayload())
    .expect(201);

  const duplicate = await request(app)
    .post('/api/daily-entries/')
    .send(validDailyPayload({ notes: 'Collision' }))
    .expect(409);

  assert.equal(duplicate.body.status, 'error');
  assert.ok(duplicate.body.errors.date);

  const listResponse = await request(app)
    .get('/api/daily-entries/')
    .query({ userId: '1', date: '2026-08-12' })
    .expect(200);

  assert.equal(listResponse.body.dailyEntries.length, 1);
  assert.equal(listResponse.body.dailyEntries[0].notes, 'Morning session');
});

test('bootstrap includes dailyEntries as an array including empty', async () => {
  const app = createApp();

  const empty = await request(app)
    .get('/api/bootstrap/')
    .expect(200);

  assert.equal(empty.body.status, 'success');
  assert.ok(Array.isArray(empty.body.dailyEntries));
  assert.equal(empty.body.dailyEntries.length, 0);
  assert.ok(empty.body.hero);
  assert.ok(empty.body.dashboard);
  assert.ok(Array.isArray(empty.body.users));
  assert.ok(Array.isArray(empty.body.teams));
  assert.ok(Array.isArray(empty.body.activities));
  assert.ok(Array.isArray(empty.body.challenges));
  assert.ok(Array.isArray(empty.body.leaderboard));
  assert.ok(Array.isArray(empty.body.recommendations));
  assert.equal(empty.body.nutritionEntries, undefined);
  assert.equal(empty.body.routines, undefined);

  await request(app)
    .post('/api/daily-entries/')
    .send(validDailyPayload())
    .expect(201);

  const populated = await request(app)
    .get('/api/bootstrap/')
    .expect(200);

  assert.ok(Array.isArray(populated.body.dailyEntries));
  assert.equal(populated.body.dailyEntries.length, 1);
  assert.equal(populated.body.dailyEntries[0].date, '2026-08-12');
});
