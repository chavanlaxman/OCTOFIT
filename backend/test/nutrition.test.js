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
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'octofit-nutrition-'));
  process.env.OCTOFIT_STORAGE = 'json';
  process.env.OCTOFIT_DATA_DIR = dataDir;
  resetNutrition();
  resetRoutine();
});

test.afterEach(() => {
  fs.rmSync(dataDir, { recursive: true, force: true });
});

function validNutritionPayload(overrides = {}) {
  return {
    userId: '1',
    date: '2026-08-12',
    mealType: 'Breakfast',
    description: 'Oatmeal with berries',
    calories: 320,
    protein: 12,
    carbs: 48,
    fat: 8,
    ...overrides,
  };
}

test('creates a valid nutrition entry', async () => {
  const app = createApp();
  const response = await request(app)
    .post('/api/nutrition/')
    .send(validNutritionPayload())
    .expect(201);

  assert.equal(response.body.status, 'success');
  assert.equal(response.body.nutrition.mealType, 'Breakfast');
  assert.equal(response.body.nutrition.description, 'Oatmeal with berries');
  assert.equal(response.body.nutrition.userId, '1');
  assert.equal(response.body.nutrition.date, '2026-08-12');
  assert.equal(response.body.nutrition.calories, 320);
  assert.ok(response.body.nutrition.id);
});

test('rejects invalid nutrition submissions without persisting', async () => {
  const app = createApp();
  const response = await request(app)
    .post('/api/nutrition/')
    .send({
      userId: '',
      date: 'bad-date',
      mealType: 'Brunch',
      description: '   ',
      calories: -10,
    })
    .expect(400);

  assert.equal(response.body.status, 'error');
  assert.ok(response.body.errors.userId);
  assert.ok(response.body.errors.date);
  assert.ok(response.body.errors.mealType);
  assert.ok(response.body.errors.description);
  assert.ok(response.body.errors.calories);

  const listResponse = await request(app)
    .get('/api/nutrition/')
    .query({ userId: '1', date: '2026-08-12' })
    .expect(200);

  assert.equal(listResponse.body.nutritionEntries.length, 0);
});

test('updates a nutrition entry and persists the change', async () => {
  const app = createApp();
  const createResponse = await request(app)
    .post('/api/nutrition/')
    .send(validNutritionPayload())
    .expect(201);

  const id = createResponse.body.nutrition.id;
  const updateResponse = await request(app)
    .put(`/api/nutrition/${id}`)
    .send(validNutritionPayload({
      mealType: 'Lunch',
      description: 'Grilled chicken salad',
      calories: 450,
    }))
    .expect(200);

  assert.equal(updateResponse.body.status, 'success');
  assert.equal(updateResponse.body.nutrition.mealType, 'Lunch');
  assert.equal(updateResponse.body.nutrition.description, 'Grilled chicken salad');
  assert.equal(updateResponse.body.nutrition.calories, 450);

  const listResponse = await request(app)
    .get('/api/nutrition/')
    .query({ userId: '1', date: '2026-08-12' })
    .expect(200);

  assert.equal(listResponse.body.nutritionEntries.length, 1);
  assert.equal(listResponse.body.nutritionEntries[0].description, 'Grilled chicken salad');
});

test('full PUT clears omitted optional nutrition macros', async () => {
  const app = createApp();
  const createResponse = await request(app)
    .post('/api/nutrition/')
    .send(validNutritionPayload())
    .expect(201);

  const id = createResponse.body.nutrition.id;
  const updateResponse = await request(app)
    .put(`/api/nutrition/${id}`)
    .send({
      userId: '1',
      date: '2026-08-12',
      mealType: 'Dinner',
      description: 'Plain rice',
    })
    .expect(200);

  assert.equal(updateResponse.body.nutrition.description, 'Plain rice');
  assert.equal(updateResponse.body.nutrition.calories, undefined);
  assert.equal(updateResponse.body.nutrition.protein, undefined);
  assert.equal(updateResponse.body.nutrition.carbs, undefined);
  assert.equal(updateResponse.body.nutrition.fat, undefined);

  const listResponse = await request(app)
    .get('/api/nutrition/')
    .query({ userId: '1', date: '2026-08-12' })
    .expect(200);

  assert.equal(listResponse.body.nutritionEntries[0].calories, undefined);
  assert.equal(listResponse.body.nutritionEntries[0].protein, undefined);
});

test('deletes a nutrition entry with 204 and removes it from list', async () => {
  const app = createApp();
  const createResponse = await request(app)
    .post('/api/nutrition/')
    .send(validNutritionPayload())
    .expect(201);

  const id = createResponse.body.nutrition.id;
  await request(app)
    .delete(`/api/nutrition/${id}`)
    .expect(204);

  const listResponse = await request(app)
    .get('/api/nutrition/')
    .query({ userId: '1', date: '2026-08-12' })
    .expect(200);

  assert.equal(listResponse.body.nutritionEntries.length, 0);
});

test('lists nutrition entries filtered by userId and date', async () => {
  const app = createApp();

  await request(app)
    .post('/api/nutrition/')
    .send(validNutritionPayload({ description: 'Match A' }))
    .expect(201);

  await request(app)
    .post('/api/nutrition/')
    .send(validNutritionPayload({
      userId: '2',
      description: 'Other user',
    }))
    .expect(201);

  await request(app)
    .post('/api/nutrition/')
    .send(validNutritionPayload({
      date: '2026-08-11',
      description: 'Other date',
    }))
    .expect(201);

  await request(app)
    .post('/api/nutrition/')
    .send(validNutritionPayload({
      mealType: 'Snack',
      description: 'Match B',
    }))
    .expect(201);

  const response = await request(app)
    .get('/api/nutrition/')
    .query({ userId: '1', date: '2026-08-12' })
    .expect(200);

  assert.equal(response.body.status, 'success');
  assert.equal(response.body.nutritionEntries.length, 2);
  const descriptions = response.body.nutritionEntries.map((entry) => entry.description).sort();
  assert.deepEqual(descriptions, ['Match A', 'Match B']);
});

test('requires userId and date query params for nutrition list', async () => {
  const app = createApp();

  const missingBoth = await request(app)
    .get('/api/nutrition/')
    .expect(400);

  assert.equal(missingBoth.body.status, 'error');
  assert.ok(missingBoth.body.errors.userId);
  assert.ok(missingBoth.body.errors.date);

  const missingDate = await request(app)
    .get('/api/nutrition/')
    .query({ userId: '1' })
    .expect(400);

  assert.ok(missingDate.body.errors.date);

  const missingUser = await request(app)
    .get('/api/nutrition/')
    .query({ date: '2026-08-12' })
    .expect(400);

  assert.ok(missingUser.body.errors.userId);
});

test('returns 404 when updating a missing nutrition entry', async () => {
  const app = createApp();
  const response = await request(app)
    .put('/api/nutrition/99999')
    .send(validNutritionPayload())
    .expect(404);

  assert.equal(response.body.status, 'error');
  assert.ok(response.body.errors.id);
});

test('returns 404 when deleting a missing nutrition entry', async () => {
  const app = createApp();
  const response = await request(app)
    .delete('/api/nutrition/99999')
    .expect(404);

  assert.equal(response.body.status, 'error');
  assert.ok(response.body.errors.id);
});
