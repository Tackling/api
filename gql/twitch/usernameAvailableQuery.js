module.exports = function UsernameAvailableQuery(username) {
  return {
    query: `
      query UsernameValidator_User($username: String!) {
        isUsernameAvailable(username: $username)
      }
    `,
    variables: {
      username
    }
  };
};
