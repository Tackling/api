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
  if (!login) return res.status(400).json({ error: 'Missing ?login=' });

  const gqlQuery = gql.getModsAndVipsQuery(login);

  try {
    const response = await axios.post(TWITCH_GQL_URL, gqlQuery, axiosOptions);
    const user = response.data.data.user;

    const formatEdges = (edges) =>
      edges.map((edge) => ({
        ...edge.node,
        grantedAt: edge.grantedAt,
      }));

    res.json({
      mods: user.mods ? formatEdges(user.mods.edges) : [],
      vips: user.vips ? formatEdges(user.vips.edges) : [],
    });
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
    // Step 1: Get user ID from username
    const useLiveQuery = gql.getUseLiveQuery(username);
    const useLiveResponse = await axios.post(TWITCH_GQL_URL, useLiveQuery, axiosOptions);

    const user = useLiveResponse.data?.[0]?.data?.user;
    if (!user || !user.id) {
      return res.status(404).json({ error: 'User not found' });
    }

    const channelID = user.id;

    // Step 2: Use channel ID to get pinned messages
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

router.get('/team', async (req, res) => {
  const teamName = req.query.team;
  if (!teamName) return res.status(400).json({ error: 'Missing ?team=' });

  const gqlQuery = gql.getTeamInfoQuery(teamName);

  try {
    const response = await axios.post(TWITCH_GQL_URL, gqlQuery, axiosOptions);

    const memberListData = response.data[0]?.data?.team;
    const bodyData = response.data[1]?.data?.team;

    const totalCount = memberListData?.members?.totalCount || 0;
    const members = (memberListData?.members?.edges || []).map(edge => edge.node);
    const owner = memberListData?.owner || null;
    const teamInfo = bodyData || null;

    const output = [
      { totalCount },
      {
        team: teamInfo,
        owner,
      },
      {
        members,
      },
    ];

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
