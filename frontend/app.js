const formElement = document.getElementById('activity-form');
const statusElement = document.getElementById('status');
const activityFeedList = document.getElementById('activity-feed-list');
const activityFeedEmpty = document.getElementById('activity-feed-empty');

async function loadContract() {
  const response = await fetch('/api/activities/contract');
  if (!response.ok) {
    throw new Error('Unable to load the activity contract.');
  }

  return response.json();
}

async function loadActivities() {
  const response = await fetch('/api/activities/');
  if (!response.ok) {
    throw new Error('Unable to load recent activities.');
  }

  const body = await response.json();
  return body.activities || [];
}

function renderField(field) {
  const wrapper = document.createElement('div');
  wrapper.className = 'field';

  const input = document.createElement('input');
  input.name = field.name;
  input.id = field.name;
  input.type = field.type;
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

  wrapper.append(label, input, error);

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
    payload[field.name] = input.value;
    return payload;
  }, {});
}

function renderActivity(activity) {
  const item = document.createElement('li');
  item.className = 'feed-item';

  const title = document.createElement('div');
  title.className = 'feed-item-title';
  title.textContent = `${activity.studentName} logged ${activity.activityType}`;

  const meta = document.createElement('div');
  meta.className = 'feed-item-meta';
  meta.textContent = `${activity.durationMinutes} min on ${activity.performedAt}`;

  item.append(title, meta);

  if (activity.notes) {
    const notes = document.createElement('p');
    notes.className = 'feed-item-notes';
    notes.textContent = activity.notes;
    item.append(notes);
  }

  return item;
}

function renderActivityFeed(activities) {
  activityFeedList.replaceChildren(...activities.map(renderActivity));
  activityFeedEmpty.hidden = activities.length > 0;
}

async function handleSubmit(event, contract) {
  event.preventDefault();
  const submitButton = formElement.querySelector('button[type="submit"]');

  clearFieldErrors(contract.fields);
  setStatus('Submitting activity...');
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

    const activities = await loadActivities();
    formElement.reset();
    renderActivityFeed(activities);
    setStatus(`Activity saved for ${body.activity.studentName}.`, 'success');
  } catch (error) {
    setStatus(error.message || 'Activity logging failed.', 'error');
  } finally {
    submitButton.disabled = false;
  }
}

async function init() {
  try {
    const [contract, activities] = await Promise.all([
      loadContract(),
      loadActivities(),
    ]);

    renderActivityFeed(activities);
    setStatus('Activity logger ready.');

    contract.fields.forEach((field) => {
      formElement.append(renderField(field));
    });

    const submitRow = document.createElement('div');
    submitRow.className = 'submit-row';

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Log activity';

    submitRow.append(submitButton);
    formElement.append(submitRow);

    formElement.addEventListener('submit', (event) => handleSubmit(event, contract));
  } catch (error) {
    setStatus(error.message || 'Unable to initialize the activity form.', 'error');
  }
}

init();