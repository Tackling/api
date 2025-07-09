function getUseLiveQuery(username) {
  return [
    {
      operationName: "UseLive",
      variables: { channelLogin: username },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: "639d5f11bfb8bf3053b424d9ef650d04c4ebb7d94711d644afb08fe9a0fad5d9"
        }
      }
    }
  ];
}

function getPinnedMessageQuery(channelID) {
  return [
    {
      operationName: "GetPinnedChat",
      variables: { channelID, count: 1 },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: "2d099d4c9b6af80a07d8440140c4f3dbb04d516b35c401aab7ce8f60765308d5"
        }
      }
    }
  ];
}

module.exports = {
  getUseLiveQuery,
  getPinnedMessageQuery,
};
