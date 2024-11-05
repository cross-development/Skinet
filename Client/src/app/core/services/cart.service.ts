import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, Observable, tap } from 'rxjs';
import { Product } from '../../shared/models/product';
import { Cart, CartItem, Coupon } from '../../shared/models/cart';
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

    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let discount = 0;

    if (cart.coupon) {
      if (cart.coupon.amountOff) {
        discount = cart.coupon.amountOff;
      } else if (cart.coupon.percentOff) {
        discount = subtotal * (cart.coupon.percentOff / 100);
      }
    }

    const shipping = delivery ? delivery.price : 0;
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

  public setCart(cart: Cart): Observable<Cart> {
    return this.httpClient
      .post<Cart>(environment.apiUrl + 'cart', cart)
      .pipe(tap(cart => this.cart.set(cart)));
  }

  public async addItemToCart(item: CartItem | Product, quantity: number = 1): Promise<void> {
    const cart = this.cart() ?? this.createCart();

    if (this.isProduct(item)) {
      item = this.mapProductToCartItem(item);
    }

    cart.items = this.addOrUpdateItem(cart.items, item, quantity);

    await firstValueFrom(this.setCart(cart));
  }

  public async removeItemFromCart(productId: number, quantity = 1): Promise<void> {
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
      await firstValueFrom(this.setCart(cart));
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

  public applyDiscount(code: string): Observable<Coupon> {
    return this.httpClient.get<Coupon>(environment.apiUrl + 'coupons/' + code);
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
