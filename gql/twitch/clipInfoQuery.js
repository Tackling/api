module.exports = function getClipInfoQuery(slug) {
  return [
    {
      operationName: 'ClipInfo',
      variables: {
        slug: slug,
      },
      query: `
        query ClipInfo($slug: ID!) {
          clip(slug: $slug) {
            id
            slug
            title
            url
            embedURL
            thumbnailURL(width: 480, height: 272)
            createdAt
            durationSeconds
            viewCount
            language
            isPublished
            videoOffsetSeconds

            broadcaster {
              id
              login
              displayName
            }

            curator {
              id
              login
              displayName
            }

            game {
              id
              name
              displayName
            }

            video {
              id
              title
            }

            broadcast {
              id
            }

            creationState
            videoQualities {
              quality
              frameRate
              sourceURL
              width
              height
            }
          }
        }
      `,
    },
  ];
};
