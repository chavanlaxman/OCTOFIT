const {
  createTeamRecord,
  listTeamRecords,
  resetTeams,
} = require('./teamRepository');

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function addError(errors, fieldName, message) {
  if (!errors[fieldName]) {
    errors[fieldName] = [];
  }

  errors[fieldName].push(message);
}

function validateTeamInput(payload) {
  const errors = {};
  const name = sanitizeText(payload.name);
  const focus = sanitizeText(payload.focus);
  const rawMemberCount = payload.memberCount;
  const memberCount = Number(rawMemberCount);

  if (name.length === 0) {
    addError(errors, 'name', 'Team name is required.');
  }

  if (!Number.isInteger(memberCount) || memberCount < 1) {
    addError(errors, 'memberCount', 'Member count must be a whole number greater than 0.');
  }

  return {
    errors,
    sanitized: {
      name,
      memberCount,
      focus,
    },
    isValid: Object.keys(errors).length === 0,
  };
}

function mapTeam(team) {
  return {
    id: team.id,
    name: team.name,
    memberCount: team.memberCount,
    focus: team.focus,
  };
}

function createTeam(payload) {
  const { errors, sanitized, isValid } = validateTeamInput(payload);
  if (!isValid) {
    return {
      statusCode: 400,
      body: {
        status: 'error',
        errors,
      },
    };
  }

  const team = createTeamRecord(sanitized);

  return {
    statusCode: 201,
    body: {
      status: 'success',
      team: mapTeam(team),
    },
  };
}

function listTeams() {
  return listTeamRecords().map(mapTeam);
}

module.exports = {
  createTeam,
  listTeams,
  resetTeams,
  validateTeamInput,
};