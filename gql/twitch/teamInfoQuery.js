module.exports = function getTeamInfoQuery(teamName, afterMembers = null, afterLive = null) {
  return [
    {
      operationName: 'TeamFullInfo',
      variables: {
        teamName,
        afterMembers,
        afterLive
      },
      query: `
        query TeamFullInfo($teamName: String!, $afterMembers: Cursor, $afterLive: Cursor) {
          team(name: $teamName) {
            id
            name
            displayName
            description
            backgroundImageID
            backgroundImageURL
            bannerID
            bannerURL
            logoID
            logoURL
            owner {
              id
              login
              displayName
            }
            members(first: 100, after: $afterMembers) {
              totalCount
              edges {
                cursor
                node {
                  id
                  login
                  displayName
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
            liveMembers(first: 100, after: $afterLive) {
              edges {
                cursor
                node {
                  id
                  login
                  displayName
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `,
    },
  ];
};
