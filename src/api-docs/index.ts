import { serve, setup } from 'swagger-ui-express';
import type { APIDocs, APIDocsProps, APIDocsOptions } from './types';
import setSecurity from './security';
import getPaths from './path';
import initSchemas from './schema';

const getTags = (tags: any): any[] => {
  const tagNames = Object.keys(tags);
  return tagNames.reduce((acc: any, name: string) => {
    const tag = tags[name] || {};
    return [...acc, { name, ...tag }];
  }, []);
};

export default function setupApiDocs(apiDocs: APIDocsProps, options: APIDocsOptions): APIDocs {
  const { routes, schemas } = options;
  const {
    bearerAuth = false,
    tags = {},
    apiKeys = [],
  } = apiDocs;
  const [securitySchemas, security] = setSecurity({ bearerAuth, apiKeys });
  const touchedSchemas = initSchemas(schemas);
  const components = { schemas: touchedSchemas, ...securitySchemas };
  const paths = getPaths(routes);

  const docs = {
    openapi: '3.0.0',
    ...apiDocs,
    paths,
    tags: getTags(tags),
    components,
    security,
  };

  return [serve, setup(docs)];
}

export * from './types';
