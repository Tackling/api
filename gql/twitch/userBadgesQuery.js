module.exports = function getUserBadgesQuery(channelLogin, targetLogin) {
  return {
    operationName: "ViewerCard",
    variables: {
      channelID: "1",
      channelIDStr: "1",
      channelLogin: channelLogin,
      targetLogin: targetLogin,
      isViewerBadgeCollectionEnabled: true,
      lookupType: 'ALL',
    },
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: "c02d0aa3e6fdaad9a668f354236e0ded00e338cb742da33bb166e0f34ebf3c3b"
      }
    }
  };
};
