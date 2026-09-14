import type { IncomingMessage } from 'http';

export type RequestForwarder = {
  host: string;
  proxyPrefix?: string; // To inject automatically the proxy url
  withPrefix?: boolean; // To identify if the proxyPrefix is added with next request
  headers?: Record<string, string|boolean|number>;

  /* eslint-disable no-unused-vars */
  onUrlConstructed?: (url: string) => string;
  passToNext?: boolean;
};

export type ProxyResult = {
  statusCode: number;
  headers: IncomingMessage['headers'];
  body: Buffer;
};
