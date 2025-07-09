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

function getUserSubscriptionQuery(userId) {
  return {
    query: `
      query userSubscriptionQuery {
        users {
          user(id: "${userId}") {
            id
            billing(productId: "01FEVKBBTGRAT7FCY276TNTJ4A") {
              subscriptionInfo {
                endDate
                totalDays
                activePeriod {
                  autoRenew
                  giftedById
                  isTrial
                  start
                  subscriptionProduct {
                    name
                    defaultVariant {
                      paypalId
                      price {
                        amount
                        currency
                      }
                      id
                      kind
                    }
                    providerId
                  }
                  subscription {
                    state
                    createdAt
                    endedAt
                    id {
                      productId
                      userId
                    }
                  }
                  subscriptionProductVariant {
                    id
                    kind
                    paypalId
                    price {
                      amount
                      currency
                    }
                  }
                  giftedBy {
                    mainConnection {
                      platform
                      platformId
                      platformUsername
                      platformDisplayName
                    }
                  }
                  providerId {
                    provider
                    id
                  }
                  end
                  createdBy {
                    ... on SubscriptionPeriodCreatedByRedeemCode {
                      __typename
                      redeemCodeId
                    }
                    ... on SubscriptionPeriodCreatedByInvoice {
                      __typename
                      invoiceId
                    }
                    ... on SubscriptionPeriodCreatedBySystem {
                      reason
                    }
                  }
                }
              }
              badgeProgress {
                currentBadge {
                  id
                  name
                }
                nextBadge {
                  percentage
                  daysLeft
                  badge {
                    name
                    id
                  }
                }
              }
            }
          }
        }
      }
    `
  };
}

module.exports = {
  getUserIdQuery,
  getUserSubscriptionQuery
};
