module.exports = function userRecentFollowsQuery(login) {
  return {
    query: `
      query FollowersAndFollows($login: String!) {
        user(login: $login) {
          followers(first: 1, order: DESC) {
            edges {
              followedAt
              node {
                login
                id
                displayName
              }
            }
          }
          follows(first: 1, order: DESC) {
            edges {
              followedAt
              node {
                login
                id
                displayName
              }
            }
          }
        }
      }
    `,
    variables: {
      login
    }
  };
};
