require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const twitchRoutes = require('./routes/twitch');
const sevenTvRoutes = require('./routes/seventv'); // new

const app = express();
const port = 3000;

app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const memoryUsedMB = process.memoryUsage().heapUsed / 1024 / 1024;

    console.log(
      `${req.method} ${req.originalUrl} - ${duration} ms - ${memoryUsedMB.toFixed(2)} MB`
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
    { name: 'Twitch', description: 'Twitch endpoints' },
    { name: '7TV', description: '7TV endpoints' },
  ],
  paths: {
    '/twitch/userinfo': {
      get: {
        tags: ['Twitch'],
        summary: 'Get combined Twitch user info',
        parameters: [{ name: 'login', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Basic Twitch user data',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/twitch/modvip': {
      get: {
        tags: ['Twitch'],
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
    '/twitch/founders': {
      get: {
        tags: ['Twitch'],
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
    '/twitch/pinnedmessage': {
      get: {
        tags: ['Twitch'],
        summary: 'Get channels pinned message',
        parameters: [{ name: 'login', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Get channels pinned message',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/twitch/userfollows': {
      get: {
        tags: ['Twitch'],
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
    '/twitch/userfollowers': {
  get: {
    tags: ['Twitch'],
    summary: 'Get a users Twitch followers',
    parameters: [
      { name: 'login', in: 'query', required: true, schema: { type: 'string' } },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: { type: 'integer', minimum: 1, maximum: 10000, default: 100 },
        description: 'Number of followers to fetch, max 10,000 (large requests may take some time). Defaults to 100.',
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
    '/twitch/userbadges': {
      get: {
        tags: ['Twitch'],
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
    '/twitch/globalbadges': {
      get: {
        tags: ['Twitch'],
        summary: 'Get all global Twitch badges',
        responses: {
          200: {
            description: 'Returns all global badges on Twitch',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/twitch/team': {
      get: {
        tags: ['Twitch'],
        summary: 'Get a user’s Twitch team info',
        parameters: [{ name: 'team', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Get a user’s Twitch team info',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/twitch/gameinfo': {
      get: {
        tags: ['Twitch'],
        summary: 'Get a Twitch games info',
        parameters: [{ name: 'name', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Get a Twitch games info',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/7tv/userinfo': {
      get: {
        tags: ['7TV'],
        summary: 'Get 7TV user info',
        parameters: [{ name: 'login', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Returns 7TV user info',
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
    '/7tv/badgespaints': {
      get: {
        tags: ['7TV'],
        summary: 'Get all 7TV badges and paints',
        responses: {
          200: {
            description: 'Returns 7TV badge and paint data',
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
    '/7tv/usersubscriptioninfo': {
      get: {
        tags: ['7TV'],
        summary: 'Get 7TV subscription info',
        parameters: [{ name: 'login', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Returns 7TV user subscription info',
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
    '/7tv/userroles': {
      get: {
        tags: ['7TV'],
        summary: 'Get users 7TV roles',
        parameters: [{ name: 'login', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Returns users 7TV roles',
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

// Swagger docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// API routes
app.use('/twitch', twitchRoutes);
app.use('/7tv', sevenTvRoutes);

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


// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/docs`);
});
