import { Router, Application } from 'express';
import { Route, PathDetail, HttpMethod, MethodOptions } from './types';

const getMethodHandlers = (handlerOptions: MethodOptions, options: any = {}) => {
  if (Array.isArray(handlerOptions)) return handlerOptions;
  if (typeof handlerOptions === 'function') return [handlerOptions];
  const { action, params } = handlerOptions;
  if (!(params || false)) return Array.isArray(action) ? action : [action];

  const { validator } = options;
  const validatorMiddleware = validator({ params });
  const methodHandlers = Array.isArray(action) ? action : [action];
  return[validatorMiddleware, ... methodHandlers];
};
/**
 * Registers the verb handlers to routes
 * @property {any} handlers
 * @property {any} router
 */
const registerHandler = ({ handlers, router }: any, options: any = {}) => {
  const methods = Object.keys(handlers) as Array<HttpMethod>;
  const path = '/';
  methods.forEach((method) => {
    const methodHandlers = handlers[method];
    const callbacks = getMethodHandlers(methodHandlers, options);
    router[method](path, ...callbacks);
  });
};

/**
 * Creates router for path information
 * @param {PathDetail} pathDetail - The path default defined after uri
 * @return router
 */
const createRouter = (pathHandler: PathDetail, options: any): any => {
  const router = Router({ mergeParams: true });
  const [_name, middlewares, handlers, children = {}] = pathHandler;
  if (middlewares.length > 0) router.use(...middlewares);
  registerHandler({ handlers, router }, options);

  const childPaths = Object.keys(children);
  if (childPaths.length === 0) return router;

  childPaths.forEach((childPath: any) => {
    const childRouter = createRouter(children[childPath], options);
    router.use(childPath, childRouter);
  });

  return router;
};

type RouteOptions = {
  validator: CallableFunction,
};
/**
 * Registers routes configuration, the way to register routes
 * is based on route base, not url base
 * @param {Application} app - Express Application
 * @param {Route} routes - Routes configuration
 */
export default function registerRoutes(app: Application, routes: Route, options: RouteOptions) {
  const paths = Object.keys(routes);
  paths.forEach((path: string) => {
    const pathDetail: PathDetail = routes[path];
    const router = createRouter(pathDetail, options);
    app.use(path, router);
  });
}
