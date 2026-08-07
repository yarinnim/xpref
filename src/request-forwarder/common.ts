/**
 * Request forwarder is to forwards the traffic to any defined
 * host/server. As the request is forwarded to specific host
 * server, so noly hostname or server ip address is defined
 * with it's prototol (http or https).
 */

/* eslint-disable no-console */
import http from 'http';
import https from 'https';

export const getRequestHandler = (host: string) => {
  const protocol = new URL(host).protocol;
  return protocol === 'https:' ? https : http;
};

export const onError = (error: any) => {
  const { message = 'Unknown error' } = error;
  console.error(`[ERROR] Request Forwarder - ${message}`);
};

export const getUrl = (req: any, props: any) => {
  const { baseUrl, url } = req;
  const cleanUrl = url === '/' ? '' : url;
  const {
    proxyPrefix = '', withPrefix = false, host,
    onUrlConstructed,
  } = props;
  const prefix = withPrefix ? baseUrl : '';
  const proxyUrl = `${host}${proxyPrefix}${prefix}${cleanUrl}`;
  return onUrlConstructed
    ? onUrlConstructed(proxyUrl)
    : proxyUrl;
};
