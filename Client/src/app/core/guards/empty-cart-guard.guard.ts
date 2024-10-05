import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { SnackbarService } from '../services/snackbar.service';

export const emptyCartGuardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const cartService = inject(CartService);
  const snackbarService = inject(SnackbarService);

  if (!cartService.cart() || !cartService.cart()?.items.length) {
    snackbarService.error('Your cart is empty');
    router.navigateByUrl('/cart');

    return false;
  }

  return true;
};
