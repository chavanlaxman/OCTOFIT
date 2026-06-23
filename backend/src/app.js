const express = require('express');
const path = require('node:path');
const { registrationContract } = require('./registrationContract');
const { registerStudent } = require('./registrationService');

function createApp() {
  const app = express();
  const frontendDir = path.resolve(__dirname, '../../frontend');

  app.use((request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

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

  return app;
}

module.exports = {
  createApp,
};
