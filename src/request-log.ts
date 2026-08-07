import morgan from 'morgan';
import { type Request, type Response } from './index';
import logDebug from './debug';

export const getReqId = (req: Request) => {
  const { headers } = req;
  return headers['Request-Id'] || headers['request-id'] || 'N/A';
};

const getLanguage = (req: Request): string => {
  const { headers } = req;
  const language: string | string[] = headers['language'] || req.acceptsLanguages();
  if (Array.isArray(language)) {
    const [userLang] = language;
    return userLang;
  }

  try {
    const langData = JSON.parse(language);
    const { language: lang } = langData;
    return lang;
  } catch {
    return language;
  }
};

const getLogInfo = (req: Request, res: Response) => {
  const reqId = getReqId(req);
  const { headers, method } = req;

  const logInfo = {
    requestId: reqId,
    userAgent: headers['user-agent'],
    deviceId: headers['device-id'],
    country: headers['cf-ipcountry'] || headers['ipcountry'] || headers['country'] || 'N/A',
    language: getLanguage(req),
    origin: headers['origin'],
    referer: headers['referer'],

    ip: req.ip,
    url: req.originalUrl,
    statusCode: res.statusCode,
    method,
  };

  if (method === 'GET') return logInfo;

  const strBody = JSON.stringify(req.body || {});
  const encodedBody = Buffer.from(strBody).toString('base64');
  return {
    ...logInfo,
    body: encodedBody,
  };
};

const writeToLogger = (req: any, res: any, logger: any) => {
  if (!(logger || false)) return false;
  try {
    const logInfo = getLogInfo(req, res);
    logger().log(logInfo, { severity: 'request-log' });
    return true;
  } catch (error: any) {
    logDebug(error);
    return false;
  }
};

export default function loggerMiddleware(logger: any, props: any) {
  const { appName, appEnv } = props;

  return morgan((tokens: any, req: any, res: any): string => {
    const reqId = getReqId(req);
    const timer = setTimeout(() => {
      writeToLogger(req, res, logger);
      clearTimeout(timer);
    }, 10);

    return [
      `${appName}[${appEnv}] -`,
      `[${reqId}]`,
      tokens.method(req, res),
      tokens.status(req, res),
      tokens.url(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens['user-agent'](req, res),
    ].join(' ');
  });
}
