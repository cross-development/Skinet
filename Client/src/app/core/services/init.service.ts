import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable, of, tap } from 'rxjs';
import { CartService } from './cart.service';
import { AccountService } from './account.service';
import { SignalrService } from './signalr.service';
import { Cart } from '../../shared/models/cart';
import { User } from '../../shared/models/user';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private cartService: CartService = inject(CartService);
  private signalrService: SignalrService = inject(SignalrService);
  private accountService: AccountService = inject(AccountService);

  public init(): Observable<{ cart: Cart | null; user: User }> {
    const cartId = localStorage.getItem('cart_id');
    const cart$ = cartId ? this.cartService.getCart(cartId) : of(null);

    return forkJoin({
      cart: cart$,
      user: this.accountService.getUserInfo().pipe(
        tap({
          next: user => {
            if (user) {
              this.signalrService.createHubConnection();
            }
          },
        }),
      ),
    });
  }
}
