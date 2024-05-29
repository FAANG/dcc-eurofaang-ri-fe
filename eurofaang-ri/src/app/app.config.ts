import {ApplicationConfig, importProvidersFrom, Provider} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors} from "@angular/common/http";
import {TokenInterceptor} from "./interceptor/token.interceptor";
import { PermissionsService } from "./auth.guard";



// @ts-ignore
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    importProvidersFrom(),
    provideHttpClient(withFetch(), withInterceptors([TokenInterceptor])),
    PermissionsService
  ]
};
