const routineRepository = require('./routineRepository');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function addError(errors, fieldName, message) {
  if (!errors[fieldName]) {
    errors[fieldName] = [];
  }

  errors[fieldName].push(message);
}

function validateRoutineInput(payload) {
  const errors = {};
  const userIdRaw = payload.userId;
  const userId = userIdRaw === undefined || userIdRaw === null
    ? ''
    : String(userIdRaw).trim();
  const date = sanitizeText(payload.date);

  if (!userId) {
    addError(errors, 'userId', 'User id is required.');
  }

  if (!date) {
    addError(errors, 'date', 'Date is required.');
  } else if (!DATE_PATTERN.test(date) || Number.isNaN(new Date(date).getTime())) {
    addError(errors, 'date', 'Date must be a valid YYYY-MM-DD value.');
  }

  const sleepHours = Number(payload.sleepHours);
  if (payload.sleepHours === '' || payload.sleepHours === null || payload.sleepHours === undefined
    || Number.isNaN(sleepHours)) {
    addError(errors, 'sleepHours', 'Sleep hours is required.');
  } else if (sleepHours < 0 || sleepHours > 24) {
    addError(errors, 'sleepHours', 'Sleep hours must be between 0 and 24.');
  }

  const waterIntake = Number(payload.waterIntake);
  if (payload.waterIntake === '' || payload.waterIntake === null || payload.waterIntake === undefined
    || Number.isNaN(waterIntake)) {
    addError(errors, 'waterIntake', 'Water intake is required.');
  } else if (waterIntake < 0) {
    addError(errors, 'waterIntake', 'Water intake must be zero or greater.');
  }

  const steps = Number(payload.steps);
  if (payload.steps === '' || payload.steps === null || payload.steps === undefined
    || Number.isNaN(steps)) {
    addError(errors, 'steps', 'Steps is required.');
  } else if (!Number.isInteger(steps) || steps < 0) {
    addError(errors, 'steps', 'Steps must be a whole number zero or greater.');
  }

  return {
    errors,
    sanitized: {
      userId,
      date,
      sleepHours,
      waterIntake,
      steps,
    },
    isValid: Object.keys(errors).length === 0,
  };
}

function validateListQuery(query) {
  const errors = {};
  const userIdRaw = query.userId;
  const userId = userIdRaw === undefined || userIdRaw === null
    ? ''
    : String(userIdRaw).trim();
  const date = sanitizeText(query.date);

  if (!userId) {
    addError(errors, 'userId', 'User id is required.');
  }

  if (!date) {
    addError(errors, 'date', 'Date is required.');
  } else if (!DATE_PATTERN.test(date) || Number.isNaN(new Date(date).getTime())) {
    addError(errors, 'date', 'Date must be a valid YYYY-MM-DD value.');
  }

  return {
    errors,
    sanitized: { userId, date },
    isValid: Object.keys(errors).length === 0,
  };
}

function mapRoutine(entry) {
  return {
    id: entry.id,
    userId: entry.userId,
    date: entry.date,
    sleepHours: entry.sleepHours,
    waterIntake: entry.waterIntake,
    steps: entry.steps,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

async function createRoutine(payload) {
  const { errors, sanitized, isValid } = validateRoutineInput(payload || {});
  if (!isValid) {
    return {
      statusCode: 400,
      body: {
        status: 'error',
        errors,
      },
    };
  }

  const routine = await routineRepository.create(sanitized);
  return {
    statusCode: 201,
    body: {
      status: 'success',
      routine: mapRoutine(routine),
    },
  };
}

async function updateRoutine(id, payload) {
  const existing = await routineRepository.getById(id);
  if (!existing) {
    return {
      statusCode: 404,
      body: {
        status: 'error',
        errors: {
          id: ['No routine entry exists for the requested id.'],
        },
      },
    };
  }

  const { errors, sanitized, isValid } = validateRoutineInput(payload || {});
  if (!isValid) {
    return {
      statusCode: 400,
      body: {
        status: 'error',
        errors,
      },
    };
  }

  const routine = await routineRepository.update(id, sanitized);
  return {
    statusCode: 200,
    body: {
      status: 'success',
      routine: mapRoutine(routine),
    },
  };
}

async function deleteRoutine(id) {
  const deleted = await routineRepository.remove(id);
  if (!deleted) {
    return {
      statusCode: 404,
      body: {
        status: 'error',
        errors: {
          id: ['No routine entry exists for the requested id.'],
        },
      },
    };
  }

  return {
    statusCode: 204,
  };
}

async function listRoutine(query) {
  const { errors, sanitized, isValid } = validateListQuery(query || {});
  if (!isValid) {
    return {
      statusCode: 400,
      body: {
        status: 'error',
        errors,
      },
    };
  }

  const routines = await routineRepository.listByUserAndDate(
    sanitized.userId,
    sanitized.date,
  );

  return {
    statusCode: 200,
    body: {
      status: 'success',
      routines: routines.map(mapRoutine),
    },
  };
}

module.exports = {
  createRoutine,
  updateRoutine,
  deleteRoutine,
  listRoutine,
  validateRoutineInput,
  resetRoutine: routineRepository.resetRoutine,
};
