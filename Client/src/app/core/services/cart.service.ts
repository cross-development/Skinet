import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Product } from '../../shared/models/product';
import { Cart, CartItem } from '../../shared/models/cart';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private httpClient: HttpClient = inject(HttpClient);

  public cart = signal<Cart | null>(null);

  public getCart(id: string): Subscription {
    return this.httpClient.get<Cart>(environment.apiUrl + 'cart?id=' + id).subscribe({
      next: cart => this.cart.set(cart),
    });
  }

  public setCart(cart: Cart): Subscription {
    return this.httpClient.post<Cart>(environment.apiUrl + 'cart', cart).subscribe({
      next: cart => this.cart.set(cart),
    });
  }

  public addItemToCart(item: CartItem | Product, quantity: number = 1) {
    const cart = this.cart() ?? this.createCart();

    if (this.isProduct(item)) {
      item = this.mapProductToCartItem(item);
    }

    cart.items = this.addOrUpdateItem(cart.items, item, quantity);

    this.setCart(cart);
  }

  private isProduct(item: CartItem | Product): item is Product {
    return (item as Product).id !== undefined;
  }

  private createCart(): Cart {
    const cart = new Cart();

    localStorage.setItem('cart_id', cart.id);

    return cart;
  }

  private mapProductToCartItem(item: Product): CartItem {
    return {
      productId: item.id,
      productName: item.name,
      price: item.price,
      quantity: 0,
      pictureUrl: item.pictureUrl,
      brand: item.brand,
      type: item.type,
    };
  }

  private addOrUpdateItem(items: CartItem[], item: CartItem, quantity: number): CartItem[] {
    const index = items.findIndex(i => i.productId === item.productId);

    if (index === -1) {
      item.quantity = quantity;
      items.push(item);
    } else {
      items[index].quantity += quantity;
    }

    return items;
  }
}
