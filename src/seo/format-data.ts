/* eslint-disable no-unused-vars */
import type { RequestHandler } from 'express';
import type { Request, Response } from '../types';
import type { SeoData } from './types';

type OnResonseCallback = (responseData: any, req: Request) => SeoData;

const getSeoData = (data: any, dataHandler: any, req: Request) => {
  const result = dataHandler(data, req);
  if (result instanceof Promise) return result.then((value: any) => value);
  return Promise.resolve(result);
};

export default function formatData(callback: OnResonseCallback): RequestHandler {
  return (req: Request, res: Response) => {
    const { body } = req;
    return getSeoData(body, callback, req).then(res.json);
  };
}
