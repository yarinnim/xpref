/**
 * Request forwarder is to forwards the traffic to any defined
 * host/server. As the request is forwarded to specific host
 * server, so noly hostname or server ip address is defined
 * with it's prototol (http or https).
 */
import type { Request, Response } from '../types';
import type { RequestForwarder } from './types';
import { getUrl, onError, getRequestHandler } from './common';

const getHeaders = (req: any, headers: any = {}) => {
  const nextHeaders = {
    'forwarded-from': req.headers['host'],
    'forwarded-fequest-id': req.headers['Request-Id'] || req.headers['request-id'] || '',
    ...headers,
  };

  return nextHeaders;
};

const getRequestOptions = (req: Request, extraHeaders: any) => {
  const headers = { ...extraHeaders, ...req.headers };
  return { method: req.method, headers };
};

export default function requestFowarder(props: RequestForwarder) {
  const { headers = {} } = props;
  return function(req: Request, res: Response) {
    const url = getUrl(req, props);
    const extraHeaders = getHeaders(req, headers);
    const handler = getRequestHandler(url);
    const requestOptions = getRequestOptions(req, extraHeaders);

    const proxy = handler.request(url, requestOptions, (proxyResponse: any) => {
      res.writeHead(proxyResponse.statusCode, {
        ...proxyResponse.headers,
        'is-proxy': true,
      });
      proxyResponse.pipe(res);
    });
    proxy.on('error', onError);
    return req.pipe(proxy);
  };
}
