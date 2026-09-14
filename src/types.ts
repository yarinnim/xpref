import type { Application } from 'express';
import type { SeoProps } from './seo/types';

export type { IncomingMessage } from 'http';
export type { Request, Response, NextFunction, Application, RequestHandler } from 'express';
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
