import path from 'path';
import type { SeoProps, Request, Response, NextFunction } from '../types';
import onResFinish from './response';

const isValidCrawler = (req: Request) => {
  const strBool = String(req.headers['is-certified-crawler'] || '');
  return strBool.trim() === 'true';
};

export default function seoMiddleware(props: SeoProps) {
  return (req: Request, res: any, next: NextFunction) => {
    if (req.method === 'OPTIONS') return next();
    if (req.method !== 'GET') return next();
    if (!isValidCrawler(req)) return next();

    const statusCode = Number(res.statusCode || 200);
    if (statusCode >= 400) {
      const message = (req.body as { message?: string })?.message
        || 'Something goes wrong.';
      return res.status(statusCode).json({ message });
    }

    // res.on('finish', onResFinish(req, res, props));
    //
    const originalJson = res.json.bind(res);

    res.json = function (data: any) {
      // Map '/seo/music' -> 'seo/music' template path
      const templatePath = path.join(__dirname, 'seo/seo.template.ejs');
      console.log({ templatePath });

      res.render(templatePath, { seoData: data }, (err: any, html: any) => {
        if (err) {
          console.error('EJS Error:', err.message);
          return originalJson({ error: 'Template missing', data });
        }
        res.send(html);
      });
    };
    next();
  };
}
