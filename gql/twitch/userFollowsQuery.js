module.exports = function getUserFollowsQuery(login, after = null) {
  return {
    query: `
      query Follows($login: String!, $after: Cursor) {
        user(login: $login) {
          follows(first: 100, after: $after, order: DESC) {
            totalCount
            edges {
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
