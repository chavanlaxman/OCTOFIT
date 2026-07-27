const { listActivities, listLeaderboard } = require('./activityService');
const { listAccounts } = require('./registrationService');
const { listTeams } = require('./teamService');

const challenges = [
  {
    id: 'challenge-weekly-minutes',
    title: 'Weekly 150-minute goal',
    status: 'active',
    target: '150 minutes',
  },
  {
    id: 'challenge-streak',
    title: '3-session streak',
    status: 'active',
    target: '3 workouts this week',
  },
];

function buildRecommendations(activities, leaderboard) {
  if (activities.length === 0) {
    return [
      {
        id: 'rec-log-first-activity',
        title: 'Log your first activity',
        detail: 'Start the OctoFit experience by adding a workout to unlock progress insights.',
      },
      {
        id: 'rec-join-challenge',
        title: 'Join a weekly challenge',
        detail: 'Pick a challenge to build momentum and compare progress with your team.',
      },
    ];
  }

  const topEntry = leaderboard[0];

  return [
    {
      id: 'rec-keep-streak',
      title: 'Keep your streak going',
      detail: 'Log another session this week to strengthen your consistency.',
    },
    {
      id: 'rec-chase-leader',
      title: topEntry
        ? `Chase ${topEntry.studentName} on the leaderboard`
        : 'Climb the leaderboard',
      detail: 'A new workout can shift the rankings quickly when totals are close.',
    },
  ];
}

function buildBootstrapUsers(users) {
  return users.map((user) => {
    const bootstrapUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    if (user.teamId != null) {
      bootstrapUser.teamId = user.teamId;
      bootstrapUser.teamName = user.teamName;
    }

    return bootstrapUser;
  });
}

function createBootstrapPayload() {
  const users = listAccounts();
  const teams = listTeams();
  const activities = listActivities();
  const leaderboard = listLeaderboard();

  return {
    status: 'success',
    hero: {
      eyebrow: 'OctoFit entry experience',
      title: 'Load your OctoFit home view in one request',
      subtitle: 'The app entry response includes the hero, dashboard, community data, recent activities, challenges, rankings, and recommendations.',
    },
    dashboard: {
      totalUsers: users.length,
      totalTeams: teams.length,
      totalActivities: activities.length,
      activeChallenges: challenges.filter((challenge) => challenge.status === 'active').length,
    },
    users: buildBootstrapUsers(users),
    teams,
    activities,
    challenges,
    leaderboard,
    recommendations: buildRecommendations(activities, leaderboard),
  };
}

module.exports = {
  createBootstrapPayload,
};