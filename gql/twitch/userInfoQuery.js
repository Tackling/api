module.exports = function getUserInfoQuery(username) {
  return [
    {
      operationName: 'ChannelShell',
      variables: { login: username },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: '580ab410bcd0c1ad194224957ae2241e5d252b2c5173d8e0cce9d32d5bb14efe',
        },
      },
    },
    {
      operationName: 'UserQuery',
      variables: { login: username },
      query: `
        query UserQuery($login: String!) {
          user(login: $login) {
            id
            login
            displayName
            description
            createdAt
            updatedAt
            chatColor
            profileViewCount
            profileImageURL(width: 600)
            bannerImageURL
            followers {
              totalCount
            }
            follows {
              totalCount
            }
            roles {
              isParticipatingDJ
              isPreAffiliate
              isAffiliate
              isPartner
              isStaff
              isSiteAdmin
              isGlobalMod
              isExtensionsDeveloper
            }
            hasTurbo
            primaryTeam {
              id
              name
              displayName
              backgroundImageURL
            }
            displayBadges{
             id
             setID
             title
             description
             imageURL
            } 
            stream {
              id
              type
              title
              viewersCount
              createdAt
              averageFPS
              bitrate
              broadcasterSoftware
              codec
              height
              width
              game {
                name
                id
              }
            }
            lastBroadcast {
              id
              title
              startedAt
              game {
                id
                name
              }
            }
            chatSettings {
            rules
            chatDelayMs
            slowModeDurationSeconds
            isFastSubsModeEnabled
            isUniqueChatModeEnabled
            isEmoteOnlyModeEnabled
            followersOnlyDurationMinutes
            requireVerifiedAccount
            blockLinks
            accountVerificationOptions {
                emailVerificationMode
                partialEmailVerificationConfig {
                  minimumAccountAgeInMinutes
                  minimumFollowerAgeInMinutes
                  shouldRestrictBasedOnAccountAge
                  shouldRestrictFirstTimeChatters
                  shouldRestrictBasedOnFollowerAge
                }
                phoneVerificationMode
                partialPhoneVerificationConfig {
                  minimumAccountAgeInMinutes
                  minimumFollowerAgeInMinutes
                  shouldRestrictBasedOnAccountAge
                  shouldRestrictFirstTimeChatters
                  shouldRestrictBasedOnFollowerAge
                }
                isSubscriberExempt
                isVIPExempt
                isModeratorExempt
              }
            }
            panels {
              id
              ... on DefaultPanel {
                type
                title
                imageURL
                linkURL
                description
                altText
              }
            }
            channel {
      founderBadgeAvailability
      chatters {
        count
      }
    }
    settings {
      leaderboard {
        isCheerEnabled
        isSubGiftEnabled
        isClipEnabled
        defaultLeaderboard
        timePeriod
      }
    }
  }
}

      `,
    },
    {
      operationName: 'ViewerCard',
      variables: {
        channelID: '1',
        channelIDStr: '1',
        channelLogin: 'browser',
        targetLogin: username,
        isViewerBadgeCollectionEnabled: true,
      },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: 'c02d0aa3e6fdaad9a668f354236e0ded00e338cb742da33bb166e0f34ebf3c3b',
        },
      },
    },
  ];
};
