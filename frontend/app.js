const formElement = document.getElementById('registration-form');
const statusElement = document.getElementById('status');

async function loadContract() {
  const response = await fetch('/api/users/register/contract');
  if (!response.ok) {
    throw new Error('Unable to load the registration contract.');
  }

  return response.json();
}

function renderField(field) {
  const wrapper = document.createElement('div');
  wrapper.className = field.type === 'checkbox' ? 'field checkbox' : 'field';

  const input = document.createElement('input');
  input.name = field.name;
  input.id = field.name;
  input.type = field.type === 'checkbox' ? 'checkbox' : field.type;
  input.required = Boolean(field.required);

  if (field.minLength) {
    input.minLength = field.minLength;
  }

  if (field.maxLength) {
    input.maxLength = field.maxLength;
  }

  const label = document.createElement('label');
  label.htmlFor = field.name;
  label.textContent = field.label;

  const error = document.createElement('div');
  error.className = 'field-error';
  error.id = `${field.name}-error`;

  if (field.type === 'checkbox') {
    wrapper.append(input, label, error);
  } else {
    wrapper.append(label, input, error);
  }

  return wrapper;
}

function setStatus(message, kind = '') {
  statusElement.className = kind ? `status ${kind}` : 'status';
  statusElement.textContent = message;
}

function clearFieldErrors(fields) {
  for (const field of fields) {
    const errorElement = document.getElementById(`${field.name}-error`);
    if (errorElement) {
      errorElement.textContent = '';
    }
  }
}

function showFieldErrors(errors) {
  for (const [fieldName, messages] of Object.entries(errors)) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (errorElement) {
      errorElement.textContent = messages.join(' ');
    }
  }
}

function collectPayload(fields) {
  return fields.reduce((payload, field) => {
    const input = document.getElementById(field.name);
    payload[field.name] = field.type === 'checkbox' ? input.checked : input.value;
    return payload;
  }, {});
}

async function handleSubmit(event, contract) {
  event.preventDefault();
  const submitButton = formElement.querySelector('button[type="submit"]');

  clearFieldErrors(contract.fields);
  setStatus('Submitting registration...');
  submitButton.disabled = true;

  try {
    const response = await fetch(contract.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(collectPayload(contract.fields)),
    });

    const body = await response.json();
    if (!response.ok) {
      setStatus('Please fix the highlighted fields and resubmit.', 'error');
      showFieldErrors(body.errors || {});
      return;
    }

    formElement.reset();
    setStatus(`Registration complete for ${body.account.email}.`, 'success');
  } catch (error) {
    setStatus(error.message || 'Registration failed.', 'error');
  } finally {
    submitButton.disabled = false;
  }
}

async function init() {
  try {
    const contract = await loadContract();
    setStatus('Starter contract loaded.');

    contract.fields.forEach((field) => {
      formElement.append(renderField(field));
    });

    const submitRow = document.createElement('div');
    submitRow.className = 'submit-row';

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Create account';

    submitRow.append(submitButton);
    formElement.append(submitRow);

    formElement.addEventListener('submit', (event) => handleSubmit(event, contract));
  } catch (error) {
    setStatus(error.message || 'Unable to initialize the registration form.', 'error');
  }
}

init();