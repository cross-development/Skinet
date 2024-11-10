import { inject } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { SnackbarService } from '../services/snackbar.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackbar = inject(SnackbarService);

  return next(req).pipe(
    catchError((errorResponse: HttpErrorResponse) => {
      if (errorResponse.status === 400) {
        if (errorResponse.error.errors) {
          const modelStateErrors = [];

          for (const key in errorResponse.error.errors) {
            if (errorResponse.error.errors[key]) {
              modelStateErrors.push(errorResponse.error.errors[key]);
            }
          }

          throw modelStateErrors.flat();
        } else {
          snackbar.error(errorResponse.error.title || errorResponse.error);
        }
      }

      if (errorResponse.status === 401) {
        snackbar.error(errorResponse.error.title || errorResponse.error);
      }

      if (errorResponse.status === 403) {
        snackbar.error('Forbidden');
      }

      if (errorResponse.status === 404) {
        router.navigateByUrl('/not-found');
      }

      if (errorResponse.status === 500) {
        const navigationExtras: NavigationExtras = {
          state: { error: errorResponse.error },
        };

        router.navigateByUrl('/server-error', navigationExtras);
      }

      return throwError(() => errorResponse);
    }),
  );
};
