# API Package

A powerful Express.js server setup package that provides a simple interface for creating and configuring Express applications with built-in security, logging, and routing features.

## Features

- Automatic port management with fallback
- Built-in security with Helmet
- CORS support
- Request logging with log-client integration
- Request ID tracking
- Static file serving
- Route registration
- Custom middleware support
- TypeScript support

## Usage

### Basic Server Setup

```typescript
import xpref from 'xpref';

// Basic server setup
xpref({
  appName: 'my-app',
  appEnv: 'development',
  port: 3000,
  routes: {
    '/api/users': [
      'users', // route name
      [], // middleware array
      {
        get: (req, res) => {
          res.json({ users: [] });
        }
      },
      {} // children routes
    ]
  }
}).then(({ port, app }) => {
  console.log(`Server running on port ${port}`);
});
```

### With Request Logging

```typescript
import xpref from 'xpref';
import { createLogger } from '@core/log-client';

// Create a logger instance
const logger = createLogger({
  appName: 'my-app',
  appEnv: 'development'
});

xpref({
  appName: 'my-app',
  appEnv: 'development',
  port: 3000,
  logger, // Pass the logger instance
  routes: {
    '/api/logs': [
      'logs',
      [],
      {
        get: (req, res) => {
          res.json({ logs: [] });
        }
      },
      {}
    ]
  }
});
```

### With Multiple Routes and Methods

```typescript
xpref({
  appName: 'my-app',
  appEnv: 'development',
  port: 3000,
  routes: {
    '/api/users': [
      'users',
      [], // middleware array
      {
        get: (req, res) => {
          res.json({ users: [] });
        },
        post: (req, res) => {
          res.json({ message: 'User created' });
        }
      },
      {
        '/create': [
          'create-user',
          [], // middleware array
          {
            post: (req, res) => {
              res.json({ message: 'User created' });
            }
          },
          {}
        ]
      }
    ],
    '/api/auth': [
      'auth',
      [], // middleware array
      {
        post: (req, res) => {
          res.json({ token: 'jwt-token' });
        }
      },
      {}
    ]
  }
});
```

### With Static Files

```typescript
xpref({
  appName: 'my-app',
  appEnv: 'development',
  port: 3000,
  staticRoutes: {
    '/public': './public',
    '/uploads': './uploads'
  },
  routes: {
    '/api/files': [
      'files',
      [],
      {
        get: (req, res) => {
          res.json({ files: [] });
        },
        post: (req, res) => {
          res.json({ message: 'File uploaded' });
        },
        put: (req, res) => {
          res.json({ message: 'File updated' });
        },
        delete: (req, res) => {
          res.json({ message: 'File deleted' });
        }
      },
      {}
    ]
  }
});
```

### With Custom Middleware

```typescript
xpref({
  appName: 'my-app',
  appEnv: 'development',
  port: 3000,
  interceptor: (app) => {
    // Add custom middleware
    app.use((req, res, next) => {
      console.log('Custom middleware');
      next();
    });
  },
  routes: {
    '/api/protected': [
      'protected',
      [authMiddleware], // route-specific middleware
      {
        get: (req, res) => {
          res.json({ data: 'Protected route' });
        },
        post: (req, res) => {
          res.json({ data: 'Protected route created' });
        },
        put: (req, res) => {
          res.json({ data: 'Protected route updated' });
        },
        delete: (req, res) => {
          res.json({ data: 'Protected route deleted' });
        }
      },
      {}
    ]
  }
});
```

### With Manual Start Control

```typescript
xpref({
  appName: 'my-app',
  appEnv: 'development',
  port: 3000,
  manuallyStart: ({ app, port }) => {
    // Custom server start logic
    return new Promise((resolve) => {
      const server = app.listen(port, () => {
        resolve({ port, app, server });
      });
    });
  },
  routes: {
    '/api/health': [
      'health',
      [],
      {
        get: (req, res) => {
          res.json({ status: 'ok' });
        }
      },
      {}
    ]
  }
});
```

## API Reference

### `xpref(props: API): Promise<{ port: number, app: Application }>`

Creates and configures an Express application.

#### Parameters

- `props`: Configuration object
  - `appName`: Name of your application
  - `appEnv`: Environment (development, production, etc.)
  - `port`: Port number (default: 3000)
  - `routes`: Object mapping routes to their configurations
  - `staticRoutes`: Object mapping static file paths
  - `manuallyStart`: Function for custom server start logic
  - `interceptor`: Function to add custom middleware
  - `logger`: LogClient instance from @core/log-client package

### Route Configuration

```typescript
type Handler = {
  get?: (req: Request, res: Response, next: NextFunction) => void;
  post?: (req: Request, res: Response, next: NextFunction) => void;
  put?: (req: Request, res: Response, next: NextFunction) => void;
  delete?: (req: Request, res: Response, next: NextFunction) => void;
  patch?: (req: Request, res: Response, next: NextFunction) => void;
};

type RouteConfig = [
  string, // route name
  Array<(req: Request, res: Response, next: NextFunction) => void>, // middleware array
  Handler, // handler object with HTTP methods
  Record<string, RouteConfig> // children routes
];

type Routes = {
  [path: string]: RouteConfig;
};
```

### Static Route Configuration

```typescript
type StaticRoutes = {
  [path: string]: string; // Maps URL path to file system path
};
```

## Built-in Features

### Security
- Helmet.js for security headers
- CORS enabled
- Trust proxy enabled
- JSON body parsing (8MB limit)
- URL-encoded body parsing

### Request Tracking
- Unique request ID generation
- Request logging with log-client integration
- Request ID middleware

### Error Handling
- Automatic port fallback if port is in use
- Error handling for server startup

## Example Project Structure

```
src/
  ├── routes/
  │   ├── users.ts
  │   └── auth.ts
  ├── middleware/
  │   └── auth.ts
  ├── static/
  │   └── public/
  └── index.ts
```

```typescript
// src/routes/users.ts
export default {
  '/api/users': [
    'users',
    [],
    {
      get: (req, res) => {
        res.json({ users: [] });
      },
      post: (req, res) => {
        res.json({ message: 'User created' });
      }
    },
    {
      '/create': [
        'create-user',
        [],
        {
          post: (req, res) => {
            res.json({ message: 'User created' });
          }
        },
        {}
      ]
    }
  ]
};

// src/routes/auth.ts
export default {
  '/api/auth': [
    'auth',
    [],
    {
      post: (req, res) => {
        res.json({ token: 'jwt-token' });
      }
    },
    {}
  ]
};

// src/index.ts
import xpref from 'xpref';
import { createLogger } from '@core/log-client';
import userRoutes from './routes/users';
import authRoutes from './routes/auth';
import authMiddleware from './middleware/auth';

// Create logger instance
const logger = createLogger({
  appName: 'my-api',
  appEnv: process.env.NODE_ENV || 'development'
});

xpref({
  appName: 'my-api',
  appEnv: process.env.NODE_ENV || 'development',
  port: 3000,
  staticRoutes: {
    '/public': './static/public'
  },
  interceptor: (app) => {
    // Add authentication middleware
    app.use('/api/protected', authMiddleware);
  },
  logger, // Pass the logger instance
  routes: {
    ...userRoutes,
    ...authRoutes
  }
}).then(({ port }) => {
  console.log(`Server running on port ${port}`);
});
```

## License

MIT

