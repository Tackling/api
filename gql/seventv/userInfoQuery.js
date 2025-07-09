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

function getUserInfoQuery(userId) {
  return {
    query: `
      query IDbyUsername {
        users {
          user(id: "${userId}") {
            inventory {
              badges {
                to {
                  badge {
                    id
                    name
                    description
                  }
                }
              }
              paints {
                to {
                  paint {
                    name
                    id
                  }
                }
              }
            }
            roles {
              id
              name
            }
            connections {
              platform
              platformUsername
              platformDisplayName
              platformId
              linkedAt
            }
            editorFor {
              userId
              user {
                mainConnection {
                  platformUsername
                  platform
                }
              }
              addedAt
            }
          }
        }
      }
    `,
  };
}

module.exports = {
  getUserIdQuery,
  getUserInfoQuery,
};
