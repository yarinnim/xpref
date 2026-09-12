import type { Application } from 'express';
import type { IncomingMessage } from 'http';

export type { IncomingMessage } from 'http';
export type { Request, Response, NextFunction, Application } from 'express';
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

type MethodHandlerAction = CallableFunction | CallableFunction[];

type Params = {
  query?: any,
  path?: any,
  body?: any,
};

export type MethodOptions = MethodHandlerAction | {
  action: MethodHandlerAction,
  params?: Params,
  description?: string | [string, string],
}

export type MethodHandler = {
  get?: MethodOptions,
  post?: MethodOptions,
  put?: MethodOptions,
  delete?: MethodOptions,
  patch?: MethodOptions,
};

export type PathMiddleware = Array<any>;
export type PathDetail = [string, PathMiddleware, MethodHandler]
  | [string, PathMiddleware, MethodHandler, Record<string, PathDetail>];

export type Route = Record<any, PathDetail>;

/* eslint-disable-next-line no-unused-vars */
type OnInit = (app: Application) => void;

type OpenGrapType = 'website' | 'article' | 'product' | 'profile'
  | 'music.song' | 'music.album' | 'music.playlist' | 'music.radio_station'
  | 'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other';

export type MovieSubTag = 'video.actor:role' | 'video:director' | 'video:writer'
  | 'video:duration' | 'video:release_date' | 'video:tag';

export type MusicSubTag = 'music:duration' | 'music:album' | 'music:album:disc'
  | 'music:album:track' | 'music:musician';

export type SeoData = {
  title: string,
  description: string | null,
  imageUrl: string,

  canonicalUrl?: string,
  mediaType?: OpenGrapType,
};

export type SeoProps = {
  templatePath?: string,
  onData: (data: any, req?: Request) => SeoData | Promise<SeoData>;

  site: {
    name: string,
    title: string,
    description: string,
    imageUrl: string,
    keywords: string,
  },
};

export type Xpref = {
  appName: string;
  appEnv: string;
  port?: number;
  routes: Route;

  logger?: any,
  staticRoutes?: Record<string, string>;
  interceptor?: any;
  onInit?: OnInit;

  schemas?: Record<string, any>,

  manuallyStart?: any,
  seo?: SeoProps,
};

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
