import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { Product } from '../../../shared/models/product';
import { ShopService } from '../../../core/services/shop.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CurrencyPipe, MatButton, MatIcon, MatFormField, MatInput, MatLabel, MatDivider, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
  private shopService: ShopService = inject(ShopService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private cartService: CartService = inject(CartService);

  public product?: Product;
  public quantityInCart: number = 0;
  public quantity: number = 1;

  public ngOnInit(): void {
    this.loadProduct();
  }

  public updateCart(): void {
    if (!this.product) return;

    if (this.quantity > this.quantityInCart) {
      const itemsToAdd = this.quantity - this.quantityInCart;
      this.quantityInCart += itemsToAdd;

      this.cartService.addItemToCart(this.product, itemsToAdd);
    } else {
      const itemsToRemove = this.quantityInCart - this.quantity;
      this.quantityInCart -= itemsToRemove;

      this.cartService.removeItemFromCart(this.product.id, itemsToRemove);
    }
  }

  public getButtonText(): string {
    return this.quantityInCart > 0 ? 'Update cart' : 'Add to cart';
  }

  private updateProductQuantity(): void {
    const currentProduct = this.cartService.cart()?.items.find(item => item.productId === this.product?.id);

    this.quantityInCart = currentProduct?.quantity || 0;
    this.quantity = this.quantityInCart || 1;
  }

  private loadProduct(): void {
    const productId = this.activatedRoute.snapshot.paramMap.get('id');

    if (!productId) return;

    this.shopService.getProduct(Number(productId)).subscribe({
      next: product => {
        this.product = product;

        this.updateProductQuantity();
      },
      error: error => console.log(error),
    });
  }
}
