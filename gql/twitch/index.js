const getModsAndVipsQuery = require('./modsAndVipsQuery');
const getUserBadgesQuery = require('./userBadgesQuery');
const getTeamInfoQuery = require('./teamInfoQuery');
const getGlobalBadgesQuery = require('./globalBadgesQuery');
const getUserInfoQuery = require('./userInfoQuery');
const getchannelFounderQuery = require('./channelFounderQuery');
const pinnedMessageQueries = require('./pinnedMessageQuery');
const getGameInfoQuery = require('./gameInfoQuery');

module.exports = {
  getModsAndVipsQuery,
  getUserBadgesQuery,
  getTeamInfoQuery,
  getGlobalBadgesQuery,
  getUserInfoQuery,
  getchannelFounderQuery,
  ...pinnedMessageQueries,
  getGameInfoQuery,
};
