import type { Request, Response } from '../types';
import type { ProxyResult } from './types'; 
import type { IncomingMessage } from 'http';

type NormalizedProxyHeaders = Record<string, string | string[]>;

const normalizeProxyHeaders = (headers: IncomingMessage['headers']): NormalizedProxyHeaders => (
  Object.entries(headers).reduce(
    (acc: Record<string, string | string[]>, [key, value]) => {
      if (value === undefined) return acc;
      const headerKey = key.toLowerCase();
      const nextValue = Array.isArray(value)
        ? value.map((item) => String(item))
        : String(value);
      return { ...acc, [headerKey]: nextValue };
    },
    {},
  )
);

type ProxyBody = string | Buffer | Record<string, unknown>;
export const parseProxyBody = (body: Buffer, headers: IncomingMessage['headers']): ProxyBody => {
  const contentType = String(headers['content-type'] || '');
  const isJson = contentType.includes('application/json');
  if (!isJson) return body;

  try {
    return JSON.parse(body.toString('utf8')) as Record<string, unknown>;
  } catch {
    return body.toString('utf8');
  }
};

export const applyProxyResultToRequest = (req: Request, res: Response, result: ProxyResult) => {
  const upstreamHeaders = normalizeProxyHeaders(result.headers);
  req.body = parseProxyBody(result.body, result.headers);
  req.headers = { ...req.headers, ...upstreamHeaders };
  res.statusCode = result.statusCode;
  Object.entries(upstreamHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
};

export const collectProxyResult = (proxyResponse: IncomingMessage): Promise<ProxyResult> => {
  const chunks: Buffer[] = [];
  proxyResponse.on('data', (chunk: Buffer) => chunks.push(chunk));
  return new Promise((resolve, reject) => {
    proxyResponse.on('error', (error: Error) => reject(error));
    proxyResponse.on('aborted', () => reject(new Error('Upstream response aborted.')));
    proxyResponse.on('end', () => resolve({
      statusCode: proxyResponse.statusCode || 500,
      headers: proxyResponse.headers,
      body: Buffer.concat(chunks),
    }));
  });
};

