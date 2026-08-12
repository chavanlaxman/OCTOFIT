const nutritionRepository = require('./nutritionRepository');

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
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

function parseOptionalNonNegativeNumber(rawValue, fieldName, label, errors) {
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return undefined;
  }

  const value = Number(rawValue);
  if (Number.isNaN(value)) {
    addError(errors, fieldName, `${label} must be a number.`);
    return undefined;
  }

  if (value < 0) {
    addError(errors, fieldName, `${label} must be zero or greater.`);
    return undefined;
  }

  return value;
}

function validateNutritionInput(payload) {
  const errors = {};
  const userIdRaw = payload.userId;
  const userId = userIdRaw === undefined || userIdRaw === null
    ? ''
    : String(userIdRaw).trim();
  const date = sanitizeText(payload.date);
  const mealType = sanitizeText(payload.mealType);
  const description = sanitizeText(payload.description);

  if (!userId) {
    addError(errors, 'userId', 'User id is required.');
  }

  if (!date) {
    addError(errors, 'date', 'Date is required.');
  } else if (!DATE_PATTERN.test(date) || Number.isNaN(new Date(date).getTime())) {
    addError(errors, 'date', 'Date must be a valid YYYY-MM-DD value.');
  }

  if (!mealType) {
    addError(errors, 'mealType', 'Meal type is required.');
  } else if (!MEAL_TYPES.includes(mealType)) {
    addError(errors, 'mealType', 'Meal type must be Breakfast, Lunch, Dinner, or Snack.');
  }

  if (!description) {
    addError(errors, 'description', 'Description is required.');
  }

  const calories = parseOptionalNonNegativeNumber(payload.calories, 'calories', 'Calories', errors);
  const protein = parseOptionalNonNegativeNumber(payload.protein, 'protein', 'Protein', errors);
  const carbs = parseOptionalNonNegativeNumber(payload.carbs, 'carbs', 'Carbs', errors);
  const fat = parseOptionalNonNegativeNumber(payload.fat, 'fat', 'Fat', errors);

  const sanitized = {
    userId,
    date,
    mealType,
    description,
  };

  if (calories !== undefined) {
    sanitized.calories = calories;
  }

  if (protein !== undefined) {
    sanitized.protein = protein;
  }

  if (carbs !== undefined) {
    sanitized.carbs = carbs;
  }

  if (fat !== undefined) {
    sanitized.fat = fat;
  }

  return {
    errors,
    sanitized,
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

function mapNutrition(entry) {
  return {
    id: entry.id,
    userId: entry.userId,
    date: entry.date,
    mealType: entry.mealType,
    description: entry.description,
    calories: entry.calories,
    protein: entry.protein,
    carbs: entry.carbs,
    fat: entry.fat,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

async function createNutrition(payload) {
  const { errors, sanitized, isValid } = validateNutritionInput(payload || {});
  if (!isValid) {
    return {
      statusCode: 400,
      body: {
        status: 'error',
        errors,
      },
    };
  }

  const nutrition = await nutritionRepository.create(sanitized);
  return {
    statusCode: 201,
    body: {
      status: 'success',
      nutrition: mapNutrition(nutrition),
    },
  };
}

async function updateNutrition(id, payload) {
  const existing = await nutritionRepository.getById(id);
  if (!existing) {
    return {
      statusCode: 404,
      body: {
        status: 'error',
        errors: {
          id: ['No nutrition entry exists for the requested id.'],
        },
      },
    };
  }

  const { errors, sanitized, isValid } = validateNutritionInput(payload || {});
  if (!isValid) {
    return {
      statusCode: 400,
      body: {
        status: 'error',
        errors,
      },
    };
  }

  const nutrition = await nutritionRepository.update(id, sanitized);
  return {
    statusCode: 200,
    body: {
      status: 'success',
      nutrition: mapNutrition(nutrition),
    },
  };
}

async function deleteNutrition(id) {
  const deleted = await nutritionRepository.remove(id);
  if (!deleted) {
    return {
      statusCode: 404,
      body: {
        status: 'error',
        errors: {
          id: ['No nutrition entry exists for the requested id.'],
        },
      },
    };
  }

  return {
    statusCode: 204,
  };
}

async function listNutrition(query) {
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

  const nutritionEntries = await nutritionRepository.listByUserAndDate(
    sanitized.userId,
    sanitized.date,
  );

  return {
    statusCode: 200,
    body: {
      status: 'success',
      nutritionEntries: nutritionEntries.map(mapNutrition),
    },
  };
}

module.exports = {
  MEAL_TYPES,
  createNutrition,
  updateNutrition,
  deleteNutrition,
  listNutrition,
  validateNutritionInput,
  resetNutrition: nutritionRepository.resetNutrition,
};
