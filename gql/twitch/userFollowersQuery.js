module.exports = function getUserFollowersQuery(login, after = null) {
  return {
    query: `
      query Followers($login: String!, $after: Cursor) {
        user(login: $login) {
          followers(first: 100, after: $after, order: DESC) {
            totalCount
            edges {
              cursor
              followedAt
              node {
                login
                id
                displayName
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }
    `,
    variables: {
      login,
      after
    }
  };
};
