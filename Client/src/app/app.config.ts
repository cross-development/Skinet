import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { lastValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { InitService } from './core/services/init.service';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([errorInterceptor, loadingInterceptor])),
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [InitService],
      useFactory: (initService: InitService) => {
        return () =>
          lastValueFrom(initService.init()).finally(() => {
            const splash = document.getElementById('initial-splash');

            if (splash) {
              splash.remove();
            }
          });
      },
    },
  ],
};
