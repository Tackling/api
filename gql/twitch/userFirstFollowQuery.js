module.exports = function userFirstFollowsQuery(login) {
  return {
    query: `
      query FollowersAndFollows($login: String!) {
        user(login: $login, lookupType: ALL) {
          followers(first: 1) {
            edges {
              followedAt
              node {
                login
                id
                displayName
              }
            }
          }
          follows(first: 1) {
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
