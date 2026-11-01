import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse
} from '@angular/ssr/node';
import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const server = express();
const angularApp = new AngularNodeAppEngine();
const browserDistFolder = join(dirname(fileURLToPath(import.meta.url)), '../browser');

// Serve the browser build before SSR so JS, CSS, public assets and robots.txt
// are returned as static files rather than falling through to the Angular router.
server.disable('x-powered-by');
server.use(express.static(browserDistFolder, {
  maxAge: '1y',
  index: false,
  redirect: false,
  immutable: true
}));

server.use((request, response, next) => {
  angularApp.handle(request)
    .then(result => result ? writeResponseToNodeResponse(result, response) : next())
    .catch(next);
});

if (isMainModule(import.meta.url)) {
  const port = Number(process.env['PORT'] ?? 4000);
  server.listen(port, () => console.log('Swastik public website listening on port ' + port));
}

export const reqHandler = createNodeRequestHandler(server);
