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

function findTeamRecordById(teamId) {
  return teams.find((team) => team.id === teamId) || null;
}

function incrementTeamMemberCount(teamId) {
  const team = findTeamRecordById(teamId);
  if (!team) {
    return null;
  }

  team.memberCount += 1;
  return team;
}

function listTeamRecords() {
  return teams.slice();
}

module.exports = {
  createTeamRecord,
  findTeamRecordById,
  incrementTeamMemberCount,
  listTeamRecords,
  resetTeams,
};