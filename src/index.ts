/* eslint-disable no-console */
import express, { json, Application, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import type { API } from './types';
import registerRouters from './router';
import registerStatic from './static';
import requestLog, { getReqId } from './request-log';
import requestIdMiddleware from './request-id';
import createValidator from './validator/method-validator';

const getProps = (pProps: API): API => ({
  port: 3000,
  ...pProps,
});

const showAppInfo = (props: any) => {
  const { name, env, port } = props;
  const msg = [
    '------------ API Started ----------',
    ` Name: ${name}`,
    ` Env: ${env}`,
    ` Port: ${port}`,
    '------------------------------------',
  ].join('\n');
  console.log(msg);
};

/*
const startApp = (
  app: Application,
  port: any,
  routes: any,
): Promise<any> => new Promise((resolve) => {

  app.listen(port, () => {
    resolve({ port });
  }).on('error', (error: any) => {
    const { code } = error;
    if (code === 'EADDRINUSE') startApp(app, parseInt(port, 10) + 1, routes);
  });
});
*/

export default function api(pProps: API, tried: number = 0): any {
  const {
    appName,
    appEnv,
    routes,
    port,
    manuallyStart,
    schemas = {},
    staticRoutes = {},
    onInit = false,
    interceptor = false,
    logger = false,
  } = getProps(pProps);
  const app: Application = express();

  if (onInit) onInit(app);

  app.use(cors());
  app.use(helmet());
  app.use(json({ limit: '8mb' }));
  app.use(urlencoded({ extended: true }));
  app.set('trust proxy', true);

  if (interceptor) interceptor(app);

  app.use(requestIdMiddleware());
  app.use(requestLog(logger, { appName, appEnv }));
  registerStatic(app, staticRoutes);
  const validator = createValidator(schemas);
  registerRouters(app, routes, { validator });

  const startManually = manuallyStart || false;
  if (startManually) {
    return Promise.resolve(startManually({
      app,
      port,
    }));
  }

  const thePort: Number = Number(port) + tried;
  return new Promise((resolve) => {
    console.log(`[INFO] Starting application on port ${thePort}`);
    app.listen(thePort, () => {
      showAppInfo({ name: appName, env: appEnv, port });
      resolve({ port: thePort, app });
    }).on('error', (error: any) => {
      const { code } = error;
      console.log(`[Info] Port ${thePort} already in used...`);
      if (code === 'EADDRINUSE') resolve(api(pProps, tried + 1));
    });
  });
}

export {
  urlencoded,
  type Request,
  type Response,
  type NextFunction,
  type Application,
} from 'express';

export const getRequestId = getReqId;
export * from './types';
export { default as i18n } from './i18n';
