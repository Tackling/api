module.exports = function modsAndVipsQuery(targetUsername) {
  return {
    query: `
      query {
        user(login: "${targetUsername}") {
          mods: mods(first: 100) {
            edges {
              grantedAt
              isActive
              node {
                id
                login
                displayName
              }
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
          }
        }
      }
    `
  };
};
