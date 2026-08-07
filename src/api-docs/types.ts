type Info = {
  version: string,
  title: string,
  description: string
};

type ExternalDocs = {
  description: string
  url: string
};

export type Tag = {
  description: string,
  externalDocs?: ExternalDocs,
};

export type APIKey = Array<string | string[]>;

export type APIDocs = [any, CallableFunction];

export type APIDocsOptions = {
  routes: Record<string, any>,
  schemas: Record<string, any>,
};

export type APIDocsProps = {
  info: Info
  tags?: Record<string, Tag>
  bearerAuth?: boolean
  apiKeys?: APIKey
  paths?: any
};
