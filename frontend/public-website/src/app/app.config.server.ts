import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, RenderMode, ServerRoute, withRoutes } from '@angular/ssr';

import { appConfig } from './app';
import { API_BASE_URL } from './core/api-base-url.token';

const serverRoutes: ServerRoute[] = [
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server }
];
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
