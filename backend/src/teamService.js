const {
  createTeamRecord,
  findTeamRecordById,
  incrementTeamMemberCount,
  listTeamRecords,
  resetTeams,
} = require('./teamRepository');
const {
  assignAccountToTeam,
  getAccountById,
} = require('./registrationService');

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

function joinTeam(teamIdInput, payload) {
  const errors = {};
  const teamId = Number(teamIdInput);
  const accountId = Number(payload.accountId);

  if (!Number.isInteger(accountId) || accountId < 1) {
    addError(errors, 'accountId', 'Account id must be a whole number greater than 0.');
  }

  if (!Number.isInteger(teamId) || teamId < 1) {
    addError(errors, 'teamId', 'Team id must be a whole number greater than 0.');
  }

  if (Object.keys(errors).length > 0) {
    return {
      statusCode: 400,
      body: {
        status: 'error',
        errors,
      },
    };
  }

  const team = findTeamRecordById(teamId);
  if (!team) {
    return {
      statusCode: 404,
      body: {
        status: 'error',
        errors: {
          teamId: ['No team exists for the requested id.'],
        },
      },
    };
  }

  const account = getAccountById(accountId);
  if (!account) {
    return {
      statusCode: 404,
      body: {
        status: 'error',
        errors: {
          accountId: ['No student account exists for the requested id.'],
        },
      },
    };
  }

  if (account.teamId === team.id) {
    return {
      statusCode: 409,
      body: {
        status: 'error',
        errors: {
          accountId: ['Student is already a member of this team.'],
        },
      },
    };
  }

  if (account.teamId != null) {
    return {
      statusCode: 409,
      body: {
        status: 'error',
        errors: {
          accountId: [`Student already belongs to team ${account.teamName}.`],
        },
      },
    };
  }

  const updatedAccount = assignAccountToTeam(account.id, team);
  const updatedTeam = incrementTeamMemberCount(team.id);

  return {
    statusCode: 200,
    body: {
      status: 'success',
      account: updatedAccount,
      team: mapTeam(updatedTeam),
    },
  };
}

function listTeams() {
  return listTeamRecords().map(mapTeam);
}

module.exports = {
  createTeam,
  joinTeam,
  listTeams,
  resetTeams,
  validateTeamInput,
};