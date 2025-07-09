module.exports = function getBadgesAndPaintsQuery() {
  return {
    query: `
      query GetBadgesAndPaints {
        badges {
          badges {
            name
            id
            description
          }
        }
        paints {
          paints {
            name
            id
          }
        }
      }
    `,
  };
};
