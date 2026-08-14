const formElement = document.getElementById('activity-form');
const statusElement = document.getElementById('status');
const heroEyebrowElement = document.getElementById('hero-eyebrow');
const heroTitleElement = document.getElementById('hero-title');
const heroSubtitleElement = document.getElementById('hero-subtitle');
const dashboardCardsElement = document.getElementById('dashboard-cards');
const usersListElement = document.getElementById('users-list');
const usersEmptyElement = document.getElementById('users-empty');
const teamsListElement = document.getElementById('teams-list');
const teamsEmptyElement = document.getElementById('teams-empty');
const challengesListElement = document.getElementById('challenges-list');
const challengesEmptyElement = document.getElementById('challenges-empty');
const leaderboardList = document.getElementById('leaderboard-list');
const leaderboardEmpty = document.getElementById('leaderboard-empty');
const activityFeedList = document.getElementById('activity-feed-list');
const activityFeedEmpty = document.getElementById('activity-feed-empty');
const recommendationsList = document.getElementById('recommendations-list');

const bootstrapView = document.getElementById('bootstrap-view');
const nutritionRoutineView = document.getElementById('nutrition-routine-view');
const dailyTrackerView = document.getElementById('daily-tracker-view');
const navHomeButton = document.getElementById('nav-home');
const navNutritionRoutineButton = document.getElementById('nav-nutrition-routine');
const navDailyTrackerButton = document.getElementById('nav-daily-tracker');
const nutritionRoutineStatus = document.getElementById('nutrition-routine-status');
const nutritionRoutineDate = document.getElementById('nutrition-routine-date');
const nutritionRoutineUserId = document.getElementById('nutrition-routine-user-id');
const nutritionForm = document.getElementById('nutrition-form');
const routineForm = document.getElementById('routine-form');
const nutritionEditId = document.getElementById('nutrition-edit-id');
const routineEditId = document.getElementById('routine-edit-id');
const nutritionCancelEdit = document.getElementById('nutrition-cancel-edit');
const routineCancelEdit = document.getElementById('routine-cancel-edit');
const nutritionDailyList = document.getElementById('nutrition-daily-list');
const nutritionDailyEmpty = document.getElementById('nutrition-daily-empty');
const routineDailyList = document.getElementById('routine-daily-list');
const routineDailyEmpty = document.getElementById('routine-daily-empty');

const dailyTrackerStatus = document.getElementById('daily-tracker-status');
const dailyTrackerDate = document.getElementById('daily-tracker-date');
const dailyTrackerUserId = document.getElementById('daily-tracker-user-id');
const dailyEntryForm = document.getElementById('daily-entry-form');
const dailyEntryEditId = document.getElementById('daily-entry-edit-id');
const dailyEntryList = document.getElementById('daily-entry-list');
const dailyEntryEmpty = document.getElementById('daily-entry-empty');
const dailyEntryActivityPicker = document.getElementById('daily-entry-activity-picker');
const dailyEntryLogActivity = document.getElementById('daily-entry-log-activity');

const NUTRITION_FIELD_NAMES = ['mealType', 'description', 'calories', 'protein', 'carbs', 'fat'];
const ROUTINE_FIELD_NAMES = ['sleepHours', 'waterIntake', 'steps'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const DAILY_ENTRY_FIELD_NAMES = ['notes', 'mood', 'energy', 'completed', 'activityIds', 'userId', 'date'];
const MOODS = ['great', 'good', 'okay', 'low'];

let liveActivities = [];
let dailyEntriesCache = [];

function getApiBaseUrl() {
  if (window.OCTOFIT_API_BASE_URL) {
    return String(window.OCTOFIT_API_BASE_URL).replace(/\/$/, '');
  }

  const metaElement = document.querySelector('meta[name="octofit-api-base-url"]');
  const metaValue = metaElement ? metaElement.content.trim() : '';
  return metaValue.replace(/\/$/, '');
}

function buildApiUrl(path) {
  return `${getApiBaseUrl()}${path}`;
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

function lastNLocalDates(count) {
  const dates = new Set();
  const today = todayIsoDate();
  for (let offset = 0; offset < count; offset += 1) {
    dates.add(addCalendarDays(today, -offset));
  }
  return dates;
}

async function loadContract() {
  const response = await fetch(buildApiUrl('/api/activities/contract'));
  if (!response.ok) {
    throw new Error('Unable to load the activity contract.');
  }

  return response.json();
}

async function loadBootstrap() {
  const response = await fetch(buildApiUrl('/api/bootstrap/'));
  if (!response.ok) {
    throw new Error('Unable to load the app bootstrap data.');
  }

  return response.json();
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

function setNutritionRoutineStatus(message, kind = '') {
  nutritionRoutineStatus.className = kind ? `status ${kind}` : 'status';
  nutritionRoutineStatus.textContent = message;
}

function setDailyTrackerStatus(message, kind = '') {
  dailyTrackerStatus.className = kind ? `status ${kind}` : 'status';
  dailyTrackerStatus.textContent = message;
}

function clearFieldErrors(fields) {
  for (const field of fields) {
    const fieldName = typeof field === 'string' ? field : field.name;
    const errorElement = document.getElementById(`${fieldName}-error`);
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

function renderHero(hero) {
  heroEyebrowElement.textContent = hero.eyebrow;
  heroTitleElement.textContent = hero.title;
  heroSubtitleElement.textContent = hero.subtitle;
}

function renderDashboardCard(label, value) {
  const item = document.createElement('div');
  item.className = 'dashboard-card';

  const valueElement = document.createElement('div');
  valueElement.className = 'dashboard-value';
  valueElement.textContent = String(value);

  const labelElement = document.createElement('div');
  labelElement.className = 'dashboard-label';
  labelElement.textContent = label;

  item.append(valueElement, labelElement);
  return item;
}

function renderDashboard(dashboard) {
  dashboardCardsElement.replaceChildren(
    renderDashboardCard('Users', dashboard.totalUsers),
    renderDashboardCard('Teams', dashboard.totalTeams),
    renderDashboardCard('Activities', dashboard.totalActivities),
    renderDashboardCard('Active challenges', dashboard.activeChallenges),
  );
}

function renderUser(user) {
  const item = document.createElement('li');
  item.className = 'feed-item';

  const title = document.createElement('div');
  title.className = 'feed-item-title';
  title.textContent = `${user.firstName} ${user.lastName}`;

  const meta = document.createElement('div');
  meta.className = 'feed-item-meta';
  meta.textContent = user.role;

  item.append(title, meta);
  return item;
}

function renderUsers(users) {
  usersListElement.replaceChildren(...users.map(renderUser));
  usersEmptyElement.hidden = users.length > 0;
}

function renderTeam(team) {
  const item = document.createElement('li');
  item.className = 'feed-item';

  const title = document.createElement('div');
  title.className = 'feed-item-title';
  title.textContent = team.name;

  const meta = document.createElement('div');
  meta.className = 'feed-item-meta';
  meta.textContent = `${team.memberCount} members`;

  const detail = document.createElement('p');
  detail.className = 'feed-item-notes';
  detail.textContent = team.focus;

  item.append(title, meta, detail);
  return item;
}

function renderTeams(teams) {
  teamsListElement.replaceChildren(...teams.map(renderTeam));
  teamsEmptyElement.hidden = teams.length > 0;
}

function renderChallenge(challenge) {
  const item = document.createElement('li');
  item.className = 'feed-item';

  const title = document.createElement('div');
  title.className = 'feed-item-title';
  title.textContent = challenge.title;

  const meta = document.createElement('div');
  meta.className = 'feed-item-meta';
  meta.textContent = `${challenge.status} · ${challenge.target}`;

  item.append(title, meta);
  return item;
}

function renderChallenges(challenges) {
  challengesListElement.replaceChildren(...challenges.map(renderChallenge));
  challengesEmptyElement.hidden = challenges.length > 0;
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
  liveActivities = Array.isArray(activities) ? activities.slice() : [];
  activityFeedList.replaceChildren(...liveActivities.map(renderActivity));
  activityFeedEmpty.hidden = liveActivities.length > 0;
  renderActivityPicker(getSelectedDailyActivityIds());
}

function renderLeaderboardEntry(entry) {
  const item = document.createElement('li');
  item.className = 'leaderboard-item';

  const rank = document.createElement('div');
  rank.className = 'leaderboard-rank';
  rank.textContent = `#${entry.rank}`;

  const summary = document.createElement('div');
  summary.className = 'leaderboard-summary';

  const title = document.createElement('div');
  title.className = 'leaderboard-name';
  title.textContent = entry.studentName;

  const meta = document.createElement('div');
  meta.className = 'leaderboard-meta';
  meta.textContent = `${entry.totalDurationMinutes} total min across ${entry.activityCount} activit${entry.activityCount === 1 ? 'y' : 'ies'} · latest ${entry.lastPerformedAt}`;

  summary.append(title, meta);
  item.append(rank, summary);

  return item;
}

function renderLeaderboard(rankings) {
  leaderboardList.replaceChildren(...rankings.map(renderLeaderboardEntry));
  leaderboardEmpty.hidden = rankings.length > 0;
}

function renderRecommendation(recommendation) {
  const item = document.createElement('li');
  item.className = 'feed-item';

  const title = document.createElement('div');
  title.className = 'feed-item-title';
  title.textContent = recommendation.title;

  const detail = document.createElement('p');
  detail.className = 'feed-item-notes';
  detail.textContent = recommendation.detail;

  item.append(title, detail);
  return item;
}

function renderRecommendations(recommendations) {
  recommendationsList.replaceChildren(...recommendations.map(renderRecommendation));
}

function seedUserIdFromBootstrap(users) {
  if (nutritionRoutineUserId.value.trim()) {
    return;
  }

  if (Array.isArray(users) && users.length > 0) {
    nutritionRoutineUserId.value = String(users[0].id);
    return;
  }

  nutritionRoutineUserId.value = '1';
}

function seedDailyTrackerUserId(users) {
  if (dailyTrackerUserId.value.trim()) {
    return;
  }

  if (Array.isArray(users) && users.length > 0) {
    dailyTrackerUserId.value = String(users[0].id);
    return;
  }

  dailyTrackerUserId.value = '1';
}

function firstPaintDailyEntries(dailyEntries, userId) {
  const windowDates = lastNLocalDates(7);
  return (Array.isArray(dailyEntries) ? dailyEntries : [])
    .filter((entry) => String(entry.userId) === String(userId) && windowDates.has(entry.date))
    .sort((left, right) => String(right.date).localeCompare(String(left.date)));
}

function renderBootstrap(bootstrap) {
  renderHero(bootstrap.hero);
  renderDashboard(bootstrap.dashboard);
  renderUsers(bootstrap.users || []);
  renderTeams(bootstrap.teams || []);
  renderChallenges(bootstrap.challenges || []);
  renderActivityFeed(bootstrap.activities || []);
  renderLeaderboard(bootstrap.leaderboard || []);
  renderRecommendations(bootstrap.recommendations || []);
  seedUserIdFromBootstrap(bootstrap.users || []);
  seedDailyTrackerUserId(bootstrap.users || []);
  renderDailyEntryList(firstPaintDailyEntries(bootstrap.dailyEntries || [], dailyTrackerUserId.value.trim()));
}

function showView(viewName) {
  const isHome = viewName === 'home';
  const isNutrition = viewName === 'nutrition-routine';
  const isDailyTracker = viewName === 'daily-tracker';

  bootstrapView.hidden = !isHome;
  nutritionRoutineView.hidden = !isNutrition;
  dailyTrackerView.hidden = !isDailyTracker;
  navHomeButton.classList.toggle('is-active', isHome);
  navNutritionRoutineButton.classList.toggle('is-active', isNutrition);
  navDailyTrackerButton.classList.toggle('is-active', isDailyTracker);
}

function getSelectedContext() {
  return {
    userId: nutritionRoutineUserId.value.trim(),
    date: nutritionRoutineDate.value,
  };
}

function validateContext() {
  const errors = {};
  const { userId, date } = getSelectedContext();
  const userError = document.getElementById('nutrition-routine-user-id-error');

  if (!userId) {
    errors.userId = ['User id is required.'];
  }

  if (!date) {
    errors.date = ['Date is required.'];
  }

  if (userError) {
    userError.textContent = errors.userId ? errors.userId.join(' ') : '';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    userId,
    date,
    errors,
  };
}

function validateNutritionClient(payload) {
  const errors = {};
  const mealType = String(payload.mealType || '').trim();
  const description = String(payload.description || '').trim();

  if (!mealType) {
    errors.mealType = ['Meal type is required.'];
  } else if (!MEAL_TYPES.includes(mealType)) {
    errors.mealType = ['Meal type must be Breakfast, Lunch, Dinner, or Snack.'];
  }

  if (!description) {
    errors.description = ['Description is required.'];
  }

  for (const fieldName of ['calories', 'protein', 'carbs', 'fat']) {
    const raw = payload[fieldName];
    if (raw === undefined || raw === null || raw === '') {
      continue;
    }

    const value = Number(raw);
    if (Number.isNaN(value)) {
      errors[fieldName] = [`${fieldName} must be a number.`];
    } else if (value < 0) {
      errors[fieldName] = [`${fieldName} must be zero or greater.`];
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      mealType,
      description,
      calories: payload.calories === '' ? undefined : payload.calories,
      protein: payload.protein === '' ? undefined : payload.protein,
      carbs: payload.carbs === '' ? undefined : payload.carbs,
      fat: payload.fat === '' ? undefined : payload.fat,
    },
  };
}

function validateRoutineClient(payload) {
  const errors = {};
  const sleepHours = Number(payload.sleepHours);
  const waterIntake = Number(payload.waterIntake);
  const steps = Number(payload.steps);

  if (payload.sleepHours === '' || Number.isNaN(sleepHours)) {
    errors.sleepHours = ['Sleep hours is required.'];
  } else if (sleepHours < 0 || sleepHours > 24) {
    errors.sleepHours = ['Sleep hours must be between 0 and 24.'];
  }

  if (payload.waterIntake === '' || Number.isNaN(waterIntake)) {
    errors.waterIntake = ['Water intake is required.'];
  } else if (waterIntake < 0) {
    errors.waterIntake = ['Water intake must be zero or greater.'];
  }

  if (payload.steps === '' || Number.isNaN(steps)) {
    errors.steps = ['Steps is required.'];
  } else if (!Number.isInteger(steps) || steps < 0) {
    errors.steps = ['Steps must be a whole number zero or greater.'];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      sleepHours,
      waterIntake,
      steps,
    },
  };
}

function collectNutritionFormPayload() {
  return {
    mealType: document.getElementById('mealType').value,
    description: document.getElementById('description').value,
    calories: document.getElementById('calories').value,
    protein: document.getElementById('protein').value,
    carbs: document.getElementById('carbs').value,
    fat: document.getElementById('fat').value,
  };
}

function collectRoutineFormPayload() {
  return {
    sleepHours: document.getElementById('sleepHours').value,
    waterIntake: document.getElementById('waterIntake').value,
    steps: document.getElementById('steps').value,
  };
}

function resetNutritionForm() {
  nutritionForm.reset();
  nutritionEditId.value = '';
  nutritionCancelEdit.hidden = true;
  document.getElementById('nutrition-submit').textContent = 'Save nutrition';
  clearFieldErrors(NUTRITION_FIELD_NAMES);
}

function resetRoutineForm() {
  routineForm.reset();
  routineEditId.value = '';
  routineCancelEdit.hidden = true;
  document.getElementById('routine-submit').textContent = 'Save routine';
  clearFieldErrors(ROUTINE_FIELD_NAMES);
}

function fillNutritionForm(entry) {
  nutritionEditId.value = String(entry.id);
  document.getElementById('mealType').value = entry.mealType || '';
  document.getElementById('description').value = entry.description || '';
  document.getElementById('calories').value = entry.calories ?? '';
  document.getElementById('protein').value = entry.protein ?? '';
  document.getElementById('carbs').value = entry.carbs ?? '';
  document.getElementById('fat').value = entry.fat ?? '';
  nutritionCancelEdit.hidden = false;
  document.getElementById('nutrition-submit').textContent = 'Update nutrition';
}

function fillRoutineForm(entry) {
  routineEditId.value = String(entry.id);
  document.getElementById('sleepHours').value = entry.sleepHours ?? '';
  document.getElementById('waterIntake').value = entry.waterIntake ?? '';
  document.getElementById('steps').value = entry.steps ?? '';
  routineCancelEdit.hidden = false;
  document.getElementById('routine-submit').textContent = 'Update routine';
}

async function fetchNutritionEntries(userId, date) {
  const response = await fetch(
    buildApiUrl(`/api/nutrition/?userId=${encodeURIComponent(userId)}&date=${encodeURIComponent(date)}`),
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body.errors
      ? Object.values(body.errors).flat().join(' ')
      : 'Unable to load nutrition entries.';
    throw new Error(message);
  }

  return body.nutritionEntries || [];
}

async function fetchRoutineEntries(userId, date) {
  const response = await fetch(
    buildApiUrl(`/api/routine/?userId=${encodeURIComponent(userId)}&date=${encodeURIComponent(date)}`),
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body.errors
      ? Object.values(body.errors).flat().join(' ')
      : 'Unable to load routine entries.';
    throw new Error(message);
  }

  return body.routines || [];
}

function renderNutritionEntry(entry) {
  const item = document.createElement('li');
  item.className = 'feed-item';
  item.dataset.nutritionId = String(entry.id);

  const title = document.createElement('div');
  title.className = 'feed-item-title';
  title.textContent = `${entry.mealType}: ${entry.description}`;

  const meta = document.createElement('div');
  meta.className = 'feed-item-meta';
  const macros = [
    entry.calories != null ? `${entry.calories} cal` : null,
    entry.protein != null ? `P ${entry.protein}` : null,
    entry.carbs != null ? `C ${entry.carbs}` : null,
    entry.fat != null ? `F ${entry.fat}` : null,
  ].filter(Boolean);
  meta.textContent = macros.length > 0 ? macros.join(' · ') : 'No macros provided';

  const actions = document.createElement('div');
  actions.className = 'row-actions';

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'secondary-button';
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => {
    fillNutritionForm(entry);
    setNutritionRoutineStatus(`Editing nutrition #${entry.id}.`, '');
  });

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'danger-button';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', async () => {
    if (!window.confirm('Delete this nutrition entry?')) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/api/nutrition/${entry.id}`), {
        method: 'DELETE',
      });
      if (!response.ok && response.status !== 204) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.errors ? Object.values(body.errors).flat().join(' ') : 'Delete failed.');
      }

      setNutritionRoutineStatus('Nutrition entry deleted.', 'success');
      await reloadDailyLists();
    } catch (error) {
      setNutritionRoutineStatus(error.message || 'Unable to delete nutrition entry.', 'error');
    }
  });

  actions.append(editButton, deleteButton);
  item.append(title, meta, actions);
  return item;
}

function renderRoutineEntry(entry) {
  const item = document.createElement('li');
  item.className = 'feed-item';
  item.dataset.routineId = String(entry.id);

  const title = document.createElement('div');
  title.className = 'feed-item-title';
  title.textContent = `${entry.sleepHours}h sleep · ${entry.waterIntake} ml · ${entry.steps} steps`;

  const meta = document.createElement('div');
  meta.className = 'feed-item-meta';
  meta.textContent = `User ${entry.userId} on ${entry.date}`;

  const actions = document.createElement('div');
  actions.className = 'row-actions';

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'secondary-button';
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => {
    fillRoutineForm(entry);
    setNutritionRoutineStatus(`Editing routine #${entry.id}.`, '');
  });

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'danger-button';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', async () => {
    if (!window.confirm('Delete this routine entry?')) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/api/routine/${entry.id}`), {
        method: 'DELETE',
      });
      if (!response.ok && response.status !== 204) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.errors ? Object.values(body.errors).flat().join(' ') : 'Delete failed.');
      }

      setNutritionRoutineStatus('Routine entry deleted.', 'success');
      await reloadDailyLists();
    } catch (error) {
      setNutritionRoutineStatus(error.message || 'Unable to delete routine entry.', 'error');
    }
  });

  actions.append(editButton, deleteButton);
  item.append(title, meta, actions);
  return item;
}

function renderNutritionList(entries) {
  nutritionDailyList.replaceChildren(...entries.map(renderNutritionEntry));
  nutritionDailyEmpty.hidden = entries.length > 0;
}

function renderRoutineList(entries) {
  routineDailyList.replaceChildren(...entries.map(renderRoutineEntry));
  routineDailyEmpty.hidden = entries.length > 0;
}

async function reloadDailyLists() {
  const context = validateContext();
  if (!context.isValid) {
    renderNutritionList([]);
    renderRoutineList([]);
    setNutritionRoutineStatus('Select a user id and date to load daily entries.', 'error');
    return;
  }

  try {
    const [nutritionEntries, routines] = await Promise.all([
      fetchNutritionEntries(context.userId, context.date),
      fetchRoutineEntries(context.userId, context.date),
    ]);
    renderNutritionList(nutritionEntries);
    renderRoutineList(routines);
  } catch (error) {
    setNutritionRoutineStatus(error.message || 'Unable to load daily lists.', 'error');
  }
}

async function handleNutritionSubmit(event) {
  event.preventDefault();
  clearFieldErrors(NUTRITION_FIELD_NAMES);

  const context = validateContext();
  if (!context.isValid) {
    setNutritionRoutineStatus('User id and date are required.', 'error');
    return;
  }

  const clientValidation = validateNutritionClient(collectNutritionFormPayload());
  if (!clientValidation.isValid) {
    showFieldErrors(clientValidation.errors);
    setNutritionRoutineStatus('Please fix the highlighted nutrition fields.', 'error');
    return;
  }

  const editId = nutritionEditId.value.trim();
  const payload = {
    userId: context.userId,
    date: context.date,
    ...clientValidation.sanitized,
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  const submitButton = document.getElementById('nutrition-submit');
  submitButton.disabled = true;
  setNutritionRoutineStatus(editId ? 'Updating nutrition...' : 'Saving nutrition...');

  try {
    const response = await fetch(
      buildApiUrl(editId ? `/api/nutrition/${editId}` : '/api/nutrition/'),
      {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      showFieldErrors(body.errors || {});
      setNutritionRoutineStatus('Please fix the highlighted nutrition fields.', 'error');
      return;
    }

    resetNutritionForm();
    setNutritionRoutineStatus(
      editId ? 'Nutrition entry updated.' : `Nutrition saved: ${body.nutrition.description}`,
      'success',
    );
    await reloadDailyLists();
  } catch (error) {
    setNutritionRoutineStatus(error.message || 'Nutrition save failed.', 'error');
  } finally {
    submitButton.disabled = false;
  }
}

async function handleRoutineSubmit(event) {
  event.preventDefault();
  clearFieldErrors(ROUTINE_FIELD_NAMES);

  const context = validateContext();
  if (!context.isValid) {
    setNutritionRoutineStatus('User id and date are required.', 'error');
    return;
  }

  const clientValidation = validateRoutineClient(collectRoutineFormPayload());
  if (!clientValidation.isValid) {
    showFieldErrors(clientValidation.errors);
    setNutritionRoutineStatus('Please fix the highlighted routine fields.', 'error');
    return;
  }

  const editId = routineEditId.value.trim();
  const payload = {
    userId: context.userId,
    date: context.date,
    ...clientValidation.sanitized,
  };

  const submitButton = document.getElementById('routine-submit');
  submitButton.disabled = true;
  setNutritionRoutineStatus(editId ? 'Updating routine...' : 'Saving routine...');

  try {
    const response = await fetch(
      buildApiUrl(editId ? `/api/routine/${editId}` : '/api/routine/'),
      {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      showFieldErrors(body.errors || {});
      setNutritionRoutineStatus('Please fix the highlighted routine fields.', 'error');
      return;
    }

    resetRoutineForm();
    setNutritionRoutineStatus(
      editId ? 'Routine entry updated.' : `Routine saved with ${body.routine.steps} steps.`,
      'success',
    );
    await reloadDailyLists();
  } catch (error) {
    setNutritionRoutineStatus(error.message || 'Routine save failed.', 'error');
  } finally {
    submitButton.disabled = false;
  }
}

async function handleSubmit(event, contract) {
  event.preventDefault();
  const submitButton = formElement.querySelector('button[type="submit"]');

  clearFieldErrors(contract.fields);
  setStatus('Submitting activity...');
  submitButton.disabled = true;

  try {
    const response = await fetch(buildApiUrl(contract.endpoint), {
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

    const bootstrap = await loadBootstrap();
    formElement.reset();
    renderBootstrap(bootstrap);
    setStatus(`Activity saved for ${body.activity.studentName}. Leaderboard updated.`, 'success');
  } catch (error) {
    setStatus(error.message || 'Activity logging failed.', 'error');
  } finally {
    submitButton.disabled = false;
  }
}

function setDailyTrackerFieldError(fieldName, messages) {
  const errorIds = {
    userId: 'daily-tracker-user-id-error',
    date: 'daily-tracker-date-error',
    notes: 'daily-entry-notes-error',
    mood: 'daily-entry-mood-error',
    energy: 'daily-entry-energy-error',
    completed: 'daily-entry-completed-error',
    activityIds: 'daily-entry-activityIds-error',
  };
  const errorElement = document.getElementById(errorIds[fieldName] || `${fieldName}-error`);
  if (errorElement) {
    errorElement.textContent = Array.isArray(messages) ? messages.join(' ') : '';
  }
}

function clearDailyTrackerFieldErrors() {
  for (const fieldName of DAILY_ENTRY_FIELD_NAMES) {
    setDailyTrackerFieldError(fieldName, []);
  }
}

function showDailyTrackerFieldErrors(errors) {
  for (const [fieldName, messages] of Object.entries(errors || {})) {
    setDailyTrackerFieldError(fieldName, messages);
  }
}

function getDailyTrackerContext() {
  return {
    userId: dailyTrackerUserId.value.trim(),
    date: dailyTrackerDate.value,
  };
}

function getSelectedDailyActivityIds() {
  return Array.from(dailyEntryActivityPicker.querySelectorAll('input[type="checkbox"]:checked'))
    .map((input) => Number(input.value))
    .filter((id) => Number.isInteger(id));
}

function renderActivityPicker(selectedIds = []) {
  const liveIdSet = new Set(liveActivities.map((activity) => Number(activity.id)));
  const knownSelected = new Set(
    selectedIds.map(Number).filter((id) => liveIdSet.has(id)),
  );

  if (liveActivities.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'activity-picker-empty';
    empty.textContent = 'No live activities yet. Use Log activity on Home to add one.';
    dailyEntryActivityPicker.replaceChildren(empty);
    return;
  }

  const options = liveActivities.map((activity) => {
    const wrapper = document.createElement('label');
    wrapper.className = 'activity-picker-option';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = String(activity.id);
    checkbox.checked = knownSelected.has(Number(activity.id));

    const text = document.createElement('span');
    text.textContent = `${activity.activityType} · ${activity.studentName} (#${activity.id})`;

    wrapper.append(checkbox, text);
    return wrapper;
  });

  dailyEntryActivityPicker.replaceChildren(...options);
}

function collectDailyEntryFormPayload(context) {
  const notes = document.getElementById('daily-entry-notes').value.trim();
  const mood = document.getElementById('daily-entry-mood').value.trim();
  const energyRaw = document.getElementById('daily-entry-energy').value.trim();
  const payload = {
    userId: context.userId,
    date: context.date,
    notes,
    completed: document.getElementById('daily-entry-completed').checked,
    activityIds: getSelectedDailyActivityIds(),
  };

  if (mood) {
    payload.mood = mood;
  }

  if (energyRaw) {
    payload.energy = Number(energyRaw);
  }

  return payload;
}

function clearDailyEntryEdit() {
  dailyEntryEditId.value = '';
  document.getElementById('daily-entry-submit').textContent = 'Save daily entry';
}

function resetDailyEntryFormFields() {
  document.getElementById('daily-entry-notes').value = '';
  document.getElementById('daily-entry-mood').value = '';
  document.getElementById('daily-entry-energy').value = '';
  document.getElementById('daily-entry-completed').checked = false;
  renderActivityPicker([]);
  clearDailyEntryEdit();
  clearDailyTrackerFieldErrors();
}

function fillDailyEntryForm(entry) {
  dailyEntryEditId.value = String(entry.id);
  document.getElementById('daily-entry-notes').value = entry.notes || '';
  document.getElementById('daily-entry-mood').value = entry.mood || '';
  document.getElementById('daily-entry-energy').value = entry.energy != null ? String(entry.energy) : '';
  document.getElementById('daily-entry-completed').checked = Boolean(entry.completed);
  renderActivityPicker(Array.isArray(entry.activityIds) ? entry.activityIds : []);
  document.getElementById('daily-entry-submit').textContent = 'Update daily entry';
}

function findCachedDailyEntry(userId, date) {
  return dailyEntriesCache.find(
    (entry) => String(entry.userId) === String(userId) && entry.date === date,
  );
}

function previewNotes(notes) {
  const text = String(notes || '').trim();
  if (!text) {
    return 'No notes';
  }

  return text.length > 80 ? `${text.slice(0, 77)}...` : text;
}

function renderDailyEntryItem(entry) {
  const item = document.createElement('li');
  item.className = 'feed-item';
  item.dataset.dailyEntryId = String(entry.id);
  item.dataset.dailyEntryDate = entry.date;

  const title = document.createElement('div');
  title.className = 'feed-item-title';
  title.textContent = entry.date;

  const meta = document.createElement('div');
  meta.className = 'feed-item-meta';
  const moodEnergy = [
    entry.completed ? 'Completed' : 'Not completed',
    entry.mood ? `mood ${entry.mood}` : null,
    entry.energy != null ? `energy ${entry.energy}` : null,
    `${Array.isArray(entry.activityIds) ? entry.activityIds.length : 0} activities`,
  ].filter(Boolean);
  meta.textContent = moodEnergy.join(' · ');

  const notes = document.createElement('p');
  notes.className = 'feed-item-notes';
  notes.textContent = previewNotes(entry.notes);

  item.append(title, meta, notes);
  item.addEventListener('click', () => {
    dailyTrackerDate.value = entry.date;
    fillDailyEntryForm(entry);
    setDailyTrackerStatus(`Editing daily entry for ${entry.date}.`);
  });
  return item;
}

function renderDailyEntryList(entries) {
  dailyEntriesCache = Array.isArray(entries) ? entries.slice() : [];
  dailyEntryList.replaceChildren(...dailyEntriesCache.map(renderDailyEntryItem));
  dailyEntryEmpty.hidden = dailyEntriesCache.length > 0;
}

async function fetchDailyEntries(userId, options = {}) {
  const params = new URLSearchParams({ userId });
  if (options.date) {
    params.set('date', options.date);
  } else if (options.days) {
    params.set('days', String(options.days));
  }

  const response = await fetch(buildApiUrl(`/api/daily-entries/?${params.toString()}`));
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body.errors
      ? Object.values(body.errors).flat().join(' ')
      : 'Unable to load daily entries.';
    throw new Error(message);
  }

  return body.dailyEntries || [];
}

async function createDailyEntry(payload) {
  const response = await fetch(buildApiUrl('/api/daily-entries/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

async function updateDailyEntry(id, payload) {
  const response = await fetch(buildApiUrl(`/api/daily-entries/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

async function deleteDailyEntry(id) {
  const response = await fetch(buildApiUrl(`/api/daily-entries/${id}`), {
    method: 'DELETE',
  });
  if (response.status === 204) {
    return { response, body: null };
  }

  const body = await response.json().catch(() => ({}));
  return { response, body };
}

async function hydrateSelectedDailyDate() {
  const { userId, date } = getDailyTrackerContext();
  if (!userId || !date) {
    resetDailyEntryFormFields();
    return;
  }

  let entry = findCachedDailyEntry(userId, date);
  if (!entry) {
    try {
      const matches = await fetchDailyEntries(userId, { date });
      entry = matches[0];
    } catch (error) {
      setDailyTrackerStatus(error.message || 'Unable to load the selected date.', 'error');
      resetDailyEntryFormFields();
      return;
    }
  }

  if (entry) {
    fillDailyEntryForm(entry);
  } else {
    resetDailyEntryFormFields();
  }
}

async function reloadDailyEntryList() {
  const { userId, date } = getDailyTrackerContext();
  const userError = document.getElementById('daily-tracker-user-id-error');
  if (userError) {
    userError.textContent = userId ? '' : 'User id is required.';
  }

  if (!userId) {
    renderDailyEntryList([]);
    setDailyTrackerStatus('Select a user id to load daily entries.', 'error');
    return;
  }

  try {
    const entries = await fetchDailyEntries(userId);
    renderDailyEntryList(entries);
    if (date) {
      await hydrateSelectedDailyDate();
    }
  } catch (error) {
    setDailyTrackerStatus(error.message || 'Unable to load daily entries.', 'error');
  }
}

async function handleDailyEntrySubmit(event) {
  event.preventDefault();
  clearDailyTrackerFieldErrors();

  const context = getDailyTrackerContext();
  if (!context.userId || !context.date) {
    if (!context.userId) {
      setDailyTrackerFieldError('userId', ['User id is required.']);
    }
    if (!context.date) {
      setDailyTrackerFieldError('date', ['Date is required.']);
    }
    setDailyTrackerStatus('User id and date are required.', 'error');
    return;
  }

  const editId = dailyEntryEditId.value.trim();
  const payload = collectDailyEntryFormPayload(context);
  const submitButton = document.getElementById('daily-entry-submit');
  submitButton.disabled = true;
  setDailyTrackerStatus(editId ? 'Updating daily entry...' : 'Saving daily entry...');

  try {
    const { response, body } = editId
      ? await updateDailyEntry(editId, payload)
      : await createDailyEntry(payload);

    if (!response.ok) {
      showDailyTrackerFieldErrors(body.errors || {});
      const message = response.status === 409
        ? (body.errors ? Object.values(body.errors).flat().join(' ') : 'A daily entry already exists for this user and date.')
        : 'Please fix the highlighted daily entry fields.';
      setDailyTrackerStatus(message, 'error');
      return;
    }

    setDailyTrackerStatus(
      editId ? 'Daily entry updated.' : 'Daily entry saved.',
      'success',
    );
    await reloadDailyEntryList();
  } catch (error) {
    setDailyTrackerStatus(error.message || 'Daily entry save failed.', 'error');
  } finally {
    submitButton.disabled = false;
  }
}

function wireNutritionRoutineView() {
  nutritionRoutineDate.value = todayIsoDate();
  dailyTrackerDate.value = todayIsoDate();

  navHomeButton.addEventListener('click', () => {
    showView('home');
  });

  navNutritionRoutineButton.addEventListener('click', async () => {
    showView('nutrition-routine');
    setNutritionRoutineStatus('Nutrition & Routine ready.');
    await reloadDailyLists();
  });

  navDailyTrackerButton.addEventListener('click', async () => {
    showView('daily-tracker');
    setDailyTrackerStatus('Daily Tracker ready.');
    renderActivityPicker(getSelectedDailyActivityIds());
    await reloadDailyEntryList();
  });

  dailyEntryLogActivity.addEventListener('click', () => {
    showView('home');
  });

  dailyTrackerDate.addEventListener('change', () => {
    hydrateSelectedDailyDate();
  });

  dailyTrackerUserId.addEventListener('change', () => {
    reloadDailyEntryList();
  });

  dailyEntryForm.addEventListener('submit', handleDailyEntrySubmit);

  nutritionRoutineDate.addEventListener('change', () => {
    reloadDailyLists();
  });

  nutritionRoutineUserId.addEventListener('change', () => {
    reloadDailyLists();
  });

  nutritionForm.addEventListener('submit', handleNutritionSubmit);
  routineForm.addEventListener('submit', handleRoutineSubmit);
  nutritionCancelEdit.addEventListener('click', () => {
    resetNutritionForm();
    setNutritionRoutineStatus('Nutrition edit cancelled.');
  });
  routineCancelEdit.addEventListener('click', () => {
    resetRoutineForm();
    setNutritionRoutineStatus('Routine edit cancelled.');
  });
}

async function init() {
  wireNutritionRoutineView();

  try {
    const [contract, bootstrap] = await Promise.all([
      loadContract(),
      loadBootstrap(),
    ]);

    renderBootstrap(bootstrap);
    setStatus('Bootstrap data, activity logger, and leaderboard ready.');

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
    if (!nutritionRoutineUserId.value) {
      nutritionRoutineUserId.value = '1';
    }
    if (!dailyTrackerUserId.value) {
      dailyTrackerUserId.value = '1';
    }
    renderActivityPicker([]);
  }
}

init();
