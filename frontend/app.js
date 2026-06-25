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
  activityFeedList.replaceChildren(...activities.map(renderActivity));
  activityFeedEmpty.hidden = activities.length > 0;
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

function renderBootstrap(bootstrap) {
  renderHero(bootstrap.hero);
  renderDashboard(bootstrap.dashboard);
  renderUsers(bootstrap.users || []);
  renderTeams(bootstrap.teams || []);
  renderChallenges(bootstrap.challenges || []);
  renderActivityFeed(bootstrap.activities || []);
  renderLeaderboard(bootstrap.leaderboard || []);
  renderRecommendations(bootstrap.recommendations || []);
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

async function init() {
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
  }
}

init();