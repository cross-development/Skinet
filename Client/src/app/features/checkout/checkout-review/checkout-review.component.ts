import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../../shared/models/cart';

@Component({
  selector: 'app-checkout-review',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './checkout-review.component.html',
  styleUrl: './checkout-review.component.scss',
})
export class CheckoutReviewComponent {
  private cartService: CartService = inject(CartService);

  public cartItems?: CartItem[] = this.cartService.cart()?.items;
}
