import { Component, inject, input, InputSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { CartItem } from '../../../shared/models/cart';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [RouterLink, MatButton, MatIcon, CurrencyPipe],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss',
})
export class CartItemComponent {
  private cartService: CartService = inject(CartService);

  public item: InputSignal<CartItem> = input.required<CartItem>();

  public incrementQuantity(): void {
    this.cartService.addItemToCart(this.item());
  }

  public decrementQuantity(): void {
    this.cartService.removeItemFromCart(this.item().productId);
  }

  public removeItemFromCart(): void {
    this.cartService.removeItemFromCart(this.item().productId, this.item().quantity);
  }
}
