import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, RenderMode, ServerRoute, withRoutes } from '@angular/ssr';

import { API_BASE_URL, appConfig } from './app';

const serverRoutes: ServerRoute[] = [{ path: '**', renderMode: RenderMode.Server }];
const serverOnlyConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: API_BASE_URL,
      useValue: process.env['BACKEND_API_URL'] ?? 'http://127.0.0.1:8000/api/v1'
    }
  ]
};

export const serverConfig = mergeApplicationConfig(appConfig, serverOnlyConfig);
