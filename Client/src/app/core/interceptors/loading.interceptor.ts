import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { delay, finalize } from 'rxjs';
import { BusyService } from '../services/busy.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const busyService: BusyService = inject(BusyService);

  busyService.busy();

  return next(req).pipe(delay(500), finalize(busyService.idle));
};
