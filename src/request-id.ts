/**
 * The middleware is to inject the Request Id (UUID format)
 * to identify the each request based on that ID.
 * The process is to inject the ``Request-Id`` into the headers
 * Request object, and Response object.
 */

import { randomUUID } from 'crypto';

export default function requestIdMiddleware() {
  return (req: any, res: any, next: any) => {
    const uuid = randomUUID();
    const { headers } = req;
    req.headers = { ...headers, 'Request-Id': uuid };
    res.setHeader('request-id', uuid);
    next();
  };
}
