import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { CartService } from './cart.service';
import { AccountService } from './account.service';
import { Cart } from '../../shared/models/cart';
import { User } from '../../shared/models/user';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private cartService: CartService = inject(CartService);
  private accountService: AccountService = inject(AccountService);

  public init(): Observable<{ cart: Cart | null; user: User }> {
    const cartId = localStorage.getItem('cart_id');
    const cart$ = cartId ? this.cartService.getCart(cartId) : of(null);

    return forkJoin({
      cart: cart$,
      user: this.accountService.getUserInfo(),
    });
  }
}
