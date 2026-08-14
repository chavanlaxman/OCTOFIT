const express = require('express');
const path = require('node:path');
const {
  activityContract,
  listActivities,
  listLeaderboard,
  logActivity,
} = require('./activityService');
const { createBootstrapPayload } = require('./bootstrapService');
const { registrationContract } = require('./registrationContract');
const { registerStudent } = require('./registrationService');
const { createTeam, joinTeam, listTeams } = require('./teamService');
const {
  createNutrition,
  updateNutrition,
  deleteNutrition,
  listNutrition,
} = require('./nutritionService');
const {
  createRoutine,
  updateRoutine,
  deleteRoutine,
  listRoutine,
} = require('./routineService');

async function sendServiceResult(response, resultPromise) {
  const result = await resultPromise;
  if (result.statusCode === 204) {
    return response.status(204).end();
  }

  return response.status(result.statusCode).json(result.body);
}

function createApp() {
  const app = express();
  const frontendDir = path.resolve(__dirname, '../../frontend');

  app.use((request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

    if (request.method === 'OPTIONS') {
      return response.sendStatus(204);
    }

    next();
  });

  app.use(express.json());
  app.use(express.static(frontendDir));

  app.get('/api/health', (request, response) => {
    response.json({ status: 'ok' });
  });

  app.get('/api/activities/contract', (request, response) => {
    response.json({
      endpoint: activityContract.endpoint,
      fields: activityContract.fields,
    });
  });

  app.get(activityContract.endpoint, (request, response) => {
    response.json({
      status: 'success',
      activities: listActivities(),
    });
  });

  app.get('/api/leaderboard/', (request, response) => {
    response.json({
      status: 'success',
      rankings: listLeaderboard(),
    });
  });

  app.get('/api/teams/', (request, response) => {
    response.json({
      status: 'success',
      teams: listTeams(),
    });
  });

  app.get('/api/bootstrap/', (request, response) => {
    response.json(createBootstrapPayload());
  });

  app.post(activityContract.endpoint, (request, response) => {
    const result = logActivity(request.body || {});
    response.status(result.statusCode).json(result.body);
  });

  app.post('/api/teams/', (request, response) => {
    const result = createTeam(request.body || {});
    response.status(result.statusCode).json(result.body);
  });

  app.post('/api/teams/:teamId/join/', (request, response) => {
    const result = joinTeam(request.params.teamId, request.body || {});
    response.status(result.statusCode).json(result.body);
  });

  app.get('/api/users/register/contract', (request, response) => {
    response.json({
      endpoint: registrationContract.endpoint,
      fields: registrationContract.fields,
    });
  });

  app.post(registrationContract.endpoint, (request, response) => {
    const result = registerStudent(request.body || {});
    response.status(result.statusCode).json(result.body);
  });

  app.post('/api/nutrition/', (request, response, next) => {
    sendServiceResult(response, createNutrition(request.body || {})).catch(next);
  });

  app.get('/api/nutrition/', (request, response, next) => {
    sendServiceResult(response, listNutrition(request.query || {})).catch(next);
  });

  app.put('/api/nutrition/:id', (request, response, next) => {
    sendServiceResult(response, updateNutrition(request.params.id, request.body || {})).catch(next);
  });

  app.delete('/api/nutrition/:id', (request, response, next) => {
    sendServiceResult(response, deleteNutrition(request.params.id)).catch(next);
  });

  app.post('/api/routine/', (request, response, next) => {
    sendServiceResult(response, createRoutine(request.body || {})).catch(next);
  });

  app.get('/api/routine/', (request, response, next) => {
    sendServiceResult(response, listRoutine(request.query || {})).catch(next);
  });

  app.put('/api/routine/:id', (request, response, next) => {
    sendServiceResult(response, updateRoutine(request.params.id, request.body || {})).catch(next);
  });

  app.delete('/api/routine/:id', (request, response, next) => {
    sendServiceResult(response, deleteRoutine(request.params.id)).catch(next);
  });

  return app;
}

module.exports = {
  createApp,
};
