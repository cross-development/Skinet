import { Component, inject, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardActions, MatCardContent } from '@angular/material/card';
import { Product } from '../../../shared/models/product';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [MatCard, MatCardContent, MatCardActions, MatIcon, CurrencyPipe, RouterLink],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.scss',
})
export class ProductItemComponent {
  @Input() product?: Product;

  private cartService: CartService = inject(CartService);

  public addItemToCart(product: Product): void {
    this.cartService.addItemToCart(product);
  }
}
