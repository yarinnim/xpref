import path from 'path';
import type { Request, Response, NextFunction } from '../types';
import type { SeoProps } from './type';

const readResPayload = (req: Request): any => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid Application Request');
  }
  return payload;
};

const isValidCrawler = (req: Request) => {
  const strBool = String(req.headers['is-certified-crawler'] || '');
  return strBool.trim() === 'true';
};

const getTemplatePath = (props: any): string => {
  const templatePath = props.templatePath || '';
  if (templatePath !== '') return templatePath;
  return path.join(__dirname, 'seo.template.ejs');
};

const getSeoProps = (req: Request, dataHandler: CallableFunction): Promise<SeoProps> => {
  const data = readResPayload(req);
  if (!(data || false)) throw new Error('Invalid Response.');

  const result = dataHandler(data, req);
  if (result instanceof Promise) return result.then((value: any) => value);
  return Promise.resolve(result);
};

type SeoProxyProps = {
  siteName: string,
  templatePath?: string,
};

/* eslint-disable-next-line no-unused-vars */
type CallbackData = (data: any, req?: Request) => SeoProps | Promise<SeoProps>;

export default function prepareTemplate(props: SeoProxyProps, onData: CallbackData) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') return next();
    if (req.method !== 'GET') return next();
    if (!isValidCrawler(req)) return next();

    const statusCode = Number(res.statusCode || 200);
    if (statusCode >= 400) {
      const message = (req.body as { message?: string })?.message
        || 'Something goes wrong.';
      return res.status(statusCode).json({ message });
    }

    return getSeoProps(req, onData)
      .then((payload: SeoProps) => {
        const templatePath = getTemplatePath(props);
        res.removeHeader('content-type');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');

        return res.status(200).render(templatePath, {
          title: payload.title,
          description: payload.description,
          canonicalUrl: payload.canonicalUrl,
          mediaType: payload.mediaType,
          imageUrl: payload.imageUrl,
          siteName: props.siteName,
          redirectUrlJson: JSON.stringify(payload.canonicalUrl),
        });
      })
      .catch((error: any) => {
        const { message } = error;
        return res.status(400).json({ message });
      });
  };
}
