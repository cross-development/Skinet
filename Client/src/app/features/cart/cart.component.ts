import { Component } from '@angular/core';
import { CartItemComponent } from './cart-item/cart-item.component';
import { CartService } from '../../core/services/cart.service';
import { CartItem } from '../../shared/models/cart';
import { OrderSummaryComponent } from '../../shared/components/order-summary/order-summary.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CartItemComponent, OrderSummaryComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  public cartItems?: CartItem[];

  constructor(private readonly cartService: CartService) {
    this.cartItems = this.cartService.cart()?.items;
  }
}
