/* eslint-disable no-console */
import { Readable } from 'stream';
import {
  create, store, deleteItem,
  exists, getItem, status,
} from './storage';

export type Idempotency = {
  ttl?: number;
  enforced?: boolean;
  headerKey?: string;
  /* @TODO: This feature will be removed */
  validateResponse?: CallableFunction;
};

const getContentToStore = (response: any, chunks: any) => {
  const { statusCode } = response;
  const headers = {
    'content-type': 'application/json',
    ...response.getHeaders(),
  };
  const content = {
    statusCode,
    headers,
    chunks,
  };
  return content;
};

const parseBody = (chunks: any): Record<string, any> => {
  const decoded = Buffer.from(chunks.join('')).toString('utf8');
  try {
    return JSON.parse(decoded);
  } catch (error: any) {
    const { message } = error;
    console.error(`[ERROR] API - ${message}`);
    return {};
  }
};

/**
 * Validate the rsponse content, by default it validate the HTTP Status Code (200, 201),
 * but in some case, the response is not only validated by status code, so we can
 * inject the callback function with maniplucated content as parameter. The callback function
 * returns boolean value indicate if the response is success or not.
 */
const isSuccessResponse = (
  content: any,
  validateResponse: CallableFunction|false = false,
): boolean => {
  const { statusCode, chunks } = content;
  const isSuccess = (statusCode === 200 || statusCode === 201);

  if (!validateResponse) return isSuccess;
  const body = parseBody(chunks);
  return isSuccess && validateResponse({ ...content, body });
};

/**
 * Handles the streaming between middleware
 * @param {Response} res - ExpressJS HTTP Response object
 * @param {NextFuction} next - ExpressJS next function
 * @param {Object} props - Injected properties
 */
const handleResponse = (res: any, next: any, props: any = {}) => {
  const { idempotencyKey,  validateResponse } = props;
  create(idempotencyKey);

  const [oldWrite, oldEnd] = [res.write, res.end];
  const chunks: Buffer[] = [];

  (res.write as unknown) = function(chunk: any) {
    chunks.push(Buffer.from(chunk));
    (oldWrite as Function).apply(res, arguments);
  };

  res.end = function(chunk: any) {
    if (chunk) chunks.push(Buffer.from(chunk));
    const content = getContentToStore(res, chunks);
    const success = isSuccessResponse(content, validateResponse);
    if (success) store(idempotencyKey, content);
    else deleteItem(idempotencyKey);
    (oldEnd as Function).apply(res, arguments);
  };

  return next();
};

/*
 * Writes the saved response back to the client, this write only
 * just the content, but also the previous response headers. This
 * to make sure the content is written back to the client is exactly
 * the same as the result.
 */
function writeResponse(res: any, item: any) {
  const { chunks, headers, statusCode } = item.response;
  res.writeHeader(statusCode, {
    'content-type': 'application/json',
    'cached-source': 'cache/idempotency',
    ...headers,
  });
  return Readable.from(chunks).pipe(res);
};

export default function idempotency(props: Idempotency = {}) {
  const { 
    headerKey = 'idempotency-key',
    enforced = false,
    ttl = (60 * 5),
    validateResponse = false,
  } = props;

  return (req: any, res: any, next: any) => {
    const { headers, method = 'GET' } = req;
    if (method.toUpperCase() !== 'POST') return next();

    const idempotencyKey = headers[headerKey] || false;
    if (!enforced && !idempotencyKey) return next();

    if (enforced && !idempotencyKey) {
      return res.status(422).json({
        message: 'Idempotency key required for this request',
        error: true,
      });
    }

    if (!idempotencyKey) return next();

    if (!exists(idempotencyKey)) return handleResponse(res, next, {
      idempotencyKey,
      validateResponse,
    });

    const item = getItem(idempotencyKey);
    const { createdAt } = item;
    const now  = new Date();
    const timelapse: number = Math.ceil((now.valueOf() - createdAt.valueOf()) / 1000);

    if (timelapse > ttl) {
      return res.status(410).json({
        message: 'Request using this idempotency key has expired.',
      });
    }

    if (item.status === status.IN_PROGERSS) {
      return res.status(202).json({
        at: new Date(),
        message: 'Processing',
      });
    }

    if (item.status === status.DONE) return writeResponse(res, item);

    return next();
  };
}
