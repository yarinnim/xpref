# xpref

Express.js application bootstrap for APIs — nested routing, request validation, OpenAPI docs, idempotency, proxying, and i18n.

## Features

### Core server
- Express 5 app bootstrap with a single `xpref()` call
- Automatic port fallback when the configured port is in use
- Manual start control via `manuallyStart`
- `onInit` hook (runs before built-in middleware)
- `interceptor` hook (runs after built-in middleware, before routes)
- Startup banner with app name, environment, and port
- TypeScript-first types and exports

### Security & request pipeline
- Helmet security headers
- CORS enabled
- Trust proxy enabled
- JSON body parsing (8MB limit)
- URL-encoded body parsing
- Unique request ID (`Request-Id` / `request-id`) on every request and response
- `getRequestId()` helper to read the current request ID

### Routing
- Declarative nested route trees (parent path + children)
- Per-route middleware arrays
- HTTP methods: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`
- Handler as a function, array of functions, or `{ action, params, description }`
- Static file serving via `staticRoutes`

### Request validation (AJV)
- Shared schemas via the top-level `schemas` option
- Per-method validation for `query`, `path` (`params`), and `body`
- Type coercion, `$data`, and `ajv-errors` support
- Human-readable field error messages (400 responses)

### Request logging
- Morgan console access logs (app name, env, request ID, method, status, URL, timing, user-agent)
- Optional external logger integration (e.g. `@core/log-client`)
- Structured log payload: request ID, IP, country, language, device ID, origin, referer, and base64 body for non-GET

### OpenAPI / Swagger (`xpref/api-docs`)
- OpenAPI 3.0 document generation from routes and schemas
- Swagger UI middleware (`swagger-ui-express`)
- Tags and external docs metadata
- Bearer (JWT) and API key security schemes

### Idempotency (`xpref/idempotency`)
- POST-only idempotency via `idempotency-key` header (UUID v4)
- Optional enforcement per route
- Configurable TTL (default 5 minutes)
- In-progress (`202`), cached success replay, and expired (`410`) responses
- Optional `validateResponse` callback for custom success rules
- JSON and `x-www-form-urlencoded` bodies

### Request forwarder / proxy (`xpref/request-forwarder`)
- `forwarder` — proxy HTTP/HTTPS upstream with body forwarding
- `proxy` — stream pipe to upstream
- Custom host, `proxyPrefix`, `withPrefix`, extra headers
- `onUrlConstructed` URL rewrite hook
- `passToNext` — collect upstream result and continue the middleware chain

### Internationalization (`xpref/i18n`)
- Locale JSON files loaded at init
- `translate(key, replace?, lang?)` with `{placeholder}` substitution
- Fallback language support (`fallbackLang`, `fallbackLangOnly`)

## Usage

### Basic server setup

```typescript
import xpref from 'xpref';

xpref({
  appName: 'my-app',
  appEnv: 'development',
  port: 3000,
  routes: {
    '/api/users': [
      'users',
      [],
      {
        get: (req, res) => {
          res.json({ users: [] });
        },
      },
      {},
    ],
  },
}).then(({ port, app }) => {
  console.log(`Server running on port ${port}`);
});
```

### Nested routes and middleware

```typescript
xpref({
  appName: 'my-app',
  appEnv: 'development',
  port: 3000,
  interceptor: (app) => {
    app.use((req, res, next) => {
      console.log('Custom middleware');
      next();
    });
  },
  routes: {
    '/api/users': [
      'users',
      [],
      {
        get: (req, res) => res.json({ users: [] }),
        post: (req, res) => res.json({ message: 'User created' }),
      },
      {
        '/:id': [
          'user-by-id',
          [authMiddleware],
          {
            get: (req, res) => res.json({ id: req.params.id }),
            put: (req, res) => res.json({ message: 'Updated' }),
            delete: (req, res) => res.json({ message: 'Deleted' }),
          },
        ],
      },
    ],
  },
});
```

### Request validation

```typescript
xpref({
  appName: 'my-app',
  appEnv: 'development',
  port: 3000,
  schemas: {
    email: { type: 'string', format: 'email' },
    name: { type: 'string', minLength: 1 },
  },
  routes: {
    '/api/users': [
      'users',
      [],
      {
        post: {
          description: 'Create a user',
          params: {
            body: {
              type: 'object',
              properties: ['email', 'name'],
              required: ['email', 'name'],
            },
          },
          action: (req, res) => {
            res.json({ message: 'User created', ...req.body });
          },
        },
      },
    ],
  },
});
```

### With request logging

```typescript
import xpref from 'xpref';
import { createLogger } from '@core/log-client';

const logger = createLogger({
  appName: 'my-app',
  appEnv: 'development',
});

xpref({
  appName: 'my-app',
  appEnv: 'development',
  port: 3000,
  logger,
  routes: {
    '/api/logs': [
      'logs',
      [],
      {
        get: (req, res) => res.json({ logs: [] }),
      },
    ],
  },
});
```

### Static files

```typescript
xpref({
  appName: 'my-app',
  appEnv: 'development',
  port: 3000,
  staticRoutes: {
    '/public': './public',
    '/uploads': './uploads',
  },
  routes: {
    '/api/files': [
      'files',
      [],
      {
        get: (req, res) => res.json({ files: [] }),
      },
    ],
  },
});
```

### Manual start

```typescript
xpref({
  appName: 'my-app',
  appEnv: 'development',
  port: 3000,
  manuallyStart: ({ app, port }) =>
    new Promise((resolve) => {
      const server = app.listen(port, () => {
        resolve({ port, app, server });
      });
    }),
  routes: {
    '/api/health': [
      'health',
      [],
      {
        get: (req, res) => res.json({ status: 'ok' }),
      },
    ],
  },
});
```

### Idempotency

```typescript
import type { Route } from 'xpref';
import idempotency from 'xpref/idempotency';

const routes = {
  '/wallets': [
    'wallets',
    [],
    {},
    {
      '/transfer': [
        'transfer',
        [idempotency({ enforced: true, ttl: 300 })],
        {
          post: walletTransferAction,
        },
      ],
    },
  ],
} as Route;
```

Clients send `idempotency-key: <uuid-v4>` on POST. Retry on `5xx`, `422`, `429`, and similar failures with exponential backoff.

### Request forwarder / proxy

```typescript
import { forwarder, proxy } from 'xpref/request-forwarder';

// As middleware: forward and respond from upstream
app.use('/upstream', forwarder({
  host: 'https://api.example.com',
  proxyPrefix: '/v1',
  headers: { 'x-api-key': 'secret' },
}));

// Collect upstream result and continue the chain
app.use('/gateway', forwarder({
  host: 'https://api.example.com',
  passToNext: true,
}), (req, res) => {
  // Upstream status/headers/body available via applyProxyResultToRequest
  res.json({ ok: true });
});

// Stream pipe proxy
app.use('/proxy', proxy({
  host: 'https://api.example.com',
  withPrefix: true,
  onUrlConstructed: (url) => url.replace(/\/+$/, ''),
}));
```

### i18n

```typescript
import { i18n } from 'xpref';

const t = i18n({
  locale: {
    en: './locales/en.json',
    km: './locales/km.json',
  },
  fallbackLang: 'en',
});

t('welcome.message', { name: 'Ada' }, 'en');
```

### OpenAPI / Swagger UI

```typescript
import setupApiDocs from 'xpref/api-docs';

const [serve, setup] = setupApiDocs(
  {
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API documentation',
    },
    bearerAuth: true,
    apiKeys: ['x-api-key'],
    tags: {
      users: { description: 'User endpoints' },
    },
  },
  { routes, schemas },
);

app.use('/docs', serve, setup);
```

## API reference

### `xpref(props: Xpref): Promise<{ port: number; app: Application }>`

| Option | Type | Description |
| --- | --- | --- |
| `appName` | `string` | Application name |
| `appEnv` | `string` | Environment (e.g. `development`, `production`) |
| `port` | `number` | Listen port (default `3000`; auto-increments if in use) |
| `routes` | `Route` | Nested route configuration |
| `schemas` | `Record<string, any>` | Shared AJV schemas for method validation |
| `staticRoutes` | `Record<string, string>` | URL path → filesystem path |
| `logger` | `any` | Optional logger factory used by request logging |
| `onInit` | `(app) => void` | Hook before built-in middleware |
| `interceptor` | `(app) => void` | Hook after built-in middleware |
| `manuallyStart` | `({ app, port }) => Promise` | Skip auto-listen; start the server yourself |

### Route configuration

```typescript
type MethodOptions =
  | CallableFunction
  | CallableFunction[]
  | {
      action: CallableFunction | CallableFunction[];
      params?: { query?: any; path?: any; body?: any };
      description?: string | [string, string];
    };

type PathDetail = [
  string, // route name
  any[], // middleware
  MethodHandler, // get/post/put/delete/patch
  Record<string, PathDetail>?, // children
];

type Route = Record<string, PathDetail>;
```

### Exports

| Export | From | Description |
| --- | --- | --- |
| default `xpref` | `xpref` | Create and start the app |
| `getRequestId` | `xpref` | Read request ID from a request |
| `i18n` | `xpref` | Initialize translations |
| Express types / `urlencoded` | `xpref` | Re-exported for convenience |
| `idempotency` | `xpref/idempotency` | Idempotency middleware |
| `setupApiDocs` | `xpref/api-docs` | OpenAPI + Swagger UI |
| `forwarder`, `proxy` | `xpref/request-forwarder` | Upstream proxy helpers |

## Example project structure

```
src/
  ├── routes/
  │   ├── users.ts
  │   └── auth.ts
  ├── middleware/
  │   └── auth.ts
  ├── locales/
  │   └── en.json
  ├── static/
  │   └── public/
  └── index.ts
```

```typescript
// src/index.ts
import xpref from 'xpref';
import { createLogger } from '@core/log-client';
import userRoutes from './routes/users';
import authRoutes from './routes/auth';
import authMiddleware from './middleware/auth';

const logger = createLogger({
  appName: 'my-api',
  appEnv: process.env.NODE_ENV || 'development',
});

xpref({
  appName: 'my-api',
  appEnv: process.env.NODE_ENV || 'development',
  port: 3000,
  staticRoutes: {
    '/public': './static/public',
  },
  interceptor: (app) => {
    app.use('/api/protected', authMiddleware);
  },
  logger,
  routes: {
    ...userRoutes,
    ...authRoutes,
  },
}).then(({ port }) => {
  console.log(`Server running on port ${port}`);
});
```

## License

ISC
