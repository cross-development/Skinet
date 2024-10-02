import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CartService } from './cart.service';
import { Cart } from '../../shared/models/cart';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private cartService: CartService = inject(CartService);

  public init(): Observable<Cart> | Observable<null> {
    const cartId = localStorage.getItem('cart_id');
    const cart$ = cartId ? this.cartService.getCart(cartId) : of(null);

    return cart$;
  }
}
