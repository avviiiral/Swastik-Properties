import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent, appConfig } from './app/app';

bootstrapApplication(AppComponent, appConfig).catch((error: unknown) => {
  console.error('Unable to start Swastik Properties.', error);
});
