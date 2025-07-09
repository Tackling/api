module.exports = function gameInfoQuery(name) {
  return {
    query: `
      query {
        game(name: "${name}") {
          id
          slug
          name
          displayName
          description
          coverURL
          avatarURL(width: 600, height: 600)
          logoURL(width: 600, height: 600)
          popularityScore
          viewersCount
          followersCount
          broadcastersCount
          developers
          franchises
          platforms
          esrbRating
          esrbDescriptions
          igdbURL
          prestoID
          tags(limit: 10, tagType: TOP) {
            id
            tagName
            localizedName
            isLanguageTag
          }
        }
      }
    `,
  };
};
