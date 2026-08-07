import { resolve } from 'path';
import { static as staticPath, type Application } from 'express';

export default function registerStatic(app: Application, staticRoutes: any = {}) {
  const keys = Object.keys(staticRoutes);
  keys.forEach((path: string) => {
    const location = resolve(staticRoutes[path]);
    app.use(path, staticPath(location));
  });
}
