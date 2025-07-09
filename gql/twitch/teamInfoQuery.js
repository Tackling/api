module.exports = function getTeamInfoQuery(teamName) {
  return [
    {
      operationName: 'TeamLandingMemberList',
      variables: { teamName },
      query: `
        query TeamLandingMemberList($teamName: String!) {
          team(name: $teamName) {
            members(first: 100) {
              totalCount
              edges {
                node {
                  login
                  displayName
                  id
                }
              }
            }
            owner {
              login
              displayName
              id
            }
          }
        }
      `,
    },
    {
      operationName: 'TeamsLandingBody',
      variables: { teamName },
      query: `
        query TeamsLandingBody($teamName: String!) {
          team(name: $teamName) {
            name
            displayName
            id
          }
        }
      `,
    },
  ];
};
