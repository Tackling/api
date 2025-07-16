require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const twitchRoutes = require('./routes/twitch');
const sevenTvRoutes = require('./routes/seventv');
const miscRoutes = require('./routes/misc');

const app = express();
const port = 3000;

app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const memoryUsedMB = process.memoryUsage().heapUsed / 1024 / 1024;
    const rssMB = process.memoryUsage().rss / 1024 / 1024;

    console.log(
      `${req.method} ${req.originalUrl} - ${duration} ms - ${memoryUsedMB.toFixed(2)} MB - rss ${rssMB.toFixed(2)} MB`
    );
  });

  next();
});

const swaggerDoc = {
  openapi: '3.0.0',
  info: {
    title: 'Twitch & 7TV API',
    version: '1.0.0',
    description: 'API for retrieving Twitch and 7TV data',
  },
  servers: [
    {
      url: 'https://api.tackling.cc/',
      description: 'api',
    },
  ],
  tags: [
    { name: 'Twitch: User', description: 'Twitch user endpoints' },
    { name: 'Twitch: Channel', description: 'Twitch channel endpoints' },
    { name: 'Twitch: Global', description: 'Twitch global endpoints' },
    { name: '7TV: User', description: '7TV user endpoints' },
    { name: '7TV: Global', description: '7TV global endpoints' },
    { name: 'Misc', description: 'API info endpoints' },
  ],
  'x-tagGroups': [
    {
      name: 'Twitch',
      tags: ['Twitch: User', 'Twitch: Channel', 'Twitch: Global'],
    },
    {
      name: '7TV',
      tags: ['7TV: User', '7TV: Global'],
    },
  ],
  paths: {
    '/twitch/UserInfo': {
      get: {
        tags: ['Twitch: User'],
        summary: 'Get Twitch user info',
        parameters: [{ name: 'login', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Twitch user data',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/twitch/UserFollows': {
      get: {
        tags: ['Twitch: User'],
        summary: 'Get a users Twitch follows',
        parameters: [{ name: 'login', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Get a users Twitch follows',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/twitch/UserFollowers': {
      get: {
        tags: ['Twitch: User'],
        summary: 'Get a users Twitch followers',
        parameters: [
          { name: 'login', in: 'query', required: true, schema: { type: 'string' } },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 10000, default: 100 },
            description: 'Number of followers to fetch, max 10,000. Defaults to 100.',
          },
        ],
        responses: {
          200: {
            description: 'Get a users Twitch followers',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/twitch/UserBadges': {
      get: {
        tags: ['Twitch: User'],
        summary: 'Get badges a user owns in a channel',
        parameters: [
          { name: 'login', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'channel', in: 'query', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'List of badges a user owns in a channel',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
     '/twitch/UserRecentFollows': {
      get: {
        tags: ['Twitch: User'],
        summary: 'Get a users recent Twitch follows',
        parameters: [{ name: 'login', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Get a users most recent Twitch follower and follow',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
     '/twitch/UserFirstFollows': {
      get: {
        tags: ['Twitch: User'],
        summary: 'Get a users first Twitch follows',
        parameters: [{ name: 'login', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Get a users first Twitch follower and follow',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/twitch/ModVip': {
      get: {
        tags: ['Twitch: Channel'],
        summary: 'Get Twitch channel moderators and VIPs',
        parameters: [{ name: 'login', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'List of moderators and VIPs',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/twitch/Founders': {
      get: {
        tags: ['Twitch: Channel'],
        summary: 'Get Twitch channel founders',
        parameters: [{ name: 'login', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'List of founders',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/twitch/PinnedMessage': {
      get: {
        tags: ['Twitch: Channel'],
        summary: 'Get channels pinned message',
        parameters: [{ name: 'login', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Pinned message data',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/twitch/ClipInfo': {
      get: {
        tags: ['Twitch: Channel'],
        summary: 'Get Twitch clip info',
        parameters: [{ name: 'slug', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Twitch clip info',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/twitch/GlobalBadges': {
      get: {
        tags: ['Twitch: Global'],
        summary: 'Get all global Twitch badges',
        responses: {
          200: {
            description: 'Returns all global badges on Twitch',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/twitch/Team': {
      get: {
        tags: ['Twitch: Global'],
        summary: 'Get a Twitch teams info',
        parameters: [{ name: 'team', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Twitch team data',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/twitch/UsernameAvailable': {
      get: {
        tags: ['Twitch: Global'],
        summary: 'Get if a Twitch username is available or not',
        parameters: [{ name: 'username', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Get if a Twitch username is available or not',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/twitch/GameInfo': {
      get: {
        tags: ['Twitch: Global'],
        summary: 'Get a Twitch games info',
        parameters: [{ name: 'name', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Twitch game info',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/7tv/UserInfo': {
      get: {
        tags: ['7TV: User'],
        summary: 'Get 7TV user info',
        parameters: [{ name: 'login', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Returns 7TV user info',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/7tv/UserSubscriptionInfo': {
      get: {
        tags: ['7TV: User'],
        summary: 'Get 7TV subscription info',
        parameters: [{ name: 'login', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Returns 7TV user subscription info',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/7tv/UserRoles': {
      get: {
        tags: ['7TV: User'],
        summary: 'Get users 7TV roles',
        parameters: [{ name: 'login', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Returns users 7TV roles',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/7tv/BadgesPaints': {
      get: {
        tags: ['7TV: Global'],
        summary: 'Get all 7TV badges and paints',
        responses: {
          200: {
            description: 'Returns 7TV badge and paint data',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/misc/Misc': {
      get: {
        tags: ['Misc'],
        summary: 'API info',
        responses: {
          200: {
            description: 'Returns ping and server info',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                },
              },
            },
          },
        },
      },
    },
  },
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use('/twitch', twitchRoutes);
app.use('/7tv', sevenTvRoutes);
app.use('/misc', miscRoutes);
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <html>
      <head>
        <title>API Root</title>
        <style>
          body {
            background-color: #121212;
            color: white;
            font-family: monospace;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-size: 1.2rem;
          }
        </style>
      </head>
      <body>
        {"docs found at /docs"}
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/docs`);
});
