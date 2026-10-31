import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse
} from '@angular/ssr/node';
import express from 'express';

const server = express();
const angularApp = new AngularNodeAppEngine();

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
