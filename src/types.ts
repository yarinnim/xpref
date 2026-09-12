import type { Application } from 'express';
import type { IncomingMessage } from 'http';
import type { SeoProps } from './seo/types';

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

export type {
  OpenGraphType,
  ArticleSubTag,
  ProfileSubTag,
  ProductSubTag,
  MovieSubTag,
  MusicSubTag,
  SeoData,
  SeoProps,
} from './seo/types';
