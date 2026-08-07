import type { Route } from '../types';
import { getMethodParameters } from './path-schema';

const defaultResponse = {
  200: {
    description: 'Operation completed successfully.',
  },
};

const decodePath = (path: string): string => path.replace(/:(\w*)/g, '{$1}');

const getMethodDescription = (methodHandler: any = {}) => {
  if (Array.isArray(methodHandler) || typeof methodHandler === 'function') {
    return {};
  }
  const { description = [] } = methodHandler;
  const [summary, desc = ''] = Array.isArray(description) ? description : [description, ''];
  return { summary, description: desc };
};

const getResponses = (methodProps: any = {}) => {
  const { responses = {} } = methodProps;
  const allResponse = { ...defaultResponse, ...responses };
  return Object.entries(allResponse).reduce((accu: any, response: any) => {
    const [code, res] = response;
    const touchedResponse = { contentType: 'application/json', ...res };
    return { ...accu, [code]: touchedResponse };
  }, {});
};

const getMethodPath = (tag: string, methodProps: any) => {
  const desc = getMethodDescription(methodProps);
  const params = getMethodParameters(methodProps);
  const responses = getResponses(methodProps);
  return {
    responses,
    tags: [tag],
    ...desc,
    ...params,
  };
};

const generateMethodsPath = (props: Record<string, any>, { tag }: any): any => {
  const methods = Object.keys(props);
  return methods.reduce((carry, method) => {
    const methodDetail = props[method];
    const result = {
      ...carry,
      [method]: getMethodPath(tag, methodDetail),
    };
    return result;
  }, {});
};

const generatePath = (pPath: string, pathProps: any, { parentTag = false } = {}): any => {
  const path = decodePath(pPath);
  const [tag, middlewares, methodHandler, children = {}] = pathProps;
  const curTag = parentTag || tag;
  const result = {
    [path]: generateMethodsPath(methodHandler, { tag: curTag, middlewares }),
  };
  const childPaths = Object.keys(children);
  if (childPaths.length === 0) return result;

  const paths = childPaths.reduce((carry, childPath) => {
    const childProps = children[childPath];
    return {
      ...carry,
      ...generatePath(`${path}${childPath}`, childProps, { parentTag: curTag }),
    };
  }, result);
  return paths;
};

export default function getPaths(routes: Route): any {
  const paths = Object.keys(routes);
  const pathResult = paths.reduce((carry: any, path: string): any => {
    const pathProps = routes[path];
    return {
      ...carry,
      ...generatePath(path, pathProps),
    };
  }, {});
  return pathResult;
}
