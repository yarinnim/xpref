/**
 * Request forwarder is to forwards the traffic to any defined
 * host/server. As the request is forwarded to specific host
 * server, so noly hostname or server ip address is defined
 * with it's prototol (http or https).
 */
import type { IncomingMessage } from 'http';
import queryString from 'node:querystring';
import type {
  RequestForwarder,
    Response,
    Request,
    NextFunction,
    ProxyResult,
} from '../types';
import { getUrl, getRequestHandler, onError } from './common';
import { collectProxyResult, applyProxyResultToRequest } from './pass-to-next';

const getBodyData = (req: any) => {
  const { method, body = {} } = req;
  if (method.toUpperCase() === 'GET') return JSON.stringify(body);

  const reqBody = req.is('json')
    ? JSON.stringify(body)
    : queryString.stringify(body);

  return reqBody;
};

const writeRequest = (client: any, req: Request, bodyData: any) => {
  const { method } = req;
  if (method.toUpperCase() === 'GET') return false;

  client.write(bodyData);
  return true;
};

const getHeaders = (req: any, props: RequestForwarder) => {
  const { headers: propHeaders } = props;
  const { headers = {} } = req;
  const { 'content-length': _cl, ...cleanedHeaders } = headers;
  const nextHeaders = {
    'forwarded-from': req.headers['host'],
    'forwarded-fequest-id': req.headers['Request-Id'] || req.headers['request-id'] || '',
    ...cleanedHeaders,
    ...propHeaders,
  };

  return nextHeaders;
};

const getRequestOptions = (req: Request, props: RequestForwarder, bodyData: string) => {
  const headers = getHeaders(req, props);
  const { method } = req;
  const touchedHeaders = method.toUpperCase() === 'GET'
    ? headers
    : { ...headers, 'Content-Length': Buffer.byteLength(bodyData) };

  return {
    method: req.method,
    headers: touchedHeaders,
  };
};

export default function requestFowarder(props: RequestForwarder) {
  const { passToNext = false } = props;
  return function(req: Request, res: Response, next: NextFunction) {
    const url = getUrl(req, props);
    const handler = getRequestHandler(url);
    const bodyData: string = getBodyData(req);

    const requestOptions = getRequestOptions(req, props, bodyData);

    const proxy = handler.request(url, requestOptions, (proxyResponse: any) => {
      if (passToNext) {
        return collectProxyResult(proxyResponse)
          .then((result: ProxyResult) => {
            applyProxyResultToRequest(req, res, result);
            next();
          })
          .catch((error: Error) => next(error));
      }

      res.writeHead(proxyResponse.statusCode, {
        ...proxyResponse.headers,
        'is-proxy': true,
      });

      return proxyResponse.pipe(res);
    });

    proxy.on('error', (error: Error) => {
      if (passToNext) {
        next(error);
        return;
      }
      onError(error);
    });
    writeRequest(proxy, req, bodyData);
    return req.pipe(proxy);
  };
}
