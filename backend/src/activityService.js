const activityFields = [
  {
    name: 'studentName',
    label: 'Student name',
    type: 'text',
    required: true,
    minLength: 2,
    maxLength: 80,
  },
  {
    name: 'activityType',
    label: 'Activity type',
    type: 'text',
    required: true,
    minLength: 2,
    maxLength: 60,
  },
  {
    name: 'durationMinutes',
    label: 'Duration in minutes',
    type: 'number',
    required: true,
    minValue: 1,
    maxValue: 1440,
  },
  {
    name: 'performedAt',
    label: 'Performed on',
    type: 'date',
    required: true,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'text',
    required: false,
    maxLength: 280,
  },
];

const activityContract = {
  endpoint: '/api/activities/',
  successStatus: 201,
  fields: activityFields,
};

const activities = [];
let nextActivityId = 1;

function resetActivities() {
  activities.length = 0;
  nextActivityId = 1;
}

function sanitizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function addError(errors, fieldName, message) {
  if (!errors[fieldName]) {
    errors[fieldName] = [];
  }

  errors[fieldName].push(message);
}

function validateActivityInput(payload) {
  const errors = {};
  const sanitized = {
    studentRole: 'student',
  };

  for (const field of activityFields) {
    const rawValue = payload[field.name];

    if (field.type === 'number') {
      sanitized[field.name] = rawValue === '' || rawValue === null || rawValue === undefined
        ? Number.NaN
        : Number(rawValue);
    } else {
      sanitized[field.name] = sanitizeText(rawValue);
    }

    if (field.required) {
      const isEmpty = field.type === 'number'
        ? Number.isNaN(sanitized[field.name])
        : sanitized[field.name].length === 0;

      if (isEmpty) {
        addError(errors, field.name, `${field.label} is required.`);
        continue;
      }
    }

    if (field.type === 'text' && sanitized[field.name].length > 0) {
      if (field.minLength && sanitized[field.name].length < field.minLength) {
        addError(errors, field.name, `${field.label} must be at least ${field.minLength} characters.`);
      }

      if (field.maxLength && sanitized[field.name].length > field.maxLength) {
        addError(errors, field.name, `${field.label} must be at most ${field.maxLength} characters.`);
      }
    }

    if (field.type === 'number' && !Number.isNaN(sanitized[field.name])) {
      if (!Number.isInteger(sanitized[field.name])) {
        addError(errors, field.name, `${field.label} must be a whole number.`);
      }

      if (field.minValue && sanitized[field.name] < field.minValue) {
        addError(errors, field.name, `${field.label} must be at least ${field.minValue}.`);
      }

      if (field.maxValue && sanitized[field.name] > field.maxValue) {
        addError(errors, field.name, `${field.label} must be at most ${field.maxValue}.`);
      }
    }
  }

  if (sanitized.performedAt) {
    const performedAtDate = new Date(sanitized.performedAt);
    if (Number.isNaN(performedAtDate.getTime())) {
      addError(errors, 'performedAt', 'Performed on must be a valid date.');
    } else {
      sanitized.performedAt = performedAtDate.toISOString().slice(0, 10);
    }
  }

  return {
    errors,
    sanitized,
    isValid: Object.keys(errors).length === 0,
  };
}

function listActivities() {
  return activities.map((activity) => ({ ...activity }));
}

function listLeaderboard() {
  const leaderboardByStudent = new Map();

  for (const activity of activities) {
    const existingEntry = leaderboardByStudent.get(activity.studentName);

    if (existingEntry) {
      existingEntry.totalDurationMinutes += activity.durationMinutes;
      existingEntry.activityCount += 1;

      if (activity.performedAt > existingEntry.lastPerformedAt) {
        existingEntry.lastPerformedAt = activity.performedAt;
      }

      continue;
    }

    leaderboardByStudent.set(activity.studentName, {
      studentName: activity.studentName,
      totalDurationMinutes: activity.durationMinutes,
      activityCount: 1,
      lastPerformedAt: activity.performedAt,
    });
  }

  return Array.from(leaderboardByStudent.values())
    .sort((left, right) => {
      if (right.totalDurationMinutes !== left.totalDurationMinutes) {
        return right.totalDurationMinutes - left.totalDurationMinutes;
      }

      if (right.activityCount !== left.activityCount) {
        return right.activityCount - left.activityCount;
      }

      if (right.lastPerformedAt !== left.lastPerformedAt) {
        return right.lastPerformedAt.localeCompare(left.lastPerformedAt);
      }

      return left.studentName.localeCompare(right.studentName);
    })
    .map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));
}

function logActivity(payload) {
  const { errors, sanitized, isValid } = validateActivityInput(payload);

  if (!isValid) {
    return {
      statusCode: 400,
      body: {
        status: 'error',
        errors,
      },
    };
  }

  const activity = {
    id: nextActivityId,
    studentRole: sanitized.studentRole,
    studentName: sanitized.studentName,
    activityType: sanitized.activityType,
    durationMinutes: sanitized.durationMinutes,
    performedAt: sanitized.performedAt,
    notes: sanitized.notes,
    createdAt: new Date().toISOString(),
  };

  nextActivityId += 1;
  activities.unshift(activity);

  return {
    statusCode: activityContract.successStatus,
    body: {
      status: 'success',
      activity,
    },
  };
}

module.exports = {
  activityContract,
  listActivities,
  listLeaderboard,
  logActivity,
  resetActivities,
  validateActivityInput,
};