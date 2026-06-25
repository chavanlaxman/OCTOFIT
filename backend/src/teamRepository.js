const teams = [];
let nextTeamId = 1;

function resetTeams() {
  teams.length = 0;
  nextTeamId = 1;
}

function createTeamRecord(teamInput) {
  const team = {
    id: nextTeamId,
    name: teamInput.name,
    memberCount: teamInput.memberCount,
    focus: teamInput.focus,
    createdAt: new Date().toISOString(),
  };

  nextTeamId += 1;
  teams.unshift(team);
  return team;
}

function listTeamRecords() {
  return teams.slice();
}

module.exports = {
  createTeamRecord,
  listTeamRecords,
  resetTeams,
};