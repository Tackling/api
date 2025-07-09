const getBadgesAndPaintsQuery = require('./badgesAndPaintsQuery');
const userRolesQuery = require('./userRolesQuery');
const userInfoQuery = require('./userInfoQuery');
const userSubscriptionQuery = require('./userSubscriptionQuery');

module.exports = {
  getBadgesAndPaintsQuery,
  ...userRolesQuery,
  ...userInfoQuery,
  ...userSubscriptionQuery,
};
