const { registrationContract } = require('./registrationContract');

const accountsByEmail = new Map();
const accountsById = new Map();
let nextAccountId = 1;

function resetAccounts() {
  accountsByEmail.clear();
  accountsById.clear();
  nextAccountId = 1;
}

function mapAccount(account) {
  const mappedAccount = {
    id: account.id,
    firstName: account.firstName,
    lastName: account.lastName,
    email: account.email,
    role: account.role,
  };

  if (account.teamId != null) {
    mappedAccount.teamId = account.teamId;
    mappedAccount.teamName = account.teamName;
  }

  return mappedAccount;
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

function validateRegistrationInput(payload) {
  const errors = {};
  const sanitized = {};

  for (const field of registrationContract.fields) {
    const rawValue = payload[field.name];

    if (field.type === 'checkbox') {
      sanitized[field.name] = rawValue === true;
    } else {
      sanitized[field.name] = sanitizeText(rawValue);
    }

    if (field.required) {
      const isEmpty = field.type === 'checkbox'
        ? sanitized[field.name] !== true
        : sanitized[field.name].length === 0;

      if (isEmpty) {
        addError(errors, field.name, `${field.label} is required.`);
        continue;
      }
    }

    if (field.type !== 'checkbox' && sanitized[field.name].length > 0) {
      if (field.minLength && sanitized[field.name].length < field.minLength) {
        addError(errors, field.name, `${field.label} must be at least ${field.minLength} characters.`);
      }

      if (field.maxLength && sanitized[field.name].length > field.maxLength) {
        addError(errors, field.name, `${field.label} must be at most ${field.maxLength} characters.`);
      }
    }
  }

  if (sanitized.email) {
    const normalizedEmail = sanitized.email.toLowerCase();
    sanitized.email = normalizedEmail;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalizedEmail)) {
      addError(errors, 'email', 'Email address must be valid.');
    }
  }

  if (sanitized.password) {
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (!passwordPattern.test(sanitized.password)) {
      addError(errors, 'password', 'Password must include at least one letter and one number.');
    }
  }

  return {
    errors,
    sanitized,
    isValid: Object.keys(errors).length === 0,
  };
}

function registerStudent(payload) {
  const { errors, sanitized, isValid } = validateRegistrationInput(payload);
  if (!isValid) {
    return {
      statusCode: 400,
      body: {
        status: 'error',
        errors,
      },
    };
  }

  if (accountsByEmail.has(sanitized.email)) {
    return {
      statusCode: 409,
      body: {
        status: 'error',
        errors: {
          email: ['An account already exists for this email address.'],
        },
      },
    };
  }

  const account = {
    id: nextAccountId,
    role: 'student',
    firstName: sanitized.firstName,
    lastName: sanitized.lastName,
    email: sanitized.email,
    consentAccepted: sanitized.consentAccepted,
    teamId: null,
    teamName: '',
    createdAt: new Date().toISOString(),
  };

  nextAccountId += 1;
  accountsByEmail.set(account.email, account);
  accountsById.set(account.id, account);

  return {
    statusCode: registrationContract.successStatus,
    body: {
      status: 'success',
      account: mapAccount(account),
      postRegistration: {
        action: registrationContract.postRegistrationAction,
        autoLogin: false,
      },
    },
  };
}

function getAccountById(accountId) {
  return accountsById.get(accountId) || null;
}

function assignAccountToTeam(accountId, team) {
  const account = getAccountById(accountId);
  if (!account) {
    return null;
  }

  account.teamId = team.id;
  account.teamName = team.name;
  return mapAccount(account);
}

function listAccounts() {
  return Array.from(accountsByEmail.values(), (account) => ({
    ...mapAccount(account),
    createdAt: account.createdAt,
  }));
}

module.exports = {
  assignAccountToTeam,
  getAccountById,
  listAccounts,
  registerStudent,
  resetAccounts,
  validateRegistrationInput,
};
