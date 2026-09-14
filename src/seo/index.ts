import path from 'path';
import type { Request, Response, NextFunction } from '../types';
import type { SeoProps, SeoData, OpenGraphType } from './types';

const OPEN_GRAPH_TYPES = new Set<OpenGraphType>([
  'website',
  'article',
  'product',
  'profile',
  'music.song',
  'music.album',
  'music.playlist',
  'music.radio_station',
  'video.movie',
  'video.episode',
  'video.tv_show',
  'video.other',
]);

const isValidCrawler = (req: Request) => {
  const strBool = String(req.headers['is-certified-crawler'] || '');
  return strBool.trim() === 'true';
};

const getTemplatePath = (props: any): string => {
  const templatePath = props.templatePath || '';
  if (templatePath !== '') return templatePath;
  return path.join(__dirname, 'seo.template.ejs');
};

/** Sub-template filename matches Open Graph mediaType (e.g. video.movie → templates/video.movie.ejs). */
const getSubTemplate = (mediaType?: string): OpenGraphType => {
  if (mediaType && OPEN_GRAPH_TYPES.has(mediaType as OpenGraphType)) {
    return mediaType as OpenGraphType;
  }
  return 'website';
};

const touchData = (data: any): SeoData => {
  const mediaType = getSubTemplate(data.mediaType);
  const canonicalUrl = data.canonicalUrl || '';

  return {
    ...data,
    siteName: data.siteName,
    title: data.title,
    description: data.description,
    imageUrl: data.imageUrl,
    mediaType,
    canonicalUrl,
    redirectUrlJson: JSON.stringify(canonicalUrl),
    template: mediaType,
  };
};

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
      const templateData = touchData({
        siteName: props.site.name,
        ...resData,
      });

      const templatePath = getTemplatePath(props);
      res.render(templatePath, templateData, (err: any, html: any) => {
        if (err) {
          const { message } = err;
          return originalJson({ error: 'Template missing', resData, message });
        }
        res.send(html);
      });
    };
    next();
  };
}

export * from './types';
export { default as formatData } from './format-data';
