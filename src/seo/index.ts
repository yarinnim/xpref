import path from 'path';
import type { Request, Response, NextFunction } from '../types';
import type { SeoProps, SeoData } from './types';

const isValidCrawler = (req: Request) => {
  const strBool = String(req.headers['is-certified-crawler'] || '');
  return strBool.trim() === 'true';
};

const getTemplatePath = (props: any): string => {
  const templatePath = props.templatePath || '';
  if (templatePath !== '') return templatePath;
  return path.join(__dirname, 'seo.template.ejs');
};

const touchData = (data: any): SeoData => ({
  siteName: data.siteName,
  title: data.title,
  description: data.description,
  imageUrl: data.imageUrl,
  mediaType: data.mediaType,

  canonicalUrl: 'data.canonicalUrl',
  redirectUrlJson: JSON.stringify('payload.canonicalUrl'),
  template: 'test',
});

/*
const getSeoData = (req: Request, data: any, dataHandler: any): Promise<SeoData> => {
  const result = dataHandler(data, req);
  if (result instanceof Promise) return result.then((value: any) => value);
  return Promise.resolve(result);
};
 */

export default function seoMiddleware(props: SeoProps) {
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

    const originalJson = res.json.bind(res);

    (res as any).json = async function(resData: any) {
      const data = await props.onData(resData, req);
      const templateData = touchData({ 
        siteName: props.site.name,
        ...data,
      });

      const templatePath = getTemplatePath(props);
      res.render(templatePath, templateData, (err: any, html: any) => {
        if (err) {
          const { message } = err;
          return originalJson({ error: 'Template missing', data, message });
        }
        res.send(html);
      });
    };
    next();
  };
}
