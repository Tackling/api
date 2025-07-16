const express = require('express');
const axios = require('axios');
const gql = require('../gql/twitch'); // Imports all from the twitch folder
const router = express.Router();

const TWITCH_GQL_URL = 'https://gql.twitch.tv/gql';

const axiosOptions = {
  headers: {
    'Client-ID': process.env.TWITCH_CLIENT_ID,
    'Content-Type': 'application/json',
  },
};

router.get('/modvip', async (req, res) => {
  const login = req.query.login;
  if (!login) {
    return res.status(400).json({ error: 'Missing ?login=' });
  }

  const gqlQuery = gql.getModsAndVipsQuery(login);

  try {
    const response = await axios.post(TWITCH_GQL_URL, gqlQuery, axiosOptions);

    const user = response.data.data.user;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const formatEdges = (edges) =>
      edges.map((edge) => ({
        ...edge.node,
        grantedAt: edge.grantedAt,
        isActive: edge.isActive,
      }));

    const modsArray = user.mods?.edges ? formatEdges(user.mods.edges) : [];
    const vipsArray = user.vips?.edges ? formatEdges(user.vips.edges) : [];

    const mods = {
      totalCount: modsArray.length,
      items: modsArray,
    };

    const vips = {
      totalCount: vipsArray.length,
      items: vipsArray,
    };

    res.json({ mods, vips });
  } catch (err) {
    res.status(500).json({
      error: 'Twitch request failed',
      details: err.response?.data || err.message,
    });
  }
});

router.get('/userbadges', async (req, res) => {
  const targetLogin = req.query.login;
  const channelLogin = req.query.channel;

  if (!targetLogin || !channelLogin) {
    return res.status(400).json({ error: 'Missing ?login= or ?channel=' });
  }

  const gqlQuery = gql.getUserBadgesQuery(channelLogin, targetLogin);

  try {
    const response = await axios.post(TWITCH_GQL_URL, gqlQuery, axiosOptions);
    const earnedBadges = response.data?.data?.channelViewer?.earnedBadges || [];
    const totalBadges = new Set(earnedBadges.map(badge => badge.setID)).size;

    res.json({
      totalBadges,
      earnedBadges
    });
  } catch (err) {
    res.status(500).json({
      error: 'Twitch request failed',
      details: err.response?.data || err.message,
    });
  }
});

router.get('/pinnedmessage', async (req, res) => {
  const username = req.query.login;

  if (!username) {
    return res.status(400).json({ error: 'Missing ?login=' });
  }

  try {
    const useLiveQuery = gql.getUseLiveQuery(username);
    const useLiveResponse = await axios.post(TWITCH_GQL_URL, useLiveQuery, axiosOptions);

    const user = useLiveResponse.data?.[0]?.data?.user;
    if (!user || !user.id) {
      return res.status(404).json({ error: 'User not found' });
    }

    const channelID = user.id;
    const pinnedQuery = gql.getPinnedMessageQuery(channelID);
    const pinnedResponse = await axios.post(TWITCH_GQL_URL, pinnedQuery, axiosOptions);

    const edge = pinnedResponse.data?.[0]?.data?.channel?.pinnedChatMessages?.edges?.[0];
    if (!edge) {
      return res.json({ pinnedmessage: null });
    }

    const msg = edge.node?.pinnedMessage;
    const pinnedmessage = {
      id: msg?.id,
      text: msg?.content?.text,
      sender: {
        sentat: msg?.sentAt,
        id: msg?.sender?.id,
        displayname: msg?.sender?.displayName
      },
      pinnedby: {
        id: edge.node?.pinnedBy?.id,
        displayname: edge.node?.pinnedBy?.displayName
      }
    };

    res.json({ pinnedmessage });

  } catch (err) {
    res.status(500).json({
      error: 'Twitch request failed',
      details: err.response?.data || err.message,
    });
  }
});

router.get('/clipinfo', async (req, res) => {
  const slug = req.query.slug;
  if (!slug) {
    return res.status(400).json({ error: 'Missing ?slug=' });
  }

  const gqlQuery = gql.getClipInfoQuery(slug);

  try {
    const response = await axios.post(TWITCH_GQL_URL, gqlQuery, axiosOptions);
    const data = response.data;

    if (data.errors) {
      return res.status(400).json({ error: data.errors });
    }

    const clip = data?.[0]?.data?.clip;

    if (!clip) {
      return res.status(404).json({ error: 'Clip not found' });
    }

    const formatted = {
      id: clip.id,
      slug: clip.slug,
      title: clip.title,
      url: clip.url,
      embedURL: clip.embedURL,
      thumbnailURL: clip.thumbnailURL,
      createdAt: clip.createdAt,
      durationSeconds: clip.durationSeconds,
      viewCount: clip.viewCount,
      language: clip.language,
      isPublished: clip.isPublished,
      videoOffsetSeconds: clip.videoOffsetSeconds,
      broadcaster: {
        id: clip.broadcaster?.id,
        login: clip.broadcaster?.login,
        displayName: clip.broadcaster?.displayName,
      },
      curator: {
        id: clip.curator?.id,
        login: clip.curator?.login,
        displayName: clip.curator?.displayName,
      },
      game: {
        id: clip.game?.id,
        name: clip.game?.name,
        displayName: clip.game?.displayName,
      },
      video: {
        id: clip.video?.id,
        title: clip.video?.title,
      },
      broadcast: {
        id: clip.broadcast?.id,
      },
      creationState: clip.creationState,
      videoQualities: clip.videoQualities || [],
    };

    res.json(formatted);
  } catch (err) {
    res.status(500).json({
      error: 'Twitch request failed',
      details: err.response?.data || err.message,
    });
  }
});

router.get('/team', async (req, res) => {
  const teamName = req.query.team;

  if (!teamName) return res.status(400).json({ error: 'Missing ?team=' });

  try {
    let allMembers = [];
    let allLiveMembers = [];
    let afterMembers = null;
    let afterLive = null;
    let teamData = null;

    do {
      const gqlQuery = gql.getTeamInfoQuery(teamName, afterMembers, afterLive)[0];
      const response = await axios.post(TWITCH_GQL_URL, gqlQuery, axiosOptions);
      console.log(JSON.stringify(response.data, null, 2));

      teamData = response.data?.data?.team;
      if (!teamData) {
        return res.status(404).json({ error: 'Team not found' });
      }

      const membersEdges = teamData.members?.edges || [];
      allMembers.push(...membersEdges.map(edge => edge.node));
      afterMembers = teamData.members?.pageInfo?.hasNextPage ? teamData.members.pageInfo.endCursor : null;

      const liveMembersEdges = teamData.liveMembers?.edges || [];
      allLiveMembers.push(...liveMembersEdges.map(edge => edge.node));
      afterLive = teamData.liveMembers?.pageInfo?.hasNextPage ? teamData.liveMembers.pageInfo.endCursor : null;

    } while (afterMembers || afterLive);

    const owner = teamData.owner || null;

    const output = {
      totalCount: teamData.members?.totalCount || 0,
      team: {
        id: teamData.id,
        name: teamData.name,
        displayName: teamData.displayName,
        description: teamData.description,
        backgroundImageID: teamData.backgroundImageID,
        backgroundImageURL: teamData.backgroundImageURL,
        bannerID: teamData.bannerID,
        bannerURL: teamData.bannerURL,
        logoID: teamData.logoID,
        logoURL: teamData.logoURL,
        liveMembers: allLiveMembers,
        liveFeaturedChannels: (teamData.liveFeaturedChannels?.edges || []).map(edge => edge.node),
      },
      owner,
      members: allMembers,
    };

    res.json(output);
  } catch (err) {
    res.status(500).json({
      error: 'Twitch request failed',
      details: err.response?.data || err.message,
    });
  }
});

router.get('/globalbadges', async (req, res) => {
  const gqlQuery = gql.getGlobalBadgesQuery();

  try {
    const response = await axios.post(TWITCH_GQL_URL, gqlQuery, axiosOptions);

    const { data } = response;

    if (data.extensions) {
      delete data.extensions;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: 'Twitch request failed',
      details: err.response?.data || err.message,
    });
  }
});

router.get('/founders', async (req, res) => {
  const login = req.query.login;
  if (!login) return res.status(400).json({ error: 'Missing ?login=' });

  const gqlQuery = gql.getchannelFounderQuery(login);

  try {
    const response = await axios.post(TWITCH_GQL_URL, gqlQuery, axiosOptions);
    const data = response.data;

    if (data.errors) {
      return res.status(400).json({ error: data.errors });
    }

    const channel = data?.data?.user?.channel;

    const formatted = {
      founderBadgeAvailability: channel?.founderBadgeAvailability ?? null,
      founders: (channel?.founders || []).map(f => ({
        id: f.node?.id ?? null,
        login: f.node?.login ?? null,
        displayName: f.node?.displayName ?? null,
        isSubscribed: f.isSubscribed ?? null,
        grantedAt: f.grantedAt ?? null,
      })),
    };

    res.json(formatted);
  } catch (err) {
    res.status(500).json({
      error: 'Twitch request failed',
      details: err.response?.data || err.message,
    });
  }
});

router.get('/gameinfo', async (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).json({ error: 'Missing ?name=' });

  const gqlQuery = gql.getGameInfoQuery(name);

  try {
    const response = await axios.post(TWITCH_GQL_URL, gqlQuery, axiosOptions);
    const game = response.data.data.game;

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({
      id: game.id,
      slug: game.slug,
      name: game.name,
      displayName: game.displayName,
      description: game.description,
      coverURL: game.coverURL,
      avatarURL: game.avatarURL,
      logoURL: game.logoURL,
      popularityScore: game.popularityScore,
      viewersCount: game.viewersCount,
      followersCount: game.followersCount,
      broadcastersCount: game.broadcastersCount,
      developers: game.developers,
      franchises: game.franchises,
      platforms: game.platforms,
      esrbRating: game.esrbRating,
      esrbDescriptions: game.esrbDescriptions,
      igdbURL: game.igdbURL,
      prestoID: game.prestoID,
      tags: game.tags || [],
    });
  } catch (err) {
    res.status(500).json({
      error: 'Twitch request failed',
      details: err.response?.data || err.message,
    });
  }
});

router.get('/userfollows', async (req, res) => {
  const login = req.query.login;
  if (!login) return res.status(400).json({ error: 'Missing ?login=' });

  let allFollows = [];
  let after = null;
  let hasNextPage = true;

  try {
    while (hasNextPage) {
      console.log(`Fetching follows for ${login}, after: ${after || 'null'}`);

      const gqlQuery = gql.getUserFollowsQuery(login, after);

      const response = await axios.post(TWITCH_GQL_URL, gqlQuery, axiosOptions);
      const userData = response.data?.data?.user;

      if (!userData || !userData.follows) {
        console.error('User or follows not found in response:', response.data);
        return res.status(404).json({ error: 'User or follows not found' });
      }

      const follows = userData.follows;

      allFollows.push(...follows.edges);
      hasNextPage = follows.pageInfo.hasNextPage;
      after = follows.pageInfo.endCursor;
    }

res.json({
  totalCount: allFollows.length,
  edges: allFollows.map(edge => ({
    node: {
      id: edge.node.id,
      login: edge.node.login,
      displayName: edge.node.displayName,
      followedAt: edge.followedAt
    }
  }))
});

  } catch (err) {
    console.error('Request failed:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Twitch request failed',
      details: err.response?.data || err.message,
    });
  }
});

router.get('/userfollowers', async (req, res) => {
  const login = req.query.login;
  if (!login) return res.status(400).json({ error: 'Missing ?login=' });

  let limit = parseInt(req.query.limit, 10);
  if (isNaN(limit) || limit < 1) limit = 100;
  if (limit > 10000) limit = 10000;

  let allFollowers = [];
  let after = null;
  let hasNextPage = true;
  let totalCount = 0;

  try {
    while (hasNextPage && allFollowers.length < limit) {

      const remaining = limit - allFollowers.length;
      const fetchCount = remaining > 100 ? 100 : remaining;
      const gqlQuery = gql.getUserFollowersQuery(login, after, fetchCount);
      const response = await axios.post(TWITCH_GQL_URL, gqlQuery, axiosOptions);
      const userData = response.data?.data?.user;

      if (!userData || !userData.followers) {
        return res.status(404).json({ error: 'User or followers not found' });
      }

      const followers = userData.followers;
      totalCount = followers.totalCount;
      const edges = followers.edges.filter(edge => edge.node !== null);

      allFollowers.push(...edges);

      hasNextPage = followers.pageInfo.hasNextPage;

      if (hasNextPage && edges.length > 0) {
        after = edges[edges.length - 1].cursor;
      } else {
        after = null;
      }
    }

    const formattedFollowers = allFollowers.slice(0, limit).map(edge => ({
      id: edge.node.id,
      login: edge.node.login,
      displayName: edge.node.displayName,
      followedAt: edge.followedAt,
    }));

    res.json({
      totalCount,
      followers: formattedFollowers,
    });
  } catch (err) {
    res.status(500).json({
      error: 'Twitch request failed',
      details: err.response?.data || err.message,
    });
  }
});

router.get('/userrecentfollows', async (req, res) => {
  const login = req.query.login;
  if (!login) return res.status(400).json({ error: 'Missing ?login=' });

  try {
    const gqlQuery = gql.getUserRecentFollowQuery(login);

    const response = await axios.post(TWITCH_GQL_URL, gqlQuery, axiosOptions);
    const data = response.data?.data;
    const user = data?.user;

    if (!user || !user.follows || !user.followers) {
      return res.status(404).json({ error: 'User, follows, or followers not found' });
    }

    const latestFollower = user.followers.edges[0] || null;
    const latestFollow = user.follows.edges[0] || null;

    res.json({
      follower: latestFollower
        ? {
            followedAt: latestFollower.followedAt,
            user: {
              id: latestFollower.node.id,
              login: latestFollower.node.login,
              displayName: latestFollower.node.displayName
            }
          }
        : null,
      follow: latestFollow
        ? {
            followedAt: latestFollow.followedAt,
            user: {
              id: latestFollow.node.id,
              login: latestFollow.node.login,
              displayName: latestFollow.node.displayName
            }
          }
        : null
    });
  } catch (err) {
    console.error('Request failed:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Twitch request failed',
      details: err.response?.data || err.message
    });
  }
});

router.get('/userfirstfollows', async (req, res) => {
  const login = req.query.login;
  if (!login) return res.status(400).json({ error: 'Missing ?login=' });

  try {
    const gqlQuery = gql.getUserFirstFollowQuery(login);

    const response = await axios.post(TWITCH_GQL_URL, gqlQuery, axiosOptions);
    const data = response.data?.data;
    const user = data?.user;

    if (!user || !user.follows || !user.followers) {
      return res.status(404).json({ error: 'User, follows, or followers not found' });
    }

    const latestFollower = user.followers.edges[0] || null;
    const latestFollow = user.follows.edges[0] || null;

    res.json({
      follower: latestFollower
        ? {
            followedAt: latestFollower.followedAt,
            user: {
              id: latestFollower.node.id,
              login: latestFollower.node.login,
              displayName: latestFollower.node.displayName
            }
          }
        : null,
      follow: latestFollow
        ? {
            followedAt: latestFollow.followedAt,
            user: {
              id: latestFollow.node.id,
              login: latestFollow.node.login,
              displayName: latestFollow.node.displayName
            }
          }
        : null
    });
  } catch (err) {
    console.error('Request failed:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Twitch request failed',
      details: err.response?.data || err.message
    });
  }
});

router.get('/userinfo', async (req, res) => {
  const login = req.query.login;
  if (!login) return res.status(400).json({ error: 'Missing ?login=' });

  const queries = gql.getUserInfoQuery(login);

  try {
    const responses = await Promise.all(
      queries.map((query) => axios.post(TWITCH_GQL_URL, query, axiosOptions))
    );

    let banned = false;
let banReason = null;

let rawUser = null;
let displayBadges = [];
let badgeCount = 0;

// Declare these so they're defined before assignment
let isAmbassador = false;
let hasTurbo = false;
let hasPrime = false;


    for (const response of responses) {
      const data = response.data?.data;

      // Banned check
if (
  data?.userOrError?.__typename === 'UserDoesNotExist' &&
  (
    data.userOrError.reason === 'TOS_TEMPORARY' ||
    data.userOrError.reason === 'TOS_INDEFINITE' ||
    data.userOrError.reason === 'DEACTIVATED' ||
    data.userOrError.reason === 'DMCA'
  )
) {
  banned = true;
  banReason = data.userOrError.reason;
}


      // Main user object
      if (data?.user) {
    rawUser = { ...rawUser, ...data.user };

    if (Array.isArray(data.user.displayBadges)) {
      displayBadges = data.user.displayBadges.map(b => ({
        id: b.id ?? null,
        setID: b.setID ?? null,
        title: b.title ?? null,
        description: b.description ?? null,
        imageURL: b.imageURL ?? null,
      }));
    }
  }

  // Badge count from earnedBadges (ViewerCard)
  if (Array.isArray(data?.channelViewer?.earnedBadges)) {
    badgeCount = data.channelViewer.earnedBadges.length;

    // Check for ambassador, premium, turbo badges
    isAmbassador = data.channelViewer.earnedBadges.some(badge => badge.setID === 'ambassador');
    hasTurbo = data.channelViewer.earnedBadges.some(badge => badge.setID === 'turbo');
    hasPrime = data.channelViewer.earnedBadges.some(badge => badge.setID === 'premium');
  }
}

// Later, in your final response:
const finalResponse = {
  banned,
  ...(banned && { banReason }),

  id: rawUser?.id ?? null,
  login: rawUser?.login ?? null,
  displayName: rawUser?.displayName ?? null,
  description: rawUser?.description ?? null,
  chatColor: rawUser?.chatColor ?? null,
  followers: rawUser?.followers?.totalCount ?? null,
  follows: rawUser?.follows?.totalCount ?? null,
  chatters: rawUser?.channel?.chatters?.count ?? null,
  badges: badgeCount,
  founderBadgeAvailability: rawUser?.channel?.founderBadgeAvailability ?? null,
  updatedAt: rawUser?.updatedAt ?? null,
  createdAt: rawUser?.createdAt ?? null,
  profileViewCount: rawUser?.profileViewCount ?? null,
  profileImageURL: rawUser?.profileImageURL ?? null,
  bannerImageURL: rawUser?.bannerImageURL ?? null,
  primaryTeam: rawUser?.primaryTeam ?? null,
  roles: {
    hasPrime,
    hasTurbo,
    isParticipatingDJ: rawUser?.roles?.isParticipatingDJ ?? null,
    isPreAffiliate: rawUser?.roles?.isPreAffiliate ?? null,
    isAffiliate: rawUser?.roles?.isAffiliate ?? null,
    isPartner: rawUser?.roles?.isPartner ?? null,
    isAmbassador,
    isStaff: rawUser?.roles?.isStaff ?? null,
    isSiteAdmin: rawUser?.roles?.isSiteAdmin ?? null,
    isGlobalMod: rawUser?.roles?.isGlobalMod ?? null,
    isExtensionsDeveloper: rawUser?.roles?.isExtensionsDeveloper ?? null,
    isExtensionsApprover: rawUser?.roles?.isExtensionsApprover ?? null,
  },
  badge: displayBadges, 
  stream: rawUser?.stream ?? null,
  lastBroadcast: rawUser?.lastBroadcast ?? null,
  chatSettings: rawUser?.chatSettings ?? null,
  leaderboardSettings: rawUser?.settings.leaderboard ?? null,
  panels: rawUser?.panels?.map(p => ({
    id: p.id ?? null,
    imageURL: p.imageURL ?? null,
    linkURL: p.linkURL ?? null,
    description: p.description ?? null,
  })) ?? [],
};

    res.json(finalResponse);
  } catch (err) {
    res.status(500).json({
      error: 'Twitch request failed',
      details: err.response?.data || err.message,
    });
  }
});

module.exports = router;
