const dailyEntryRepository = require('./dailyEntryRepository');
const { listActivities } = require('./activityService');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MOODS = ['great', 'good', 'okay', 'low'];
const DEFAULT_LIST_DAYS = 7;

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function addError(errors, fieldName, message) {
  if (!errors[fieldName]) {
    errors[fieldName] = [];
  }

  errors[fieldName].push(message);
}

function isValidCalendarDate(value) {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year
    && parsed.getMonth() === month - 1
    && parsed.getDate() === day;
}

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

function parseActivityIds(rawValue, errors) {
  if (rawValue === undefined || rawValue === null) {
    return [];
  }

  if (!Array.isArray(rawValue)) {
    addError(errors, 'activityIds', 'Activity ids must be an array.');
    return [];
  }

  const liveIds = new Set(listActivities().map((activity) => Number(activity.id)));
  const parsed = [];

  for (const rawId of rawValue) {
    if (rawId === '' || rawId === null || rawId === undefined) {
      addError(errors, 'activityIds', 'Activity ids must be integers.');
      continue;
    }

    const numericId = Number(rawId);
    if (!Number.isInteger(numericId)) {
      addError(errors, 'activityIds', 'Activity ids must be integers.');
      continue;
    }

    if (!liveIds.has(numericId)) {
      addError(errors, 'activityIds', 'Activity ids must reference existing activities.');
      continue;
    }

    parsed.push(numericId);
  }

  return [...new Set(parsed)];
}

function parseCompleted(rawValue, errors) {
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return false;
  }

  if (typeof rawValue === 'boolean') {
    return rawValue;
  }

  addError(errors, 'completed', 'Completed must be a boolean.');
  return false;
}

function validateDailyEntryInput(payload) {
  const errors = {};
  const userIdRaw = payload.userId;
  const userId = userIdRaw === undefined || userIdRaw === null
    ? ''
    : String(userIdRaw).trim();
  const date = sanitizeText(payload.date);
  const notes = sanitizeText(payload.notes);
  const activityIds = parseActivityIds(payload.activityIds, errors);
  const completed = parseCompleted(payload.completed, errors);

  if (!userId) {
    addError(errors, 'userId', 'User id is required.');
  }

  if (!date) {
    addError(errors, 'date', 'Date is required.');
  } else if (!isValidCalendarDate(date)) {
    addError(errors, 'date', 'Date must be a valid YYYY-MM-DD value.');
  }

  const moodRaw = payload.mood;
  let mood;
  if (moodRaw !== undefined && moodRaw !== null && String(moodRaw).trim() !== '') {
    const moodValue = String(moodRaw).trim();
    if (!MOODS.includes(moodValue)) {
      addError(errors, 'mood', 'Mood must be great, good, okay, or low.');
    } else {
      mood = moodValue;
    }
  }

  const energyRaw = payload.energy;
  let energy;
  if (energyRaw !== undefined && energyRaw !== null && energyRaw !== '') {
    const energyValue = Number(energyRaw);
    if (!Number.isInteger(energyValue) || energyValue < 1 || energyValue > 5) {
      addError(errors, 'energy', 'Energy must be an integer from 1 to 5.');
    } else {
      energy = energyValue;
    }
  }

  const sanitized = {
    userId,
    date,
    activityIds,
    notes,
    completed,
  };

  if (mood !== undefined) {
    sanitized.mood = mood;
  }

  if (energy !== undefined) {
    sanitized.energy = energy;
  }

  return {
    errors,
    sanitized,
    isValid: Object.keys(errors).length === 0,
  };
}

function parsePositiveIntegerDays(rawDays, errors) {
  if (rawDays === undefined || rawDays === null) {
    return DEFAULT_LIST_DAYS;
  }

  const trimmed = String(rawDays).trim();
  if (!/^\d+$/.test(trimmed)) {
    addError(errors, 'days', 'Days must be a positive integer.');
    return undefined;
  }

  const value = Number(trimmed);
  if (!Number.isInteger(value) || value < 1) {
    addError(errors, 'days', 'Days must be a positive integer.');
    return undefined;
  }

  return value;
}

function validateListQuery(query) {
  const errors = {};
  const userIdRaw = query.userId;
  const userId = userIdRaw === undefined || userIdRaw === null
    ? ''
    : String(userIdRaw).trim();
  const dateRaw = query.date;
  const date = dateRaw === undefined || dateRaw === null
    ? ''
    : sanitizeText(dateRaw);

  if (!userId) {
    addError(errors, 'userId', 'User id is required.');
  }

  if (date) {
    if (!isValidCalendarDate(date)) {
      addError(errors, 'date', 'Date must be a valid YYYY-MM-DD value.');
    }
  }

  const days = parsePositiveIntegerDays(query.days, errors);

  return {
    errors,
    sanitized: {
      userId,
      date: date || undefined,
      days,
    },
    isValid: Object.keys(errors).length === 0,
  };
}

function mapDailyEntry(entry) {
  const mapped = {
    id: entry.id,
    userId: entry.userId,
    date: entry.date,
    activityIds: Array.isArray(entry.activityIds) ? [...entry.activityIds] : [],
    notes: entry.notes,
    completed: Boolean(entry.completed),
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };

  if (entry.mood !== undefined) {
    mapped.mood = entry.mood;
  }

  if (entry.energy !== undefined) {
    mapped.energy = entry.energy;
  }

  return mapped;
}

function uniquenessConflict() {
  return {
    statusCode: 409,
    body: {
      status: 'error',
      errors: {
        date: ['A daily entry already exists for this user and date.'],
      },
    },
  };
}

async function createDailyEntry(payload) {
  const { errors, sanitized, isValid } = validateDailyEntryInput(payload || {});
  if (!isValid) {
    return {
      statusCode: 400,
      body: {
        status: 'error',
        errors,
      },
    };
  }

  const existing = await dailyEntryRepository.findByUserIdAndDate(sanitized.userId, sanitized.date);
  if (existing) {
    return uniquenessConflict();
  }

  const dailyEntry = await dailyEntryRepository.create(sanitized);
  return {
    statusCode: 201,
    body: {
      status: 'success',
      dailyEntry: mapDailyEntry(dailyEntry),
    },
  };
}

async function updateDailyEntry(id, payload) {
  const existing = await dailyEntryRepository.getById(id);
  if (!existing) {
    return {
      statusCode: 404,
      body: {
        status: 'error',
        errors: {
          id: ['No daily entry exists for the requested id.'],
        },
      },
    };
  }

  const { errors, sanitized, isValid } = validateDailyEntryInput(payload || {});
  if (!isValid) {
    return {
      statusCode: 400,
      body: {
        status: 'error',
        errors,
      },
    };
  }

  const occupant = await dailyEntryRepository.findByUserIdAndDate(sanitized.userId, sanitized.date);
  if (occupant && Number(occupant.id) !== Number(existing.id)) {
    return uniquenessConflict();
  }

  const dailyEntry = await dailyEntryRepository.update(id, sanitized);
  return {
    statusCode: 200,
    body: {
      status: 'success',
      dailyEntry: mapDailyEntry(dailyEntry),
    },
  };
}

async function deleteDailyEntry(id) {
  const deleted = await dailyEntryRepository.remove(id);
  if (!deleted) {
    return {
      statusCode: 404,
      body: {
        status: 'error',
        errors: {
          id: ['No daily entry exists for the requested id.'],
        },
      },
    };
  }

  return {
    statusCode: 204,
  };
}

async function listDailyEntries(query) {
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

  if (sanitized.date) {
    const found = await dailyEntryRepository.findByUserIdAndDate(sanitized.userId, sanitized.date);
    return {
      statusCode: 200,
      body: {
        status: 'success',
        dailyEntries: found ? [mapDailyEntry(found)] : [],
      },
    };
  }

  const endDate = todayIsoDate();
  const startDate = addCalendarDays(endDate, -(sanitized.days - 1));
  const dailyEntries = await dailyEntryRepository.listByUserInDateRange(
    sanitized.userId,
    startDate,
    endDate,
  );

  return {
    statusCode: 200,
    body: {
      status: 'success',
      dailyEntries: dailyEntries.map(mapDailyEntry),
    },
  };
}

module.exports = {
  MOODS,
  createDailyEntry,
  updateDailyEntry,
  deleteDailyEntry,
  listDailyEntries,
  validateDailyEntryInput,
  resetDailyEntries: dailyEntryRepository.resetDailyEntries,
};
