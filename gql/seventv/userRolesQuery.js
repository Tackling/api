function getUserIdQuery(username) {
  return {
    query: `
      query IDbyUsername {
        users {
          search(query: "${username}") {
            items {
              id
              mainConnection {
                platformUsername
              }
            }
          }
        }
      }
    `,
  };
}

function getUserRolesQuery(userId) {
  return {
    query: `
      query userRoles {
        users {
          user(id: "${userId}") {
            roles {
              id
              name
            }
          }
        }
      }
    `,
  };
}

module.exports = {
  getUserIdQuery,
  getUserRolesQuery,
};
