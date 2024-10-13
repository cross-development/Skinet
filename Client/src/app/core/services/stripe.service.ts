import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, Observable } from 'rxjs';
import {
  loadStripe,
  Stripe,
  StripeAddressElement,
  StripeAddressElementOptions,
  StripeElements,
} from '@stripe/stripe-js';
import { CartService } from './cart.service';
import { AccountService } from './account.service';
import { Cart } from '../../shared/models/cart';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private stripeElements?: StripeElements;
  private addressElement?: StripeAddressElement;
  private stripePromise: Promise<Stripe | null>;
  private httpClient: HttpClient = inject(HttpClient);
  private cartService: CartService = inject(CartService);
  private accountService: AccountService = inject(AccountService);

  constructor() {
    this.stripePromise = loadStripe(environment.stripePublicKey);
  }

  public getStripeInstance(): Promise<Stripe | null> {
    return this.stripePromise;
  }

  public async initializeStripeElements(): Promise<StripeElements | undefined> {
    if (!this.stripeElements) {
      const stripe = await this.getStripeInstance();

      if (stripe) {
        const cart = await firstValueFrom(this.createOrUpdatePaymentIntent());

        this.stripeElements = stripe.elements({
          clientSecret: cart.clientSecret,
          appearance: { labels: 'floating' },
        });
      } else {
        throw new Error('Stripe has not been loaded');
      }
    }

    return this.stripeElements;
  }

  public async createAddressElement(): Promise<StripeAddressElement | undefined> {
    if (!this.addressElement) {
      const elements = await this.initializeStripeElements();

      if (elements) {
        const user = this.accountService.currentUser();

        const defaultValues: StripeAddressElementOptions['defaultValues'] = {};

        if (user) {
          defaultValues.name = `${user.firstName} ${user.lastName}`;
        }

        if (user?.address) {
          defaultValues.address = {
            line1: user.address.line1,
            line2: user.address.line2,
            city: user.address.city,
            state: user.address.state,
            country: user.address.country,
            postal_code: user.address.postalCode,
          };
        }

        const options: StripeAddressElementOptions = {
          mode: 'shipping',
          defaultValues,
        };

        this.addressElement = elements.create('address', options);
      }
    } else {
      throw new Error('Elements instance has not been loaded');
    }

    return this.addressElement;
  }

  public createOrUpdatePaymentIntent(): Observable<Cart> {
    const cart = this.cartService.cart();

    if (!cart) {
      throw new Error('Problem with cart');
    }

    return this.httpClient.post<Cart>(environment.apiUrl + 'payment/' + cart.id, {}).pipe(
      map(cart => {
        this.cartService.setCart(cart);

        return cart;
      }),
    );
  }

  public disposeElements(): void {
    this.stripeElements = undefined;
    this.addressElement = undefined;
  }
}
