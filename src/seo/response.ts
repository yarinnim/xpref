import path from 'path';
import type { Request, Response, SeoData } from '../types';

const readResPayload = (req: Request): any => {
  const payload = req.body;
  console.log({ payload });
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid Application Request');
  }
  return payload;
};

const getTemplatePath = (props: any): string => {
  const templatePath = props.templatePath || '';
  if (templatePath !== '') return templatePath;
  return path.join(__dirname, 'seo.template.ejs');
};

const getSeoProps = (req: Request, dataHandler: CallableFunction): Promise<SeoData> => {
  const data = readResPayload(req);
  if (!(data || false)) throw new Error('Invalid Response.');

  const result = dataHandler(data, req);
  if (result instanceof Promise) return result.then((value: any) => value);
  return Promise.resolve(result);
};

export default function onResFinish(req: Request, res: Response, props: any) {
  return () => {
    return getSeoProps(req, props.onData)
      .then((payload: SeoData) => {
        const templatePath = getTemplatePath(props);
        res.removeHeader('content-type');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');

        res.render(templatePath, {
          title: payload.title,
          description: payload.description,
          canonicalUrl: payload.canonicalUrl,
          mediaType: payload.mediaType,
          imageUrl: payload.imageUrl,
          siteName: 'props.siteName,',
          redirectUrlJson: JSON.stringify(payload.canonicalUrl),
        });
      })
      .catch((error: any) => {
        const { message } = error;
        return res.status(400).json({ message });
      });
  };
}
