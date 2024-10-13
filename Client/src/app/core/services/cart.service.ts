import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, Subscription } from 'rxjs';
import { Product } from '../../shared/models/product';
import { Cart, CartItem } from '../../shared/models/cart';
import { ProductTotals } from '../../shared/models/productTotals';
import { DeliveryMethod } from '../../shared/models/deliveryMethod';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private httpClient: HttpClient = inject(HttpClient);

  public cart: WritableSignal<Cart | null> = signal<Cart | null>(null);
  public selectedDelivery: WritableSignal<DeliveryMethod | null> = signal<DeliveryMethod | null>(null);
  public itemCount: Signal<number | undefined> = computed(() => {
    return this.cart()?.items.reduce((sum, item) => sum + item.quantity, 0);
  });
  public totals: Signal<ProductTotals | null> = computed(() => {
    const cart = this.cart();
    const delivery = this.selectedDelivery();

    if (!cart) return null;

    const shipping = delivery ? delivery.price : 0;
    const discount = 0;
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + shipping - discount;

    return { subtotal, shipping, discount, total };
  });

  public getCart(id: string): Observable<Cart> {
    return this.httpClient.get<Cart>(environment.apiUrl + 'cart?id=' + id).pipe(
      map(cart => {
        this.cart.set(cart);

        return cart;
      }),
    );
  }

  public setCart(cart: Cart): Subscription {
    return this.httpClient.post<Cart>(environment.apiUrl + 'cart', cart).subscribe({
      next: cart => this.cart.set(cart),
    });
  }

  public addItemToCart(item: CartItem | Product, quantity: number = 1): void {
    const cart = this.cart() ?? this.createCart();

    if (this.isProduct(item)) {
      item = this.mapProductToCartItem(item);
    }

    cart.items = this.addOrUpdateItem(cart.items, item, quantity);

    this.setCart(cart);
  }

  public removeItemFromCart(productId: number, quantity = 1): void {
    const cart = this.cart();

    if (!cart) return;

    const index = cart.items.findIndex(item => item.productId === productId);

    if (index === -1) return;

    if (cart.items[index].quantity > quantity) {
      cart.items[index].quantity -= quantity;
    } else {
      cart.items.splice(index, 1);
    }

    if (cart.items.length === 0) {
      this.deleteCart();
    } else {
      this.setCart(cart);
    }
  }

  public deleteCart(): void {
    this.httpClient.delete(environment.apiUrl + 'cart?id=' + this.cart()?.id).subscribe({
      next: () => {
        localStorage.removeItem('cart_id');

        this.cart.set(null);
      },
    });
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
