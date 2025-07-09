module.exports = function getchannelFounderQuery(login) {
  return {
    query: `
      query {
        user(login: "${login}", lookupType: ALL) {
          channel {
            founderBadgeAvailability
            founders {
              isSubscribed
              grantedAt: entitlementStart
              node: user {
                id
                login
                displayName
              }
            }
          }
        }
      }
    `,
  };
};
