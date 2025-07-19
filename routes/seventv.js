const express = require('express');
const axios = require('axios');
const gql = require('../gql/seventv');
const router = express.Router();

const SEVENTV_GQL_URL = 'https://7tv.io/v4/gql';

const axiosOptions = {
  headers: {
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br'
  },
  decompress: true
};

router.get('/badgespaints', async (req, res) => {
  const gqlQuery = gql.getBadgesAndPaintsQuery();

  try {
    const response = await axios.post(SEVENTV_GQL_URL, gqlQuery, axiosOptions);
    const data = response.data?.data;

    if (!data) return res.status(500).json({ error: 'No data returned from 7TV' });

    const badges = data.badges?.badges ?? [];
    const paints = data.paints?.paints ?? [];

    const badgeCount = badges.filter(b => b?.id).length;
    const paintCount = paints.filter(p => p?.id).length;

    res.json({
      badgeCount,
      badges,
      paintCount,
      paints,
    });
  } catch (err) {
    res.status(500).json({
      error: '7TV request failed',
      details: err.response?.data || err.message,
    });
  }
});

router.get('/userroles', async (req, res) => {
  const login = req.query.login;
  if (!login) return res.status(400).json({ error: 'Missing ?login=' });

  try {
    const searchQuery = gql.getUserIdQuery(login);
    const searchRes = await axios.post(SEVENTV_GQL_URL, searchQuery, axiosOptions);
    const items = searchRes.data?.data?.users?.search?.items ?? [];

    const match = items.find(
      (u) => u?.mainConnection?.platformUsername?.toLowerCase() === login.toLowerCase()
    );

    if (!match) {
      return res.status(404).json({ error: `No exact match found for username '${login}'` });
    }

    const userId = match.id;
    const roleQuery = gql.getUserRolesQuery(userId);
    const roleRes = await axios.post(SEVENTV_GQL_URL, roleQuery, axiosOptions);
    const roles = roleRes.data?.data?.users?.user?.roles ?? [];

    res.json({
      userId,
      username: match.mainConnection.platformUsername,
      roles,
    });
  } catch (err) {
    res.status(500).json({
      error: '7TV request failed',
      details: err.response?.data || err.message,
    });
  }
});

router.get('/userinfo', async (req, res) => {
  const login = req.query.login;
  if (!login) return res.status(400).json({ error: 'Missing ?login=' });

  try {
    const searchQuery = gql.getUserIdQuery(login);
    const searchRes = await axios.post(SEVENTV_GQL_URL, searchQuery, axiosOptions);
    const items = searchRes.data?.data?.users?.search?.items ?? [];

    const match = items.find(
      (u) => u?.mainConnection?.platformUsername?.toLowerCase() === login.toLowerCase()
    );

    if (!match) {
      return res.status(404).json({ error: `No exact match found for username '${login}'` });
    }

    const userId = match.id;
    const userInfoQuery = gql.getUserInfoQuery(userId);
    const userInfoRes = await axios.post(SEVENTV_GQL_URL, userInfoQuery, axiosOptions);
    const userData = userInfoRes.data?.data?.users?.user;

    if (!userData) {
      return res.status(404).json({ error: 'User not found after ID lookup' });
    }

    const roles = userData.roles ?? [];
    const connections = userData.connections ?? [];
    const editorFor = userData.editorFor ?? [];
    const badges = (userData.inventory?.badges ?? []).map((entry) => entry.to?.badge).filter(Boolean);
    const paints = (userData.inventory?.paints ?? []).map((entry) => entry.to?.paint).filter(Boolean);
    const activeBadge = userData.style?.activeBadge ?? null;
    const activePaint = userData.style?.activePaint ?? null;

    const response = {
      id: userId,
      username: match.mainConnection?.platformUsername ?? null,
      roles: {
        total: roles.length,
        roles: roles,
      },
      connections,
      editorFor: {
        total: editorFor.length,
        users: editorFor.map((editor) => ({
          userId: editor.userId,
          platformUsername: editor.user?.mainConnection?.platformUsername ?? null,
          platform: editor.user?.mainConnection?.platform ?? null,
          addedAt: editor.addedAt,
        })),
      },
      badges: {
        total: badges.length,
        active: activeBadge,
        items: badges,
      },
      paints: {
        total: paints.length,
        active: activePaint,
        items: paints,
      },
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({
      error: '7TV request failed',
      details: err.response?.data || err.message,
    });
  }
});

router.get('/usersubscriptioninfo', async (req, res) => {
  const login = req.query.login;
  if (!login) return res.status(400).json({ error: 'Missing ?login=' });

  try {
    const searchQuery = gql.getUserIdQuery(login);
    const searchRes = await axios.post(SEVENTV_GQL_URL, searchQuery, axiosOptions);
    const items = searchRes.data?.data?.users?.search?.items ?? [];

    const match = items.find(
      (u) => u?.mainConnection?.platformUsername?.toLowerCase() === login.toLowerCase()
    );

    if (!match) {
      return res.status(404).json({ error: `No exact match found for username '${login}'` });
    }

    const userId = match.id;

    const subQuery = gql.getUserSubscriptionQuery(userId);
    const subRes = await axios.post(SEVENTV_GQL_URL, subQuery, axiosOptions);
    const user = subRes.data?.data?.users?.user;

    if (!user) {
      return res.status(404).json({ error: 'User not found after ID lookup' });
    }

    const subInfo = user.billing?.subscriptionInfo?.activePeriod;
    const badgeProgress = user.billing?.badgeProgress;
    const product = subInfo?.subscriptionProduct ?? {};
    const defaultPlan = product?.defaultVariant ?? {};
    const currentPlan = subInfo?.subscriptionProductVariant ?? {};
    const giftedById = subInfo?.giftedById ?? null;
    const gifted = subInfo?.giftedBy?.mainConnection;

const response = {
  username: login,
  userId: user.id,
  subscription: {
    name: product.name ?? null,
    status: subInfo?.subscription?.state ?? null,
    startDate: subInfo?.start ?? null,
    endDate: user.billing.subscriptionInfo?.endDate ?? null,
    renewalEndDate: subInfo?.end ?? null,
    durationInDays: user.billing.subscriptionInfo?.totalDays ?? null,
    autoRenews: subInfo?.autoRenew ?? false,
    isTrial: subInfo?.isTrial ?? false,
    createdAt: subInfo?.subscription?.createdAt ?? null,
    endedAt: subInfo?.subscription?.endedAt ?? null,
    ...(giftedById && gifted
      ? {
          gifted: {
            userId: giftedById,
            platform: gifted.platform,
            platformId: gifted.platformId,
            username: gifted.platformUsername,
            displayName: gifted.platformDisplayName
          }
        }
      : {}),
    createdBy: {
      type: subInfo?.createdBy?.__typename ?? null,
      invoiceId: subInfo?.createdBy?.invoiceId ?? null
    },
    subscriptionIds: {
      productId: subInfo?.subscription?.id?.productId ?? null,
      userId: subInfo?.subscription?.id?.userId ?? null
    },
    providerId: product?.providerId ?? null,
    defaultPlan: {
      id: defaultPlan.id,
      type: defaultPlan.kind,
      paypalId: defaultPlan.paypalId,
      price: defaultPlan.price
    },
    currentPlan: {
      id: currentPlan.id,
      type: currentPlan.kind,
      paypalId: currentPlan.paypalId,
      price: currentPlan.price
    }
  },
  badges: {
    current: {
      id: badgeProgress?.currentBadge?.id ?? null,
      name: badgeProgress?.currentBadge?.name ?? null
    },
    next: {
      id: badgeProgress?.nextBadge?.badge?.id ?? null,
      name: badgeProgress?.nextBadge?.badge?.name ?? null,
      progressPercent: Math.round((badgeProgress?.nextBadge?.percentage ?? 0) * 10000) / 100,
      daysLeft: badgeProgress?.nextBadge?.daysLeft ?? null
    }
  }
};

    res.json(response);
  } catch (err) {
    res.status(500).json({
      error: '7TV request failed',
      details: err.response?.data || err.message
    });
  }
});


module.exports = router;
