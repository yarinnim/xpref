import path from 'path';
import type { Request, Response, NextFunction } from '../types';
import type { SeoProps } from './type';

/**
 * Reads track/SEO payload produced by /seo/music/play
 * (forwarder → music service, passToNext), not the client request body.
 */
const readSeoPayload = (req: Request): SeoProps => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid Application Request');
  }
  return payload as SeoProps;
};

/**
 * Validates crawler requests and renders EJS from the upstream
 * track JSON (set by a passToNext forwarder on the same route).
 *
 * Flow:
 *   client → forwarder(music, passToNext) → seoMiddleware → client
 *   - crawler: render EJS HTML
 *   - otherwise: next() so the route action can return track JSON
 *
 * @example
 * // Crawler: GET /seo/music/play?id=PUBLIC_ID → HTML
 * // Client:  GET /seo/music/play?id=PUBLIC_ID → JSON track detail
 */
const isValidCrawler = (req: Request) => {
  const strBool = String(req.headers['is-certified-crawler'] || '');
  return strBool.trim() === 'true';
};

const getTemplatePath = (props: any): string => {
  const templatePath = props.templatePath || '';
  if (templatePath !== '') return templatePath;
  return path.join(__dirname, 'seo.template.ejs');
};

type SeoProxyProps = {
  templatePath?: string;
};

export default function prepareTemplate(props: SeoProxyProps = {}) {
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

    let payload: SeoProps;
    try {
      payload = readSeoPayload(req);
    } catch {
      return res.status(400).json({ message: 'Invalid request.' });
    }

    const templatePath = getTemplatePath(props);
    res.removeHeader('content-type');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    return res.status(200).render(templatePath, {
      title: payload.title,
      description: payload.description ?? '',
      canonicalUrl: payload.canonicalUrl,
      mediaType: payload.mediaType ?? 'website',
      siteName: payload.siteName,
      imageUrl: payload.imageUrl,
      redirectUrlJson: JSON.stringify(payload.canonicalUrl),
    });
  };
}
