module.exports = function modsAndVipsQuery(targetUsername) {
  return {
    query: `
      query mod {
        user(login: "${targetUsername}") {
          mods: mods(first: 100) {
            edges {
            grantedAt
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
          vips: vips(first: 100) {
            edges {
            grantedAt
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
  };
};
