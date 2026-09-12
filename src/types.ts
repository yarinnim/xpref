import type { Application, Request } from 'express';
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

type OpenGraphType = 'website' | 'article' | 'product' | 'profile'
  | 'music.song' | 'music.album' | 'music.playlist' | 'music.radio_station'
  | 'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other';

export type ArticleSubTag = 'article:published_time' | 'article:modified_time'
  | 'article:expiration_time' | 'article:author' | 'article:section' | 'article:tag';

export type ProfileSubTag = 'profile:first_name' | 'profile:last_name'
  | 'profile:username' | 'profile:gender';

export type ProductSubTag = 'product:brand' | 'product:availability' | 'product:condition'
  | 'product:price:amount' | 'product:price:currency' | 'product:retailer_item_id'
  | 'product:item_group_id' | 'product:sale_price:amount' | 'product:sale_price:currency'
  | 'product:sale_price_dates:start' | 'product:sale_price_dates:end' | 'product:category'
  | 'product:color' | 'product:material' | 'product:size' | 'product:pattern'
  | 'product:gender' | 'product:age_group' | 'product:plural_title'
  | 'product:weight:value' | 'product:weight:units'
  | 'product:shipping_weight:value' | 'product:shipping_weight:units'
  | 'product:shipping_cost:amount' | 'product:shipping_cost:currency'
  | 'product:original_price:amount' | 'product:original_price:currency'
  | 'product:pretax_price:amount' | 'product:pretax_price:currency'
  | 'product:custom_label_0' | 'product:custom_label_1' | 'product:custom_label_2'
  | 'product:custom_label_3' | 'product:custom_label_4';

export type MovieSubTag = 'video:actor' | 'video:actor:role' | 'video:director'
  | 'video:writer' | 'video:duration' | 'video:release_date' | 'video:tag' | 'video:series';

export type MusicSubTag = 'music:duration' | 'music:album' | 'music:album:disc'
  | 'music:album:track' | 'music:musician' | 'music:song' | 'music:song:disc'
  | 'music:song:track' | 'music:release_date' | 'music:creator';

export type SeoData = {
  title: string,
  description: string | null,
  imageUrl: string,

  siteName?: string,
  canonicalUrl?: string,
  mediaType?: OpenGraphType,
  redirectUrlJson?: string,
  template?: string,
};

export type SeoProps = {
  templatePath?: string,
  /* eslint-disable-next-line no-unused-vars */
  onData: (data: any, req: Request) => SeoData | Promise<SeoData>;

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
