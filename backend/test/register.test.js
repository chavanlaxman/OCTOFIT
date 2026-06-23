const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');
const { resetAccounts } = require('../src/registrationService');

test.beforeEach(() => {
  resetAccounts();
});

test('returns the starter registration contract', async () => {
  const app = createApp();
  const response = await request(app)
    .get('/api/users/register/contract')
    .expect(200);

  assert.equal(response.body.endpoint, '/api/users/register/');
  assert.equal(response.body.fields.length, 5);
});

test('rejects missing required registration fields', async () => {
  const app = createApp();
  const response = await request(app)
    .post('/api/users/register/')
    .send({})
    .expect(400);

  assert.equal(response.body.status, 'error');
  assert.ok(response.body.errors.firstName);
  assert.ok(response.body.errors.consentAccepted);
});

test('creates a student account for a valid registration payload', async () => {
  const app = createApp();
  const response = await request(app)
    .post('/api/users/register/')
    .send({
      firstName: 'Taylor',
      lastName: 'Student',
      email: 'Taylor.Student@example.com',
      password: 'Password9',
      consentAccepted: true,
    })
    .expect(201);

  assert.equal(response.body.status, 'success');
  assert.equal(response.body.account.role, 'student');
  assert.equal(response.body.account.email, 'taylor.student@example.com');
});

test('rejects duplicate email registration attempts', async () => {
  const app = createApp();
  const payload = {
    firstName: 'Jordan',
    lastName: 'Student',
    email: 'jordan@example.com',
    password: 'Password9',
    consentAccepted: true,
  };

  await request(app)
    .post('/api/users/register/')
    .send(payload)
    .expect(201);

  const duplicateResponse = await request(app)
    .post('/api/users/register/')
    .send(payload)
    .expect(409);

  assert.equal(duplicateResponse.body.status, 'error');
  assert.deepEqual(duplicateResponse.body.errors.email, [
    'An account already exists for this email address.',
  ]);
});
