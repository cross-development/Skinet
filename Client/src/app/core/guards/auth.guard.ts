import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, of } from 'rxjs';
import { AccountService } from '../services/account.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const accountService = inject(AccountService);

  if (accountService.currentUser()) {
    return of(true);
  }

  return accountService.getAuthState().pipe(
    map(auth => {
      if (auth.isAuthenticated) {
        return true;
      }

      router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }),
  );
};
